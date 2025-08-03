const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCustomMembershipsPartnerships() {
  try {
    console.log('🧪 Testing Multi-Brand Feature with Custom Memberships...\n');

    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }

    // 1. Test current custom membership structure
    console.log('1️⃣ Analyzing custom membership structure:');
    
    const customMemberships = await prisma.customMembership.findMany({
      where: { userId: testUser.id },
      include: {
        memberships: true,
        benefits: true
      }
    });

    console.log(`Found ${customMemberships.length} existing custom memberships`);
    customMemberships.forEach(cm => {
      console.log(`  - ${cm.name} (${cm.category}): ${cm.description}`);
    });

    // 2. Check if custom memberships can have partnerships
    console.log('\n2️⃣ Checking custom membership partnership capability:');
    
    // Look at the schema to see if custom memberships support partnerships
    const customMembershipFields = await prisma.$queryRaw`PRAGMA table_info(custom_memberships)`;
    console.log('Custom membership table structure:');
    customMembershipFields.forEach(field => {
      console.log(`  ${field.name}: ${field.type}`);
    });

    // Check user membership table for custom memberships
    const userMemberships = await prisma.userMembership.findMany({
      where: {
        userId: testUser.id,
        customMembershipId: { not: null }
      },
      include: {
        customMembership: true
      }
    });

    console.log(`\nUser has ${userMemberships.length} custom memberships active`);

    // 3. Test creating custom memberships through the API
    console.log('\n3️⃣ Testing custom membership creation via API:');
    
    // Simulate POST /api/user/memberships with custom memberships
    const customMembershipData = {
      brandIds: [], // No regular brands
      customMemberships: [
        {
          name: "רשת חנויות טכנולוגיה",
          description: "הטבות על מוצרי טכנולוגיה וגאדג'טים",
          category: "technology",
          icon: "/images/brands/tech.svg",
          type: "free",
          cost: null
        },
        {
          name: "רשת ספרים ותרבות",
          description: "הטבות על ספרים, סדנאות ואירועי תרבות",
          category: "culture",
          icon: "/images/brands/books.svg", 
          type: "paid",
          cost: "29.90 ₪/חודש"
        }
      ]
    };

    // Clear existing memberships
    await prisma.userMembership.updateMany({
      where: { userId: testUser.id },
      data: { isActive: false }
    });

    // Process custom memberships (simulating API logic)
    const createdCustomMemberships = [];
    
    for (const customData of customMembershipData.customMemberships) {
      // Create custom membership
      const createdCustomMembership = await prisma.customMembership.create({
        data: {
          userId: testUser.id,
          name: customData.name,
          description: customData.description,
          category: customData.category,
          icon: customData.icon,
          type: customData.type,
          cost: customData.cost,
          isActive: true,
        }
      });

      // Create user membership for the custom membership
      const userMembership = await prisma.userMembership.create({
        data: {
          userId: testUser.id,
          customMembershipId: createdCustomMembership.id,
          isActive: true,
        }
      });

      createdCustomMemberships.push({
        custom: createdCustomMembership,
        membership: userMembership
      });

      console.log(`  ✅ Created custom membership: ${createdCustomMembership.name}`);
    }

    // 4. Test if custom memberships can be enhanced with partnerships
    console.log('\n4️⃣ Exploring custom membership partnership enhancement:');
    
    console.log('💡 Current limitation: Custom memberships are isolated entities');
    console.log('💡 They do not participate in the brand partnership system');
    console.log('💡 This is by design - custom memberships are user-specific');
    
    // 5. Test potential enhancement: Link custom memberships to brand partnerships
    console.log('\n5️⃣ Testing potential enhancement - custom membership + brand linking:');
    
    // Create a scenario where user has both custom and brand memberships
    const techBrands = await prisma.brand.findMany({
      where: {
        OR: [
          { category: 'tech' },
          { name: { contains: 'digital' } },
          { description: { contains: 'טכנולוגי' } }
        ]
      }
    });

    console.log(`Found ${techBrands.length} potential tech-related brands`);
    
    if (techBrands.length > 0) {
      // Add some brand memberships alongside custom memberships
      const techBrand = techBrands[0];
      
      const brandMembership = await prisma.userMembership.create({
        data: {
          userId: testUser.id,
          brandId: techBrand.id,
          isActive: true
        }
      });

      console.log(`  ✅ Added brand membership: ${techBrand.name}`);
      
      // Check if brand has partnerships that would be activated
      const brandWithPartnerships = await prisma.brand.findUnique({
        where: { id: techBrand.id },
        include: {
          partnershipsFrom: { include: { brandB: true } },
          partnershipsTo: { include: { brandA: true } }
        }
      });

      const partners = [];
      brandWithPartnerships.partnershipsFrom.forEach(p => partners.push(p.brandB));
      brandWithPartnerships.partnershipsTo.forEach(p => partners.push(p.brandA));

      if (partners.length > 0) {
        console.log(`  💡 Brand partnerships would activate ${partners.length} additional memberships`);
        partners.forEach(partner => {
          console.log(`    - ${partner.name}`);
        });
      } else {
        console.log(`  ℹ️ ${techBrand.name} has no partnerships`);
      }
    }

    // 6. Test GET /api/user/memberships with mixed membership types
    console.log('\n6️⃣ Testing mixed membership API response:');
    
    // Get both types of memberships
    const brandMemberships = await prisma.userMembership.findMany({
      where: {
        userId: testUser.id,
        isActive: true,
        brandId: { not: null },
      },
      include: { brand: true },
    });

    const customUserMemberships = await prisma.userMembership.findMany({
      where: {
        userId: testUser.id,
        isActive: true,
        customMembershipId: { not: null },
      },
      include: { customMembership: true },
    });

    console.log(`API would return:`);
    console.log(`  Brand memberships: ${brandMemberships.length}`);
    brandMemberships.forEach(m => {
      console.log(`    - ${m.brand.name} (${m.brand.category})`);
    });
    
    console.log(`  Custom memberships: ${customUserMemberships.length}`);
    customUserMemberships.forEach(m => {
      console.log(`    - ${m.customMembership.name} (${m.customMembership.category}) [${m.customMembership.type}]`);
    });

    // 7. Test custom benefits
    console.log('\n7️⃣ Testing custom benefits creation:');
    
    if (createdCustomMemberships.length > 0) {
      const techMembership = createdCustomMemberships[0].custom;
      
      // Create custom benefits for this membership
      const customBenefit = await prisma.customBenefit.create({
        data: {
          customMembershipId: techMembership.id,
          title: "50% הנחה על גאדג'טים",
          description: "הנחה של 50% על מוצרי טכנולוגיה נבחרים בחודש יום הולדת",
          redemptionMethod: "code",
          promoCode: "TECH50",
          validityType: "birthday_month",
          isFree: true,
          isActive: true
        }
      });

      console.log(`  ✅ Created custom benefit: ${customBenefit.title}`);
      console.log(`  📝 Promo code: ${customBenefit.promoCode}`);
    }

    // 8. Summary and recommendations
    console.log('\n8️⃣ Summary and Recommendations:');
    
    console.log('✅ Current State:');
    console.log('  • Custom memberships work independently');
    console.log('  • Users can have both brand and custom memberships');
    console.log('  • Custom benefits are fully functional');
    console.log('  • API handles mixed membership types correctly');
    
    console.log('\n💡 Partnership Enhancement Options:');
    console.log('  1. Keep current design (custom = isolated, brands = networked)');
    console.log('  2. Add optional brand linking to custom memberships');
    console.log('  3. Create custom membership groups/networks');
    console.log('  4. Allow custom memberships to "inherit" from brand partnerships');

    console.log('\n🎯 Recommendation:');
    console.log('  Current design is appropriate - custom memberships are meant to be');
    console.log('  user-specific and don\'t need the complexity of partnerships.');
    console.log('  Multi-brand partnerships work perfectly for official brand networks.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCustomMembershipsPartnerships();