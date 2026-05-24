const { createPrismaClient, disconnectPrisma } = require('./prisma-client');

const prisma = createPrismaClient();

async function addGiraffePartnership() {
  try {
    console.log('🦒 Adding Giraffe and Nono&Mimi partnership...');

    // First, create the main Giraffe brand
    const giraffeBrand = await prisma.brand.create({
      data: {
        name: 'Giraffe',
        logoUrl: '/images/brands/giraffe.svg',
        website: 'https://giraffe.co.il',
        description: 'רשת מסעדות איטלקיות מובילה בישראל',
        category: 'restaurant',
        isActive: true,
      },
    });

    console.log('✅ Created Giraffe brand:', giraffeBrand.name);

    // Create Nono&Mimi as a child brand
    const nonoMimiBrand = await prisma.brand.create({
      data: {
        name: 'Nono&Mimi',
        logoUrl: '/images/brands/restaurant.svg', // Using generic restaurant icon for now
        website: 'https://nonomimi.co.il',
        description: "מסעדות איטלקיות בוטיק תחת רשת ג'ירף",
        category: 'restaurant',
        isActive: true,
        parentBrandId: giraffeBrand.id,
      },
    });

    console.log(
      '✅ Created Nono&Mimi brand with partnership to Giraffe:',
      nonoMimiBrand.name
    );

    // Create benefits for Giraffe (available for both brands)
    const giraffeBenefit = await prisma.benefit.create({
      data: {
        brandId: giraffeBrand.id,
        title: 'קינוח או בקבוק יין חינם',
        description:
          'קינוח או בקבוק יין (עד 150 ש״ח) חינם בחודש יום ההולדת עם הזמנת ארוחה ראשית',
        termsAndConditions:
          'תקף לכל חודש יום ההולדת. נדרש הזמנה של ארוחה ראשית. יש לבחור קינוח או בקבוק יין. בקבוק יין עד 150 ש״ח. לא ניתן לשלב עם מבצעים אחרים.',
        redemptionMethod:
          'הצג את האפליקציה למלצר או התקשר מראש ותזכיר על ההטבה',
        promoCode: null,
        url: null,
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
        isActive: true,
      },
    });

    console.log('✅ Created Giraffe benefit:', giraffeBenefit.title);

    // Create a similar benefit for Nono&Mimi
    const nonoMimiBenefit = await prisma.benefit.create({
      data: {
        brandId: nonoMimiBrand.id,
        title: 'קינוח או בקבוק יין חינם',
        description:
          'קינוח או בקבוק יין (עד 120 ש״ח) חינם בחודש יום ההולדת עם הזמנת ארוחה ראשית',
        termsAndConditions:
          'תקף לכל חודש יום ההולדת. נדרש הזמנה של ארוחה ראשית. יש לבחור קינוח או בקבוק יין. בקבוק יין עד 120 ש״ח. לא ניתן לשלב עם מבצעים אחרים.',
        redemptionMethod:
          'הצג את האפליקציה למלצר או התקשר מראש ותזכיר על ההטבה',
        promoCode: null,
        url: null,
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
        isActive: true,
      },
    });

    console.log('✅ Created Nono&Mimi benefit:', nonoMimiBenefit.title);

    console.log('\n🎉 Successfully added Giraffe partnership with Nono&Mimi!');
    console.log('📊 Summary:');
    console.log(`- Main brand: ${giraffeBrand.name} (ID: ${giraffeBrand.id})`);
    console.log(
      `- Partner brand: ${nonoMimiBrand.name} (ID: ${nonoMimiBrand.id})`
    );
    console.log(`- Total benefits created: 2`);
  } catch (error) {
    console.error('❌ Error adding Giraffe partnership:', error);
    throw error;
  } finally {
    await disconnectPrisma();
  }
}

// Run the script
addGiraffePartnership().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
