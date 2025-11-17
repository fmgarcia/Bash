/**
 * Script de diagnóstico de login
 * Verifica por qué falla el login del admin
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function diagnoseLogin() {
  try {
    console.log('===========================================');
    console.log('🔍 DIAGNÓSTICO DE LOGIN');
    console.log('===========================================\n');

    const username = 'admin';
    const password = 'Admin123!';

    // 1. Buscar usuario
    console.log('1️⃣ Buscando usuario:', username);
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado\n');
      process.exit(1);
    }

    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role ID:', user.roleId);
    console.log('   Role Name:', user.role?.name || 'N/A');
    console.log('   Is Active:', user.isActive);
    console.log('   Password Hash:', user.passwordHash?.substring(0, 20) + '...\n');

    // 2. Verificar estado activo
    console.log('2️⃣ Verificando estado activo...');
    if (!user.isActive) {
      console.log('❌ Usuario INACTIVO (is_active = false)\n');
      process.exit(1);
    }
    console.log('✅ Usuario activo\n');

    // 3. Verificar que passwordHash existe
    console.log('3️⃣ Verificando password hash...');
    if (!user.passwordHash) {
      console.log('❌ Password hash es NULL o vacío\n');
      process.exit(1);
    }
    console.log('✅ Password hash existe\n');

    // 4. Verificar formato del hash
    console.log('4️⃣ Verificando formato del hash...');
    if (!user.passwordHash.startsWith('$2b$')) {
      console.log('❌ Hash no tiene formato bcrypt correcto');
      console.log('   Esperado: $2b$10$...');
      console.log('   Actual:', user.passwordHash.substring(0, 30) + '...\n');
      process.exit(1);
    }
    console.log('✅ Hash tiene formato bcrypt correcto\n');

    // 5. Comparar contraseña
    console.log('5️⃣ Comparando contraseña...');
    console.log('   Password a probar:', password);
    console.log('   Hash en BD:', user.passwordHash);
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      console.log('❌ La contraseña NO coincide con el hash\n');
      
      // Probar otras contraseñas comunes
      console.log('🔍 Probando otras contraseñas comunes...');
      const commonPasswords = ['admin', 'Admin123', 'password', '123456', 'admin123'];
      
      for (const testPass of commonPasswords) {
        const match = await bcrypt.compare(testPass, user.passwordHash);
        if (match) {
          console.log(`✅ ¡La contraseña correcta es: "${testPass}"\n`);
          process.exit(0);
        }
      }
      
      console.log('❌ Ninguna contraseña común funcionó\n');
      process.exit(1);
    }

    console.log('✅ ¡Contraseña válida!\n');

    console.log('===========================================');
    console.log('✅ DIAGNÓSTICO COMPLETADO - TODO OK');
    console.log('===========================================');
    console.log('\nEl login DEBERÍA funcionar con:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}\n`);

  } catch (error) {
    console.error('\n❌ ERROR EN DIAGNÓSTICO:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseLogin();
