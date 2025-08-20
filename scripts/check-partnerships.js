const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkPartnerships() {
  try {
    // Check existing partnerships
    const partnerships = await prisma.brandPartnership.findMany({
      include: {
        brandA: { select: { name: true } },
        brandB: { select: { name: true } },
      },
    });

    console.log("Existing partnerships:", partnerships.length);
    partnerships.forEach((p) => {
      console.log(`- ${p.brandA.name} <-> ${p.brandB.name}`);
    });

    // Get all DREAM CARD brands
    const dreamCardBrands = await prisma.brand.findMany({
      where: {
        OR: [
          { name: "Terminal X" },
          { name: "Billabong" },
          { name: "Laline" },
          { name: "The Children's Place" },
          { name: "Aerie" },
          { name: "American Eagle" },
          { name: "Mango" },
          { name: "Fox Home" },
          { name: "Fox" },
        ],
      },
      select: { id: true, name: true },
    });

    console.log("\nDREAM CARD brands found:");
    dreamCardBrands.forEach((b) => console.log(`- ${b.name} (${b.id})`));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPartnerships();
