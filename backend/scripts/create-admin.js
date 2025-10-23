require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n===========================================');
  console.log('   CREAR USUARIO ADMINISTRADOR INICIAL');
  console.log('===========================================\n');

  try {
    // Solicitar datos
    const username = await question('Username (mínimo 3 caracteres): ');
    
    if (!username || username.length < 3) {
      console.error('❌ El username debe tener al menos 3 caracteres');
      rl.close();
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      console.error(`❌ El usuario '${username}' ya existe`);
      rl.close();
      return;
    }

    const email = await question('Email (opcional, presiona Enter para omitir): ');
    const fullName = await question('Nombre completo (opcional): ');
    
    // Solicitar contraseña (en producción usar una librería para ocultar input)
    const password = await question('Contraseña (mínimo 8 caracteres): ');
    
    if (!password || password.length < 8) {
      console.error('❌ La contraseña debe tener al menos 8 caracteres');
      rl.close();
      return;
    }

    const passwordConfirm = await question('Confirmar contraseña: ');
    
    if (password !== passwordConfirm) {
      console.error('❌ Las contraseñas no coinciden');
      rl.close();
      return;
    }

    console.log('\n⏳ Creando usuario administrador...\n');

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear usuario administrador
    const admin = await prisma.user.create({
      data: {
        username,
        email: email || null,
        passwordHash,
        fullName: fullName || null,
        roleId: 1, // Admin
        isActive: true
      },
      include: {
        role: true
      }
    });

    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('===========================================');
    console.log(`ID: ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email || 'N/A'}`);
    console.log(`Nombre: ${admin.fullName || 'N/A'}`);
    console.log(`Rol: ${admin.role.name}`);
    console.log('===========================================\n');
    console.log('Ya puedes iniciar el servidor y hacer login con estas credenciales.\n');

  } catch (error) {
    console.error('❌ Error creando administrador:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Ejecutar
createAdmin();
