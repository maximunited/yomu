const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testBenefitDetail() {
  try {
    console.log("=== Testing Benefit Detail ===");

    // Get a benefit from the database
    const benefit = await prisma.benefit.findFirst({
      include: {
        brand: true,
      },
    });

    if (benefit) {
      console.log(`Benefit ID: ${benefit.id}`);
      console.log(`Title: ${benefit.title}`);
      console.log(`Brand: ${benefit.brand.name}`);
      console.log(`Validity Type: ${benefit.validityType}`);
      console.log(`URL: http://localhost:3000/benefit/${benefit.id}`);
    } else {
      console.log("No benefits found in database");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testBenefitDetail();
