const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBenefits() {
  try {
    console.log('Testing benefits...');
    
    const benefits = await prisma.benefit.findMany({
      include: {
        brand: true
      }
    });
    
    console.log(`Found ${benefits.length} benefits:`);
    benefits.forEach(benefit => {
      console.log(`- ${benefit.title} (${benefit.brand.name})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBenefits(); 