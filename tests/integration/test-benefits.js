const {
  createPrismaClient,
  disconnectPrisma,
} = require('../../scripts/prisma-client');

const prisma = createPrismaClient();

async function testBenefits() {
  try {
    console.log('Testing benefits...');

    const benefits = await prisma.benefit.findMany({
      include: {
        brand: true,
      },
    });

    console.log(`Found ${benefits.length} benefits:`);
    benefits.forEach((benefit) => {
      console.log(`- ${benefit.title} (${benefit.brand.name})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await disconnectPrisma();
  }
}

testBenefits();
