const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMultiBrandPartnerships() {
  try {
    console.log('🧪 Testing multi-brand partnership capabilities...\n');

    // 1. Current partnership analysis
    console.log('1️⃣ Current partnerships:');
    const partnerships = await prisma.brandPartnership.findMany({
      include: {
        brandA: { select: { name: true, category: true } },
        brandB: { select: { name: true, category: true } }
      }
    });

    partnerships.forEach(p => {
      console.log(`  ${p.brandA.name} ↔ ${p.brandB.name}`);
    });

    // 2. Create a multi-brand partnership scenario
    console.log('\n2️⃣ Creating multi-brand partnership scenario:');
    console.log('Scenario: Food delivery partnership - KFC + McDonald\'s + באקרו');

    // Find the brands
    const kfc = await prisma.brand.findFirst({ where: { name: { contains: 'KFC' } } });
    const mcdonalds = await prisma.brand.findFirst({ where: { name: { contains: 'McDonald' } } });
    const buckaroo = await prisma.brand.findFirst({ where: { name: { contains: 'באקרו' } } });

    if (!kfc || !mcdonalds || !buckaroo) {
      console.log('❌ Could not find all required brands');
      console.log('Available brands:', [kfc?.name, mcdonalds?.name, buckaroo?.name].filter(Boolean));
      return;
    }

    console.log(`Found brands: ${kfc.name}, ${mcdonalds.name}, ${buckaroo.name}`);

    // Check for existing partnerships to avoid duplicates
    const existingPartnerships = await prisma.brandPartnership.findMany({
      where: {
        OR: [
          { brandAId: { in: [kfc.id, mcdonalds.id, buckaroo.id] } },
          { brandBId: { in: [kfc.id, mcdonalds.id, buckaroo.id] } }
        ]
      }
    });

    // Create partnerships if they don't exist
    const partnershipsToCreate = [];
    
    // KFC ↔ McDonald's
    if (!existingPartnerships.some(p => 
      (p.brandAId === kfc.id && p.brandBId === mcdonalds.id) ||
      (p.brandAId === mcdonalds.id && p.brandBId === kfc.id)
    )) {
      partnershipsToCreate.push({ brandAId: kfc.id, brandBId: mcdonalds.id });
    }

    // KFC ↔ באקרו
    if (!existingPartnerships.some(p => 
      (p.brandAId === kfc.id && p.brandBId === buckaroo.id) ||
      (p.brandAId === buckaroo.id && p.brandBId === kfc.id)
    )) {
      partnershipsToCreate.push({ brandAId: kfc.id, brandBId: buckaroo.id });
    }

    // McDonald's ↔ באקרו
    if (!existingPartnerships.some(p => 
      (p.brandAId === mcdonalds.id && p.brandBId === buckaroo.id) ||
      (p.brandAId === buckaroo.id && p.brandBId === mcdonalds.id)
    )) {
      partnershipsToCreate.push({ brandAId: mcdonalds.id, brandBId: buckaroo.id });
    }

    // Create the partnerships
    for (const partnership of partnershipsToCreate) {
      await prisma.brandPartnership.create({ data: partnership });
      console.log(`  ✅ Created partnership between brands`);
    }

    if (partnershipsToCreate.length === 0) {
      console.log('  ℹ️ Partnerships already exist');
    }

    // 3. Test membership creation for one brand (should create memberships for all partners)
    console.log('\n3️⃣ Testing membership creation for KFC (should include all partners):');

    // Get test user
    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }

    // Clear existing memberships for clean test
    await prisma.userMembership.deleteMany({
      where: { userId: testUser.id }
    });

    // Simulate API membership creation logic for KFC
    const brand = await prisma.brand.findUnique({
      where: { id: kfc.id },
      include: {
        partnershipsFrom: {
          include: { brandB: true }
        },
        partnershipsTo: {
          include: { brandA: true }
        }
      }
    });

    // Create main membership
    await prisma.userMembership.create({
      data: {
        userId: testUser.id,
        brandId: brand.id,
        isActive: true,
      }
    });
    console.log(`  ✅ Created membership for ${brand.name}`);

    // Get all partner brands
    const partnerBrands = [];
    brand.partnershipsFrom.forEach(partnership => {
      partnerBrands.push(partnership.brandB);
    });
    brand.partnershipsTo.forEach(partnership => {
      partnerBrands.push(partnership.brandA);
    });

    // Create partner memberships
    for (const partnerBrand of partnerBrands) {
      await prisma.userMembership.create({
        data: {
          userId: testUser.id,
          brandId: partnerBrand.id,
          isActive: true,
        }
      });
      console.log(`  ✅ Auto-created partnership membership for ${partnerBrand.name}`);
    }

    // 4. Verify the results
    console.log('\n4️⃣ Verification:');
    
    const finalMemberships = await prisma.userMembership.findMany({
      where: { 
        userId: testUser.id,
        isActive: true 
      },
      include: {
        brand: { select: { name: true, category: true } }
      }
    });

    console.log(`User ${testUser.name} now has ${finalMemberships.length} active memberships:`);
    finalMemberships.forEach(m => {
      console.log(`  - ${m.brand.name} (${m.brand.category})`);
    });

    // 5. Test partnership discovery for each brand
    console.log('\n5️⃣ Partnership discovery for each brand:');
    
    for (const membership of finalMemberships) {
      const brandWithPartners = await prisma.brand.findUnique({
        where: { id: membership.brandId },
        include: {
          partnershipsFrom: { include: { brandB: { select: { name: true } } } },
          partnershipsTo: { include: { brandA: { select: { name: true } } } }
        }
      });

      const partners = [];
      brandWithPartners.partnershipsFrom.forEach(p => partners.push(p.brandB.name));
      brandWithPartners.partnershipsTo.forEach(p => partners.push(p.brandA.name));

      console.log(`  ${brandWithPartners.name} → partners: [${partners.join(', ')}]`);
    }

    // 6. Test complex scenario: What if we add a 4th brand?
    console.log('\n6️⃣ Testing with a 4th brand (יומנגס):');
    
    const yomangus = await prisma.brand.findFirst({ where: { name: { contains: 'יומנגס' } } });
    if (yomangus) {
      console.log(`Adding ${yomangus.name} to the food partnership network`);
      
      // Connect יומנגס to all existing food partners
      const foodPartners = [kfc, mcdonalds, buckaroo];
      for (const partner of foodPartners) {
        const existingConnection = await prisma.brandPartnership.findFirst({
          where: {
            OR: [
              { brandAId: yomangus.id, brandBId: partner.id },
              { brandAId: partner.id, brandBId: yomangus.id }
            ]
          }
        });

        if (!existingConnection) {
          await prisma.brandPartnership.create({
            data: { brandAId: yomangus.id, brandBId: partner.id }
          });
          console.log(`  ✅ Connected ${yomangus.name} ↔ ${partner.name}`);
        }
      }

      // Test membership creation for יומנגס (should create all 4 food brand memberships)
      await prisma.userMembership.deleteMany({ where: { userId: testUser.id } });
      
      const yomangusBrand = await prisma.brand.findUnique({
        where: { id: yomangus.id },
        include: {
          partnershipsFrom: { include: { brandB: true } },
          partnershipsTo: { include: { brandA: true } }
        }
      });

      // Create יומנגס membership
      await prisma.userMembership.create({
        data: { userId: testUser.id, brandId: yomangus.id, isActive: true }
      });

      // Auto-create all partner memberships
      const allPartners = [];
      yomangusBrand.partnershipsFrom.forEach(p => allPartners.push(p.brandB));
      yomangusBrand.partnershipsTo.forEach(p => allPartners.push(p.brandA));

      for (const partner of allPartners) {
        await prisma.userMembership.create({
          data: { userId: testUser.id, brandId: partner.id, isActive: true }
        });
      }

      const finalCount = await prisma.userMembership.count({
        where: { userId: testUser.id, isActive: true }
      });

      console.log(`  🎉 Result: Creating ${yomangus.name} membership auto-created ${finalCount} total memberships!`);
    }

    console.log('\n📊 Multi-brand partnership test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMultiBrandPartnerships();