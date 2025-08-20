const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createDreamCardPartnerships() {
  try {
    console.log("=== Creating DREAM CARD Brand Partnerships ===");

    // Get all DREAM CARD brands with corrected names
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

    console.log(`Found ${dreamCardBrands.length} DREAM CARD brands:`);
    dreamCardBrands.forEach((b) => console.log(`- ${b.name}`));

    if (dreamCardBrands.length === 0) {
      console.log(
        "❌ No DREAM CARD brands found. Make sure to run the seed script first.",
      );
      return;
    }

    // Clear existing partnerships for DREAM CARD brands
    await prisma.brandPartnership.deleteMany({
      where: {
        OR: [
          { brandAId: { in: dreamCardBrands.map((b) => b.id) } },
          { brandBId: { in: dreamCardBrands.map((b) => b.id) } },
        ],
      },
    });
    console.log("✓ Cleared existing DREAM CARD partnerships");

    // Create partnerships between all DREAM CARD brands
    let partnershipsCreated = 0;

    for (let i = 0; i < dreamCardBrands.length; i++) {
      for (let j = i + 1; j < dreamCardBrands.length; j++) {
        const brandA = dreamCardBrands[i];
        const brandB = dreamCardBrands[j];

        await prisma.brandPartnership.create({
          data: {
            brandAId: brandA.id,
            brandBId: brandB.id,
          },
        });

        console.log(`✓ Created partnership: ${brandA.name} <-> ${brandB.name}`);
        partnershipsCreated++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`✓ Created ${partnershipsCreated} partnerships`);
    console.log(
      `📊 All ${dreamCardBrands.length} DREAM CARD brands are now linked together`,
    );

    // Verify partnerships
    const totalPartnerships = await prisma.brandPartnership.count();
    console.log(`📈 Total partnerships in database: ${totalPartnerships}`);
  } catch (error) {
    console.error("❌ Error creating partnerships:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDreamCardPartnerships();
