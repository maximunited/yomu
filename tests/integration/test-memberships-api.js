const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testMembershipsApi() {
  try {
    console.log("🧪 Testing memberships API data flow...\n");

    // 1. Test brands API structure
    console.log("1️⃣ Testing brands API response structure:");

    const brands = await prisma.brand.findMany({
      where: { isActive: true },
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
      orderBy: { name: "asc" },
    });

    console.log(`Found ${brands.length} brands`);

    // Transform brands like the API does
    const transformedBrands = brands.map((brand) => {
      const partnerBrands = [];

      brand.partnershipsFrom.forEach((partnership) => {
        if (partnership.brandB && partnership.brandB.isActive) {
          partnerBrands.push(partnership.brandB);
        }
      });

      brand.partnershipsTo.forEach((partnership) => {
        if (partnership.brandA && partnership.brandA.isActive) {
          partnerBrands.push(partnership.brandA);
        }
      });

      return {
        id: brand.id,
        name: brand.name,
        logoUrl: brand.logoUrl,
        website: brand.website,
        description: brand.description,
        category: brand.category,
        partnerBrands,
        childBrands: partnerBrands, // backward compatibility
      };
    });

    console.log("Brands with partnerships:");
    transformedBrands.forEach((brand) => {
      if (brand.partnerBrands.length > 0) {
        console.log(
          `  ${brand.name} → ${brand.partnerBrands
            .map((p) => p.name)
            .join(", ")}`,
        );
      }
    });

    // 2. Test user memberships
    console.log("\n2️⃣ Testing user memberships:");

    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log("❌ No test user found");
      return;
    }

    const userMemberships = await prisma.userMembership.findMany({
      where: {
        userId: testUser.id,
        isActive: true,
        brandId: { not: null },
      },
      include: {
        brand: true,
      },
    });

    console.log(
      `User ${testUser.name} has ${userMemberships.length} active memberships:`,
    );
    userMemberships.forEach((membership) => {
      console.log(
        `  - ${membership.brand.name} (${membership.brand.category})`,
      );
    });

    // 3. Simulate memberships page data processing
    console.log("\n3️⃣ Simulating memberships page processing:");

    const activeBrandIds = new Set(userMemberships.map((m) => m.brandId));

    const brandMemberships = transformedBrands.map((brand) => {
      let description = brand.description;
      const partners = brand.partnerBrands || [];
      if (partners.length > 0) {
        const partnerNames = partners.map((partner) => partner.name).join(", ");
        description += ` | כולל גישה ל: ${partnerNames}`;
      }

      return {
        id: brand.id,
        name: brand.name,
        description: description,
        category: brand.category,
        isActive: activeBrandIds.has(brand.id),
        icon: brand.logoUrl,
        type: "free",
        cost: null,
      };
    });

    console.log("Processed memberships for frontend:");
    brandMemberships.forEach((membership) => {
      const status = membership.isActive ? "✅" : "❌";
      console.log(`  ${status} ${membership.name} (${membership.category})`);
      if (membership.description.includes("כולל גישה ל:")) {
        console.log(`      ${membership.description.split(" | ")[1]}`);
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`  Total brands: ${transformedBrands.length}`);
    console.log(
      `  Active memberships: ${
        brandMemberships.filter((m) => m.isActive).length
      }`,
    );
    console.log(
      `  Brands with partnerships: ${
        transformedBrands.filter((b) => b.partnerBrands.length > 0).length
      }`,
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testMembershipsApi();
