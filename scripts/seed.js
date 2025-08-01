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
    logoUrl: "/images/brands/kfc.png",
    website: "https://www.kfc.co.il",
    description: "הטבות על מזון מהיר",
    category: "food"
  },
  {
    name: "אסקייפרום",
    logoUrl: "🏷️",
    website: "https://www.escape-room.co.il",
    description: "50 שח הנחה בחודש יומולדת",
    category: "entertainment"
  },
  {
    name: "מסעדת באקרו (רעננה)",
    logoUrl: "🍽️",
    website: "https://www.bacaro.co.il",
    description: "מנה ראשונה וקינוח מתנה",
    category: "food"
  },
  {
    name: "שגב (מסעדה)",
    logoUrl: "🍽️",
    website: "https://www.shegev.co.il",
    description: "מנה ראשונה",
    category: "food"
  },
  {
    name: "ג'מס",
    logoUrl: "🍺",
    website: "https://www.james.co.il",
    description: "חצי ליטר בירה",
    category: "food"
  },
  {
    name: "פראג הקטנה (מסעדה)",
    logoUrl: "🍽️",
    website: "https://www.prague.co.il",
    description: "50 נק' מתנה",
    category: "food"
  },
  {
    name: "מיקה חנויות נוחות",
    logoUrl: "🏪",
    website: "https://www.mika.co.il",
    description: "10 שח מתנה בהצגת תעודה",
    category: "convenience"
  },
  {
    name: "מנמ עשה זאת בעצמך",
    logoUrl: "🔧",
    website: "https://www.menam.co.il",
    description: "50 שח מתנה (מעל 300)",
    category: "home"
  },
  {
    name: "שילב",
    logoUrl: "🏷️",
    website: "https://www.shilav.co.il",
    description: "הטבות על מוצרי תינוקות",
    category: "baby"
  },
  {
    name: "יומנגוס",
    logoUrl: "🍦",
    website: "https://www.yomango.co.il",
    description: "הטבות על גלידה",
    category: "food"
  },
  {
    name: "M32 המבורגרים",
    logoUrl: "🍔",
    website: "https://www.m32.co.il",
    description: "15% הנחה בחודש יומולדת",
    category: "food"
  },
  {
    name: "מסעדת ליבירה",
    logoUrl: "🍽️",
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
    
    // Create some sample benefits
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
        validityType: "birthday_date",
        validityDuration: 1
      },
      {
        brandId: createdBrands.find(b => b.name === "Super-Pharm - LifeStyle")?.id,
        title: "20% הנחה על כל הקנייה",
        description: "20% הנחה על כל הקנייה בחודש יום ההולדת",
        termsAndConditions: "תקף לחודש שלם, לא ניתן לשלב עם מבצעים אחרים",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.super-pharm.co.il/birthday",
        validityType: "birthday_month",
        validityDuration: 30
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