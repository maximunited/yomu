const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testPartnerships() {
  try {
    console.log("🧪 Testing partnership functionality...\n");

    // 1. Get all partnerships
    const partnerships = await prisma.brandPartnership.findMany({
      include: {
        brandA: { select: { name: true, category: true } },
        brandB: { select: { name: true, category: true } },
      },
    });

    console.log("📊 Current partnerships:");
    partnerships.forEach((p) => {
      console.log(
        `  ${p.brandA.name} (${p.brandA.category}) ↔ ${p.brandB.name} (${p.brandB.category})`,
      );
    });

    // 2. Test membership creation for Giraffe (should also create Nono&Mimi membership)
    const giraffeBrand = await prisma.brand.findFirst({
      where: { name: { contains: "Giraffe" } },
    });

    const nonoMimiBrand = await prisma.brand.findFirst({
      where: { name: { contains: "Nono" } },
    });

    if (!giraffeBrand || !nonoMimiBrand) {
      console.log("❌ Could not find Giraffe or Nono&Mimi brands");
      return;
    }

    console.log(`\n🔍 Found brands:`);
    console.log(`  Giraffe ID: ${giraffeBrand.id}`);
    console.log(`  Nono&Mimi ID: ${nonoMimiBrand.id}`);

    // 3. Get first user for testing
    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log("❌ No test user found");
      return;
    }

    console.log(`\n👤 Using test user: ${testUser.name} (${testUser.id})`);

    // 4. Clear existing memberships for clean test
    await prisma.userMembership.deleteMany({
      where: { userId: testUser.id },
    });

    console.log("\n🧹 Cleared existing memberships");

    // 5. Create membership for Giraffe only (should auto-create Nono&Mimi)
    console.log(
      "\n🎯 Creating Giraffe membership (should auto-create Nono&Mimi)...",
    );

    // Simulate the API call logic
    const brand = await prisma.brand.findUnique({
      where: { id: giraffeBrand.id },
      include: {
        partnershipsFrom: {
          include: {
            brandB: true,
          },
        },
        partnershipsTo: {
          include: {
            brandA: true,
          },
        },
      },
    });

    // Create main membership
    const mainMembership = await prisma.userMembership.create({
      data: {
        userId: testUser.id,
        brandId: brand.id,
        isActive: true,
      },
    });

    console.log(`  ✅ Created membership for ${brand.name}`);

    // Get partner brands
    const partnerBrands = [];
    brand.partnershipsFrom.forEach((partnership) => {
      partnerBrands.push(partnership.brandB);
    });
    brand.partnershipsTo.forEach((partnership) => {
      partnerBrands.push(partnership.brandA);
    });

    // Create partner memberships
    for (const partnerBrand of partnerBrands) {
      const partnerMembership = await prisma.userMembership.create({
        data: {
          userId: testUser.id,
          brandId: partnerBrand.id,
          isActive: true,
        },
      });
      console.log(
        `  ✅ Auto-created partnership membership for ${partnerBrand.name}`,
      );
    }

    // 6. Verify results
    console.log("\n📋 Final verification:");
    const finalMemberships = await prisma.userMembership.findMany({
      where: {
        userId: testUser.id,
        isActive: true,
      },
      include: {
        brand: { select: { name: true } },
      },
    });

    console.log(`  User has ${finalMemberships.length} active memberships:`);
    finalMemberships.forEach((m) => {
      console.log(`    - ${m.brand.name}`);
    });

    // 7. Test action URLs
    console.log("\n🔗 Action URLs for brands:");
    const brandsWithActions = await prisma.brand.findMany({
      where: {
        actionUrl: { not: null },
      },
      select: {
        name: true,
        category: true,
        actionType: true,
        actionLabel: true,
        actionUrl: true,
      },
    });

    brandsWithActions.forEach((brand) => {
      console.log(
        `  ${brand.name} (${brand.category}): ${brand.actionLabel} -> ${brand.actionUrl}`,
      );
    });

    console.log("\n🎉 Partnership test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPartnerships();
