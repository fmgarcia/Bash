const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function diagnose() {
  console.log('🔍 Diagnosticando endpoint de scripts...\n');

  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión a base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');

    // 2. Contar scripts
    console.log('2️⃣ Contando scripts en la base de datos...');
    const scriptCount = await prisma.script.count();
    console.log(`📊 Total de scripts: ${scriptCount}\n`);

    // 3. Verificar tablas relacionadas
    console.log('3️⃣ Verificando tablas relacionadas...');
    const userCount = await prisma.user.count();
    const listCount = await prisma.scriptList.count();
    const listItemCount = await prisma.scriptListItem.count();
    console.log(`👤 Usuarios: ${userCount}`);
    console.log(`📋 Listas: ${listCount}`);
    console.log(`🔗 Items en listas: ${listItemCount}\n`);

    // 4. Intentar query básico
    console.log('4️⃣ Intentando query básico de scripts...');
    const basicScripts = await prisma.script.findMany({
      take: 5
    });
    console.log(`✅ Query básico exitoso: ${basicScripts.length} scripts`);
    if (basicScripts.length > 0) {
      console.log(`   Primer script: ${basicScripts[0].name}\n`);
    }

    // 5. Intentar query con relaciones (como el endpoint)
    console.log('5️⃣ Intentando query con relaciones...');
    const scriptsWithRelations = await prisma.script.findMany({
      where: {},
      include: {
        creatorUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        updaterUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      },
      take: 5
    });
    console.log(`✅ Query con creatorUser/updaterUser exitoso: ${scriptsWithRelations.length} scripts\n`);

    // 6. Intentar query con scriptListItems (la parte más compleja)
    console.log('6️⃣ Intentando query con scriptListItems...');
    const testUserId = 1; // Admin
    const scriptsWithLists = await prisma.script.findMany({
      where: {},
      include: {
        creatorUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        updaterUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        scriptListItems: {
          where: {
            list: {
              userId: testUserId
            }
          },
          select: {
            listId: true
          }
        }
      },
      take: 5
    });
    console.log(`✅ Query completo exitoso: ${scriptsWithLists.length} scripts\n`);

    // 7. Mostrar estructura de un script
    if (scriptsWithLists.length > 0) {
      console.log('7️⃣ Estructura del primer script:');
      console.log(JSON.stringify(scriptsWithLists[0], null, 2));
    }

    console.log('\n✅ DIAGNÓSTICO COMPLETADO - TODO OK');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n📋 Stack trace:');
    console.error(error.stack);
    
    if (error.code) {
      console.error(`\n🔑 Código de error: ${error.code}`);
    }
    
    if (error.meta) {
      console.error('\n📊 Metadata del error:');
      console.error(JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
