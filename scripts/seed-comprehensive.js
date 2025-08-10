const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const benefits = [
  // McDonald's
  {
    brandName: "McDonald's",
    title: "המבורגר חינם ביום הולדת",
    description: "המבורגר חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה. לא ניתן לשלב עם מבצעים אחרים.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // Super-Pharm
  {
    brandName: "Super-Pharm - LifeStyle",
    title: "20% הנחה על כל הקנייה",
    description: "20% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל תרופות מרשם ומוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_month",
    validityDuration: 30
  },
  
  // KFC
  {
    brandName: "KFC",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // H&M
  {
    brandName: "H&M",
    title: "25% הנחה על כל הקנייה",
    description: "25% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_month",
    validityDuration: 30
  },
  
  // Fox
  {
    brandName: "Fox",
    title: "30% הנחה על כל הקנייה",
    description: "30% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_month",
    validityDuration: 30
  },
  
  // Shufersal
  {
    brandName: "Shufersal",
    title: "15% הנחה על כל הקנייה",
    description: "15% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל אלכוהול ומוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_month",
    validityDuration: 30
  },
  
  // BBB
  {
    brandName: "BBB",
    title: "20% הנחה על כל הקנייה",
    description: "20% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_month",
    validityDuration: 30
  },
  
  // מסעדת ליבירה
  {
    brandName: "מסעדת ליבירה",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // מסעדת באקרו
  {
    brandName: "מסעדת באקרו (רעננה)",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // פראג הקטנה
  {
    brandName: "פראג הקטנה (מסעדה)",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // שגב
  {
    brandName: "שגב (מסעדה)",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // ג'מס
  {
    brandName: "ג'מס",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // יומנגס
  {
    brandName: "יומנגס",
    title: "ארוחה חינם ביום הולדת",
    description: "ארוחה חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // M32 המבורגרים
  {
    brandName: "M32 המבורגרים",
    title: "המבורגר חינם ביום הולדת",
    description: "המבורגר חינם ביום הולדת עם רכישה של משקה",
    termsAndConditions: "תקף ביום הולדת בלבד. נדרש רכישת משקה.",
    redemptionMethod: "הצג את האפליקציה בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // מיקה חנויות נוחות
  {
    brandName: "מיקה חנויות נוחות",
    title: "10% הנחה על כל הקנייה",
    description: "10% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל אלכוהול ומוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_month",
    validityDuration: 30
  },
  
  // שילב
  {
    brandName: "שילב",
    title: "15% הנחה על כל הקנייה",
    description: "15% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_month",
    validityDuration: 30
  },
  
  // מנמ עשה זאת בעצמך
  {
    brandName: "מנמ עשה זאת בעצמך",
    title: "20% הנחה על כל הקנייה",
    description: "20% הנחה על כל הקנייה בחודש יום ההולדת",
    termsAndConditions: "תקף לכל החודש. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_month",
    validityDuration: 30
  },
  
  // אסקייפרום
  {
    brandName: "אסקייפרום",
    title: "50% הנחה על כל הקנייה",
    description: "50% הנחה על כל הקנייה ביום ההולדת",
    termsAndConditions: "תקף ביום הולדת בלבד. לא כולל מוצרים מוגבלים.",
    redemptionMethod: "הצג את כרטיס החברות בקופה",
    promoCode: null,
    validityType: "birthday_date",
    validityDuration: 1
  },
  
  // SOHO
  {
    brandName: "SOHO",
    title: "50 ₪ מתנה לקנייה בחנויות SOHO",
    description: "₪50 gift voucher. Join 'The Friends of Soho' mailing list online (Free membership).",
    termsAndConditions: "Must have made a purchase of ₪99+ in the past year. Must present ID in-store. ההטבה הינה אישית ואינה ניתנת להעברה. ההטבה תקפה בקניית מוצר במחירו המלא ואינה כוללת כפל מבצעים והטבות. ההטבה ניתנת למימוש בחנויות סוהו בלבד. Contact: service@sohocenter.co.il",
    redemptionMethod: "הצג את ההודעה שקיבלת ב-SMS או בדואר אלקטרוני בחנות",
    promoCode: null,
    validityType: "birthday_plus_period",
    validityDuration: 14
  },
  
  // Dream Card
  {
    brandName: "Dream Card",
    title: "30% Discount at Participating Brands",
    description: "30% discount at each participating brand. Sign up in-store at any participating brand or online (₪69 one-time membership).",
    termsAndConditions: "Max purchase of ₪500 per brand. One use per brand. Participating brands: Terminal X, Billabong, Laline, The Children's Place, Aerie, American Eagle, Mango, Fox Home, Fox. Verification Status: Verified",
    redemptionMethod: "הצג את כרטיס DREAM CARD בקופה",
    promoCode: null,
    validityType: "birthday_month",
    validityDuration: 30
  }
];

async function seedBenefits() {
  try {
    console.log('Starting comprehensive benefit seeding...');
    
    // Clear existing benefits
    await prisma.benefit.deleteMany();
    console.log('Cleared existing benefits');
    
    // Create benefits for each brand
    for (const benefitData of benefits) {
      // Find the brand
      const brand = await prisma.brand.findFirst({
        where: { name: benefitData.brandName }
      });
      
      if (brand) {
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
        console.log(`✓ Created benefit: ${benefitData.title} for ${benefitData.brandName}`);
      } else {
        console.log(`⚠ Brand not found: ${benefitData.brandName}`);
      }
    }
    
    console.log('\nComprehensive seeding completed!');
    
    // Verify the results
    const totalBenefits = await prisma.benefit.count();
    console.log(`Total benefits in database: ${totalBenefits}`);
    
  } catch (error) {
    console.error('Error seeding benefits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBenefits(); 