const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPartnerships() {
  try {
    // Check existing partnerships
    const partnerships = await prisma.brandPartnership.findMany({
      include: {
        brandA: { select: { name: true } },
        brandB: { select: { name: true } }
      }
    });
    
    console.log('Existing partnerships:', partnerships.length);
    partnerships.forEach(p => {
      console.log(`- ${p.brandA.name} <-> ${p.brandB.name}`);
    });
    
    // Get all DREAM CARD brands
    const dreamCardBrands = await prisma.brand.findMany({
      where: {
        OR: [
          { name: 'TERMINAL X' },
          { name: 'BILLABONG' },
          { name: 'LALINE' },
          { name: "THE CHILDREN'S PLACE" },
          { name: 'AERIE' },
          { name: 'AMERICAN EAGLE' },
          { name: 'MANGO' },
          { name: 'FOX HOME' }
        ]
      },
      select: { id: true, name: true }
    });
    
    console.log('\nDREAM CARD brands found:');
    dreamCardBrands.forEach(b => console.log(`- ${b.name} (${b.id})`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPartnerships();