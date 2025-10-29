const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countScripts() {
  const count = await prisma.script.count();
  console.log('\n✅ Total de scripts en la base de datos:', count);
  await prisma.$disconnect();
}

countScripts();
