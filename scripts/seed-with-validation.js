const { PrismaClient } = require('@prisma/client');
const { validateBenefitData, VALIDITY_TYPES, ALL_VALIDITY_TYPES } = require('../src/lib/benefit-validation');

const prisma = new PrismaClient();

// Comprehensive benefit data with validation
const benefits = [
  // McDonald's - exact birthday only
  {
    brandName: "McDonald's",
    title: "המבורגר חינם ביום הולדת",
    description: "המבורגר חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה. לא ניתן לשלב עם מבצעים אחרים.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // Super-Pharm - entire month
  {
    brandName: "Super-Pharm - LifeStyle",
    title: "20% הנחה על כל הקנייה",
    description: "20% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל תרופות מרשם ומוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // KFC - exact birthday only
  {
    brandName: "KFC",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // H&M - entire month
  {
    brandName: "H&M",
    title: "25% הנחה על כל הקנייה",
    description: "25% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // Fox - Dream Card - entire month
  {
    brandName: "Fox - Dream Card",
    title: "30% הנחה על כל הקנייה",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // Shufersal - entire month
  {
    brandName: "Shufersal",
    title: "15% הנחה על כל הקנייה",
    description: "15% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל אלכוהול ומוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // BBB - entire month
  {
    brandName: "BBB",
    title: "20% הנחה על כל הקנייה",
    description: "20% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // מסעדת ליבירה - exact birthday only
  {
    brandName: "מסעדת ליבירה",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // מסעדת באקרו - exact birthday only
  {
    brandName: "מסעדת באקרו (רעננה)",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // פראג הקטנה - exact birthday only
  {
    brandName: "פראג הקטנה (מסעדה)",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // שגב - exact birthday only
  {
    brandName: "שגב (מסעדה)",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // ג'מס - exact birthday only
  {
    brandName: "ג'מס",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // יומנגוס - exact birthday only
  {
    brandName: "יומנגוס",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // M32 המבורגרים - exact birthday only
  {
    brandName: "M32 המבורגרים",
    title: "המבורגר חינם ביום הולדת",
    description: "המבורגר חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // מיקה חנויות נוחות - entire month
  {
    brandName: "מיקה חנויות נוחות",
    title: "10% הנחה על כל הקנייה",
    description: "10% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל אלכוהול ומוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // שילב - entire month
  {
    brandName: "שילב",
    title: "15% הנחה על כל הקנייה",
    description: "15% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // מנמ עשה זאת בעצמך - entire month
  {
    brandName: "מנמ עשה זאת בעצמך",
    title: "20% הנחה על כל הקנייה",
    description: "20% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // אסקייפרום - exact birthday only
  {
    brandName: "אסקייפרום",
    title: "50% הנחה על כל הקנייה",
    description: "50% הנחה על כל הקנייה ביום ההולדת",
    termsAndConditions: "תקף ביום הולדת בלבד. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_exact_date",
    validityDuration: 1
  },

  // DREAM CARD brands - entire month
  {
    brandName: "Terminal X",
    title: "30% הנחה הטבת יום ההולדת",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת - כרטיס DREAM CARD",
    termsAndConditions: "תקף פעם אחת ברשת בחודש יום ההולדת. כרטיס מועדון DREAM CARD.",
    redemptionMethod: "הצג את כרטיס DREAM CARD בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  {
    brandName: "Billabong",
    title: "30% הנחה הטבת יום ההולדת",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת - כרטיס DREAM CARD",
    termsAndConditions: "תקף פעם אחת ברשת בחודש יום ההולדת. כרטיס מועדון DREAM CARD.",
    redemptionMethod: "הצג את כרטיס DREAM CARD בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  {
    brandName: "Laline",
    title: "30% הנחה הטבת יום ההולדת",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת - כרטיס DREAM CARD",
    termsAndConditions: "תקף פעם אחת ברשת בחודש יום ההולדת. כרטיס מועדון DREAM CARD.",
    redemptionMethod: "הצג את כרטיס DREAM CARD בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  {
    brandName: "The Children's Place",
    title: "30% הנחה הטבת יום ההולדת",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת - כרטיס DREAM CARD",
    termsAndConditions: "תקף פעם אחת ברשת בחודש יום ההולדת. כרטיס מועדון DREAM CARD.",
    redemptionMethod: "הצג את כרטיס DREAM CARD בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  {
    brandName: "Aerie",
    title: "30% הנחה הטבת יום ההולדת",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת - כרטיס DREAM CARD",
    termsAndConditions: "תקף פעם אחת ברשת בחודש יום ההולדת. כרטיס מועדון DREAM CARD.",
    redemptionMethod: "הצג את כרטיס DREAM CARD בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  {
    brandName: "American Eagle",
    title: "30% הנחה הטבת יום ההולדת",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת - כרטיס DREAM CARD",
    termsAndConditions: "תקף פעם אחת ברשת בחודש יום ההולדת. כרטיס מועדון DREAM CARD.",
    redemptionMethod: "הצג את כרטיס DREAM CARD בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  {
    brandName: "Mango",
    title: "30% הנחה הטבת יום ההולדת",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת - כרטיס DREAM CARD",
    termsAndConditions: "תקף פעם אחת ברשת בחודש יום ההולדת. כרטיס מועדון DREAM CARD.",
    redemptionMethod: "הצג את כרטיס DREAM CARD בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  {
    brandName: "Fox Home",
    title: "30% הנחה הטבת יום ההולדת",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת - כרטיס DREAM CARD",
    termsAndConditions: "תקף פעם אחת ברשת בחודש יום ההולדת. כרטיס מועדון DREAM CARD.",
    redemptionMethod: "הצג את כרטיס DREAM CARD בקופה",
    promoCode: null,
    validityType: "birthday_entire_month",
    validityDuration: 30
  }
];

async function seedBenefitsWithValidation() {
  try {
    console.log('=== Starting Comprehensive Benefit Seeding with Validation ===');
    
    // Show available validity types
    console.log('\nAvailable validity types:');
    ALL_VALIDITY_TYPES.forEach(type => {
      const rule = VALIDITY_TYPES[type];
      console.log(`- ${type}: ${rule.description}`);
    });
    
    // Clear existing benefits
    await prisma.benefit.deleteMany();
    console.log('\n✓ Cleared existing benefits');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Create benefits for each brand with validation
    for (const benefitData of benefits) {
      try {
        // Find the brand
        const brand = await prisma.brand.findFirst({
          where: { name: benefitData.brandName }
        });
        
        if (!brand) {
          console.log(`⚠ Brand not found: ${benefitData.brandName}`);
          errorCount++;
          continue;
        }
        
        // Add brandId to benefit data for validation
        const benefitDataWithBrandId = {
          ...benefitData,
          brandId: brand.id
        };
        
        // Validate the benefit data
        const validation = validateBenefitData(benefitDataWithBrandId);
        
        if (!validation.isValid) {
          console.log(`❌ Validation failed for ${benefitData.brandName}:`);
          validation.errors.forEach(error => console.log(`  - ${error}`));
          errorCount++;
          continue;
        }
        
        // Create the benefit
        await prisma.benefit.create({
          data: {
            brandId: brand.id,
            title: benefitData.title,
            description: benefitData.description,
            termsAndConditions: benefitData.termsAndConditions,
            redemptionMethod: benefitData.redemptionMethod,
            promoCode: benefitData.promoCode,
            url: brand.website,
            validityType: benefitData.validityType,
            validityDuration: benefitData.validityDuration,
            isActive: true
          }
        });
        
        console.log(`✓ Created benefit: ${benefitData.title} for ${benefitData.brandName} (${benefitData.validityType})`);
        successCount++;
        
      } catch (error) {
        console.log(`❌ Error creating benefit for ${benefitData.brandName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n=== Seeding Summary ===');
    console.log(`✓ Successfully created: ${successCount} benefits`);
    console.log(`❌ Failed to create: ${errorCount} benefits`);
    console.log(`📊 Total processed: ${benefits.length} benefits`);
    
    // Verify the results
    const totalBenefits = await prisma.benefit.count();
    console.log(`\n📈 Total benefits in database: ${totalBenefits}`);
    
    // Show validity type distribution
    const benefitsByType = await prisma.benefit.groupBy({
      by: ['validityType'],
      _count: {
        validityType: true
      }
    });
    
    console.log('\n📊 Benefits by validity type:');
    benefitsByType.forEach(group => {
      console.log(`- ${group.validityType}: ${group._count.validityType} benefits`);
    });
    
  } catch (error) {
    console.error('Error seeding benefits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBenefitsWithValidation(); 