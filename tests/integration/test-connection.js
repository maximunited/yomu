const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleTest() {
  try {
    console.log('Testing Prisma connection...');

    const userCount = await prisma.user.count();
    console.log(`Users in database: ${userCount}`);

    const benefitCount = await prisma.benefit.count();
    console.log(`Benefits in database: ${benefitCount}`);

    const brandCount = await prisma.brand.count();
    console.log(`Brands in database: ${brandCount}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleTest();
