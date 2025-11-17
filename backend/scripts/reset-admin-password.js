/**
 * Script para resetear la contraseña del usuario admin
 * Uso: node scripts/reset-admin-password.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('===========================================');
    console.log('🔐 RESET DE CONTRASEÑA DE ADMINISTRADOR');
    console.log('===========================================\n');

    // Nueva contraseña
    const newPassword = 'Admin123!';
    const saltRounds = 10;

    console.log('📝 Generando hash de contraseña...');
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log(`✅ Hash generado: ${hashedPassword.substring(0, 20)}...\n`);

    // Buscar usuario admin
    console.log('🔍 Buscando usuario admin...');
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'admin' },
          { roleId: 1 } // ID del rol admin
        ]
      },
      include: {
        role: true
      }
    });

    if (!adminUser) {
      console.error('❌ ERROR: No se encontró ningún usuario administrador');
      console.log('\n💡 Creando nuevo usuario admin...');
      
      // Crear nuevo usuario admin
      const newAdmin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@gestion-scripts.com',
          password: hashedPassword,
          roleId: 1,
          active: true
        },
        include: {
          role: true
        }
      });

      console.log('\n✅ Usuario admin creado exitosamente:');
      console.log(`   👤 Username: ${newAdmin.username}`);
      console.log(`   📧 Email: ${newAdmin.email}`);
      console.log(`   🔑 Contraseña: ${newPassword}`);
      console.log(`   👑 Rol: ${newAdmin.role.name}`);
    } else {
      // Actualizar contraseña del admin existente
      console.log(`✅ Usuario encontrado: ${adminUser.username} (${adminUser.email})\n`);
      
      console.log('🔄 Actualizando contraseña...');
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { 
          password: hashedPassword,
          active: true // Asegurarse de que esté activo
        }
      });

      console.log('\n✅ Contraseña actualizada exitosamente:');
      console.log(`   👤 Username: ${adminUser.username}`);
      console.log(`   📧 Email: ${adminUser.email}`);
      console.log(`   🔑 Nueva Contraseña: ${newPassword}`);
      console.log(`   👑 Rol: ${adminUser.role.name}`);
    }

    console.log('\n===========================================');
    console.log('✅ PROCESO COMPLETADO');
    console.log('===========================================');
    console.log('\n💡 Ahora puedes iniciar sesión con:');
    console.log(`   Username: admin`);
    console.log(`   Password: ${newPassword}\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nDetalles del error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
resetAdminPassword();
