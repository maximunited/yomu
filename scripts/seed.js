const { PrismaClient } = require('@prisma/client');

console.log('Starting seed script...');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const predefinedBrands = [
  {
    name: "McDonald's",
    logoUrl: "/images/brands/mcdonalds.png",
    website: "https://www.mcdonalds.co.il",
    description: "הטבות על מזון מהיר",
    category: "food"
  },
  {
    name: "Super-Pharm - LifeStyle",
    logoUrl: "/images/brands/super-pharm.png",
    website: "https://www.super-pharm.co.il",
    description: "הטבות על מוצרי בריאות ויופי",
    category: "health"
  },
  {
    name: "Fox - Dream Card",
    logoUrl: "/images/brands/fox.png",
    website: "https://www.fox.co.il",
    description: "הטבות על ביגוד והנעלה",
    category: "fashion"
  },
  {
    name: "Isracard",
    logoUrl: "/images/brands/isracard.png",
    website: "https://www.isracard.co.il",
    description: "הטבות על דלק ותחבורה",
    category: "transport"
  },
  {
    name: "H&M",
    logoUrl: "/images/brands/hm.png",
    website: "https://www.hm.com/il",
    description: "הטבות על ביגוד והנעלה",
    category: "fashion"
  },
  {
    name: "BBB",
    logoUrl: "/images/brands/bbb.png",
    website: "https://www.bbb.co.il",
    description: "הטבות על מוצרי בית",
    category: "home"
  },
  {
    name: "Shufersal",
    logoUrl: "/images/brands/shufersal.png",
    website: "https://www.shufersal.co.il",
    description: "הטבות על מוצרי מזון",
    category: "grocery"
  },
  {
    name: "KFC",
    logoUrl: "/images/brands/kfc.svg",
    website: "https://www.kfc.co.il",
    description: "הטבות על מזון מהיר",
    category: "food"
  },
  {
    name: "אסקייפרום",
    logoUrl: "/images/brands/escape-room.svg",
    website: "https://www.escape-room.co.il",
    description: "חדרי בריחה - 50 שח הנחה בחודש יומולדת",
    category: "entertainment"
  },
  {
    name: "באקרו - Buckaroo",
    logoUrl: "/images/brands/bacaro.svg",
    website: "https://www.bacaro.co.il",
    description: "מסעדה - קינוח ומנה ראשונה מתנה",
    category: "food"
  },
  {
    name: "שגב",
    logoUrl: "/images/brands/shegev.svg",
    website: "https://www.shegev.co.il",
    description: "מסעדה - מנה ראשונה מתנה",
    category: "food"
  },
  {
    name: "ג'מס - JEMS",
    logoUrl: "/images/brands/james.svg",
    website: "https://www.james.co.il",
    description: "חצי ליטר בירה מתנה",
    category: "food"
  },
  {
    name: "פראג הקטנה",
    logoUrl: "/images/brands/prague.svg",
    website: "https://littleprague.co.il/",
    description: "מסעדה צ'כית אותנטית - כל החודש",
    category: "food"
  },
  {
    name: "מיקה חנויות נוחות",
    logoUrl: "/images/brands/mika.svg",
    website: "https://www.mika.co.il",
    description: "10 שח מתנה בהצגת תעודה מזהה",
    category: "convenience"
  },
  {
    name: "מנמ",
    logoUrl: "/images/brands/menam.svg",
    website: "https://www.menam.co.il",
    description: "50 שח מתנה בקנייה מעל 300 שח",
    category: "home"
  },
  {
    name: "שילב",
    logoUrl: "/images/brands/shilav.svg",
    website: "https://www.shilav.co.il",
    description: "הטבות על מוצרי תינוקות",
    category: "baby"
  },
  {
    name: "יומנגוס",
    logoUrl: "/images/brands/yomango.svg",
    website: "https://www.yomango.co.il",
    description: "הטבות על גלידה",
    category: "food"
  },
  {
    name: "M32 המבורגרים",
    logoUrl: "/images/brands/m32.svg",
    website: "https://www.m32.co.il",
    description: "15% הנחה בחודש יומולדת",
    category: "food"
  },
  {
    name: "מסעדת ליבירה",
    logoUrl: "/images/brands/libira.svg",
    website: "https://www.libira.co.il",
    description: "בירה וקינוח בישיבה בלבד כל החודש",
    category: "food"
  }
];

