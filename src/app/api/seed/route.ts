import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    description: "50 שח הנחה בחודש יומולדת",
    category: "entertainment"
  },
  {
    name: "מסעדת באקרו (רעננה)",
    logoUrl: "/images/brands/bacaro.svg",
    website: "https://www.bacaro.co.il",
    description: "מנה ראשונה וקינוח מתנה",
    category: "food"
  },
  {
    name: "שגב (מסעדה)",
    logoUrl: "/images/brands/shegev.svg",
    website: "https://www.shegev.co.il",
    description: "מנה ראשונה",
    category: "food"
  },
  {
    name: "ג'מס",
    logoUrl: "/images/brands/james.svg",
    website: "https://www.james.co.il",
    description: "חצי ליטר בירה",
    category: "food"
  },
  {
    name: "פראג הקטנה (מסעדה)",
    logoUrl: "/images/brands/prague.svg",
    website: "https://www.prague.co.il",
    description: "50 נק' מתנה",
    category: "food"
  },
  {
    name: "מיקה חנויות נוחות",
    logoUrl: "/images/brands/mika.svg",
    website: "https://www.mika.co.il",
    description: "10 שח מתנה בהצגת תעודה",
    category: "convenience"
  },
  {
    name: "מנמ עשה זאת בעצמך",
    logoUrl: "/images/brands/menam.svg",
    website: "https://www.menam.co.il",
    description: "50 שח מתנה (מעל 300)",
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

export async function POST(request: NextRequest) {
  try {
    // Clear existing brands and benefits
    await prisma.benefit.deleteMany();
    await prisma.userMembership.deleteMany();
    await prisma.brand.deleteMany();

    // Create brands
    const createdBrands = await Promise.all(
      predefinedBrands.map(async (brand) => {
        return await prisma.brand.create({
          data: brand
        });
      })
    );

    // Create some sample benefits
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
          return await prisma.benefit.create({
            data: benefit
          });
        }
      })
    );

    return NextResponse.json({
      message: "Database seeded successfully",
      brandsCreated: createdBrands.length,
      benefitsCreated: sampleBenefits.length
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { message: "Error seeding database" },
      { status: 500 }
    );
  }
} 