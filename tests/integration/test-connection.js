const {
  createPrismaClient,
  disconnectPrisma,
} = require('../../scripts/prisma-client');

const prisma = createPrismaClient();

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
    await disconnectPrisma();
  }
}

simpleTest();