async function seed() {
  try {
    console.log('Starting database seed...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.benefit.deleteMany();
    await prisma.userMembership.deleteMany();
    await prisma.brand.deleteMany();
    
    console.log('Cleared existing data');
    
    // Create brands
    console.log('Creating brands...');
    const createdBrands = await Promise.all(
      predefinedBrands.map(async (brand) => {
        const created = await prisma.brand.create({
          data: brand
        });
        console.log(`Created brand: ${brand.name}`);
        return created;
      })
    );
    
    console.log(`Created ${createdBrands.length} brands`);
    
    // Create benefits with updated specifications
    console.log('Creating benefits...');
    const sampleBenefits = [
      {
        brandId: createdBrands.find(b => b.name === "McDonald's")?.id,
        title: "המבורגר חינם ביום הולדת",
        description: "קבלו המבורגר חינם ביום הולדתכם",
        termsAndConditions: "תקף רק ביום ההולדת עצמו, לא ניתן להעביר לאחרים",
        redemptionMethod: "app",
        promoCode: "BIRTHDAY2024",
        url: "https://www.mcdonalds.co.il/birthday",
        validityType: "birthday_exact_date",
        validityDuration: 1,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "Super-Pharm - LifeStyle")?.id,
        title: "20% הנחה על כל הקנייה",
        description: "20% הנחה על כל הקנייה בחודש יום ההולדת",
        termsAndConditions: "תקף לחודש שלם, לא ניתן לשלב עם מבצעים אחרים",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.super-pharm.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: false
      },
      {
        brandId: createdBrands.find(b => b.name === "אסקייפרום")?.id,
        title: "50 שח הנחה בחודש יומולדת",
        description: "50 שח הנחה על חדרי בריחה בחודש יום ההולדת - כל החודש הקלנדרי",
        termsAndConditions: "תקף לכל החודש הקלנדרי של יום ההולדת",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.escape-room.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "באקרו - Buckaroo")?.id,
        title: "קינוח ומנה ראשונה מתנה",
        description: "קינוח ומנה ראשונה מתנה כל החודש",
        termsAndConditions: "תקף לכל החודש הקלנדרי של יום ההולדת",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.bacaro.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "מסעדת ליבירה")?.id,
        title: "הטבות מיוחדות כל החודש",
        description: "הטבות מיוחדות במסעדת ליבירה כל החודש",
        termsAndConditions: "תקף לכל החודש הקלנדרי של יום ההולדת",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.libira.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "פראג הקטנה")?.id,
        title: "הטבות מיוחדות כל החודש",
        description: "הטבות מיוחדות במסעדה צ'כית אותנטית כל החודש",
        termsAndConditions: "תקף לכל החודש הקלנדרי של יום ההולדת",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://littleprague.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "שגב")?.id,
        title: "מנה ראשונה מתנה",
        description: "מנה ראשונה מתנה כל החודש",
        termsAndConditions: "תקף לכל החודש הקלנדרי של יום ההולדת",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.shegev.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "ג'מס - JEMS")?.id,
        title: "חצי ליטר בירה מתנה",
        description: "חצי ליטר בירה מתנה כל החודש",
        termsAndConditions: "תקף לכל החודש הקלנדרי של יום ההולדת",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.james.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "מיקה חנויות נוחות")?.id,
        title: "10 שח מתנה בהצגת תעודה מזהה",
        description: "10 שח מתנה בהצגת תעודה מזהה כל החודש",
        termsAndConditions: "תקף לכל החודש הקלנדרי של יום ההולדת, נדרשת הצגת תעודה מזהה",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.mika.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "KFC")?.id,
        title: "המבורגר 1+1 מתנה",
        description: "המבורגר 1+1 מתנה כל החודש",
        termsAndConditions: "תקף לכל החודש הקלנדרי של יום ההולדת",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.kfc.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "מנמ")?.id,
        title: "50 שח מתנה בקנייה מעל 300 שח",
        description: "50 שח מתנה בקנייה מעל 300 שח כל החודש",
        termsAndConditions: "תקף לכל החודש הקלנדרי של יום ההולדת, בקנייה מעל 300 שח",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.menam.co.il/birthday",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: false
      }
    ];
    
    await Promise.all(
      sampleBenefits.map(async (benefit) => {
        if (benefit.brandId) {
          const created = await prisma.benefit.create({
            data: benefit
          });
          console.log(`Created benefit: ${benefit.title}`);
          return created;
        }
      })
    );
    
    console.log(`Created ${sampleBenefits.length} benefits`);
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Error stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('Database disconnected');
  }
}

seed().catch(console.error); 