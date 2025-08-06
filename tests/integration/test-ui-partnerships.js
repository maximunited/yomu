const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUiPartnerships() {
  try {
    console.log('🧪 Testing UI partnership display...\n');

    // 1. Test the brands API response that the memberships page uses
    console.log('1️⃣ Testing brands API response for memberships page:');
    
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
        partnershipsFrom: { include: { brandB: true } },
        partnershipsTo: { include: { brandA: true } }
      },
      orderBy: { name: 'asc' }
    });

    // Transform brands like the API does
    const transformedBrands = brands.map(brand => {
      const partnerBrands = [];
      
      brand.partnershipsFrom.forEach(partnership => {
        if (partnership.brandB && partnership.brandB.isActive) {
          partnerBrands.push(partnership.brandB);
        }
      });
      
      brand.partnershipsTo.forEach(partnership => {
        if (partnership.brandA && partnership.brandA.isActive) {
          partnerBrands.push(partnership.brandA);
        }
      });

      return {
        ...brand,
        partnerBrands,
        childBrands: partnerBrands // backward compatibility
      };
    });

    // Get user memberships
    const testUser = await prisma.user.findFirst();
    const userMemberships = await prisma.userMembership.findMany({
      where: {
        userId: testUser.id,
        isActive: true,
        brandId: { not: null }
      }
    });

    const activeBrandIds = new Set(userMemberships.map(m => m.brandId));

    // Simulate the memberships page logic
    const brandMemberships = transformedBrands.map(brand => {
      // Build description with partnership info (like the UI does)
      let description = brand.description;
      const partners = brand.partnerBrands || brand.childBrands || [];
      if (partners.length > 0) {
        const partnerNames = partners.map(partner => partner.name).join(', ');
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
        partnerCount: partners.length
      };
    });

    console.log('How memberships page will display partnerships:');
    brandMemberships
      .filter(b => b.partnerCount > 0)
      .forEach(membership => {
        const status = membership.isActive ? '✅ ACTIVE' : '❌ inactive';
        console.log(`\n${status} ${membership.name} (${membership.category})`);
        console.log(`  Description: ${membership.description}`);
        
        if (membership.description.length > 100) {
          console.log(`  ⚠️  Description is long (${membership.description.length} chars) - might be truncated in UI`);
        }
      });

    // 2. Test benefits display
    console.log('\n2️⃣ Testing benefits display on dashboard:');
    
    const benefits = await prisma.benefit.findMany({
      where: { isActive: true },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            category: true,
            actionUrl: true,
            actionType: true,
            actionLabel: true,
          }
        }
      }
    });

    // Filter to user's memberships
    const userBrandIds = new Set(userMemberships.map(m => m.brandId));
    const userBenefits = benefits.filter(benefit => 
      userBrandIds.has(benefit.brandId)
    );

    console.log(`User has access to ${userBenefits.length} benefits from ${userMemberships.length} memberships:`);
    
    const benefitsByBrand = {};
    userBenefits.forEach(benefit => {
      if (!benefitsByBrand[benefit.brand.name]) {
        benefitsByBrand[benefit.brand.name] = [];
      }
      benefitsByBrand[benefit.brand.name].push(benefit);
    });

    Object.entries(benefitsByBrand).forEach(([brandName, brandBenefits]) => {
      console.log(`\n  ${brandName} (${brandBenefits.length} benefits):`);
      brandBenefits.forEach(benefit => {
        const actionText = benefit.brand.actionLabel || 'לקנייה';
        console.log(`    - ${benefit.title} [${actionText}]`);
      });
    });

    // 3. Test partnership display recommendations
    console.log('\n3️⃣ UI improvement recommendations:');
    
    const brandsWithManyPartners = brandMemberships.filter(b => b.partnerCount > 2);
    
    if (brandsWithManyPartners.length > 0) {
      console.log('\nBrands with 3+ partners (may need better UI display):');
      brandsWithManyPartners.forEach(brand => {
        console.log(`  ${brand.name}: ${brand.partnerCount} partners`);
        console.log(`    Current description length: ${brand.description.length} chars`);
        
        // Suggest improvements
        if (brand.description.length > 120) {
          console.log(`    💡 Suggestion: Show partner count instead of full names`);
          console.log(`    💡 Alternative: "כולל גישה ל-${brand.partnerCount} מותגים נוספים"`);
        }
      });
    }

    // 4. Test a more complex scenario: Create a 5-brand network
    console.log('\n4️⃣ Testing even larger partnership network:');
    
    // Find some more brands to create a larger network
    const allBrands = await prisma.brand.findMany({
      where: { isActive: true, category: 'food' },
      select: { id: true, name: true }
    });

    console.log(`Available food brands: ${allBrands.length}`);
    
    // Create a 5-brand food network by adding one more brand
    const existingFoodPartners = ['KFC', 'McDonald', 'באקרו', 'יומנגס'];
    const availableForNetwork = allBrands.filter(b => 
      !existingFoodPartners.some(existing => b.name.includes(existing))
    );

    if (availableForNetwork.length > 0) {
      const newPartner = availableForNetwork[0];
      console.log(`Adding ${newPartner.name} to the food network...`);
      
      // Connect to all existing partners
      const existingPartnerIds = allBrands
        .filter(b => existingFoodPartners.some(existing => b.name.includes(existing)))
        .map(b => b.id);

      let connectionsCreated = 0;
      for (const partnerId of existingPartnerIds) {
        try {
          const existingConnection = await prisma.brandPartnership.findFirst({
            where: {
              OR: [
                { brandAId: newPartner.id, brandBId: partnerId },
                { brandAId: partnerId, brandBId: newPartner.id }
              ]
            }
          });

          if (!existingConnection) {
            await prisma.brandPartnership.create({
              data: { brandAId: newPartner.id, brandBId: partnerId }
            });
            connectionsCreated++;
          }
        } catch (error) {
          // Skip if connection fails
        }
      }

      console.log(`  Created ${connectionsCreated} new partnerships`);
      
      // Test UI display for this larger network
      const updatedBrand = await prisma.brand.findUnique({
        where: { id: newPartner.id },
        include: {
          partnershipsFrom: { include: { brandB: { select: { name: true } } } },
          partnershipsTo: { include: { brandA: { select: { name: true } } } }
        }
      });

      const partners = [];
      updatedBrand.partnershipsFrom.forEach(p => partners.push(p.brandB.name));
      updatedBrand.partnershipsTo.forEach(p => partners.push(p.brandA.name));

      console.log(`\n  ${newPartner.name} now has ${partners.length} partners`);
      const fullDescription = `${updatedBrand.description} | כולל גישה ל: ${partners.join(', ')}`;
      console.log(`  Full description would be: "${fullDescription}"`);
      console.log(`  Length: ${fullDescription.length} characters`);
      
      if (fullDescription.length > 150) {
        console.log(`  🚨 UI Issue: Description too long for comfortable display`);
        console.log(`  💡 Better approach: "כולל גישה ל-${partners.length} מותגים נוספים"`);
      }
    }

    console.log('\n🎉 UI partnership display test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUiPartnerships();