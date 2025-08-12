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
    name: "Fox",
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
    logoUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' rx='16' ry='16' fill='%23000'/><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-weight='bold' font-size='28' fill='%23fff'>BBB</text></svg>",
    website: "https://www.burgus.co.il/",
    description: "רשת מסעדות המבורגרים (BBB) – הטבות יום הולדת במסעדות הרשת",
    category: "food"
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
    name: "Nono & Mimi",
    logoUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' rx='16' ry='16' fill='%23000'/><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='%23fff'>NM</text></svg>",
    website: "https://nonomimi.com",
    description: "הטבות במסעדות נונו & מימי",
    category: "food",
    actionUrl: "https://nonomimi.com",
    actionType: "website",
    actionLabel: "הזמנה באתר Nono&Mimi"
  },
  {
    name: "Giraffe",
    logoUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' rx='16' ry='16' fill='%23f59e0b'/><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='%23000'>G</text></svg>",
    website: "https://www.giraffe.co.il/",
    description: "הטבות במסעדות ג'ירף",
    category: "food",
    actionUrl: "https://www.giraffe.co.il/",
    actionType: "website",
    actionLabel: "הזמנה באתר Giraffe"
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
    logoUrl: "/images/brands/buckaroo.svg",
    website: "https://www.buckaroo.co.il",
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
    name: "יומנגס",
    logoUrl: "/images/brands/humongous.svg",
    website: "https://www.humongous.co.il",
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
  },
  {
    name: "Lord Kitsch",
    logoUrl: "/images/brands/lordkitsch.png",
    website: "https://www.lordkitsch.co.il",
    description: "אופנת נשים",
    category: "fashion"
  },
  {
    name: "SOHO",
    logoUrl: "/images/brands/soho.png",
    website: "https://www.sohocenter.co.il",
    description: "הטבת יום הולדת לחברי מועדון הלקוחות",
    category: "home"
  },
  {
    name: "Lavido",
    logoUrl: "/images/brands/lavido.png",
    website: "https://www.lavido.com",
    description: "A birthday gift and a discount",
    category: "beauty"
  },
  {
    name: "Cafe Greg",
    logoUrl: "/images/brands/cafe-greg.png",
    website: "https://www.cafegreg.co.il",
    description: "Complimentary Belgian waffle",
    category: "food"
  },
  {
    name: "MAC Cosmetics",
    logoUrl: "/images/brands/mac.png",
    website: "https://www.maccosmetics.co.il",
    description: "A special birthday gift",
    category: "beauty"
  },
  {
    name: "Isrotel",
    logoUrl: "/images/brands/isrotel.png",
    website: "https://www.isrotel.co.il",
    description: "100 points, free spa entry, 20% off spa treatments, wine in room",
    category: "travel"
  },
  {
    name: "Roladin",
    logoUrl: "/images/brands/roladin.png",
    website: "https://www.roladin.co.il",
    description: "An unspecified birthday gift (e.g., pastry or coffee)",
    category: "food"
  },
  {
    name: "El Al",
    logoUrl: "/images/brands/elal.png",
    website: "https://www.elal.co.il",
    description: "Buy one flight ticket, get the second for 50% off + points",
    category: "travel"
  },
  {
    name: "rebar",
    logoUrl: "/images/brands/rebar.png",
    website: "https://www.rebar.co.il",
    description: "A discount on a birthday drink",
    category: "food"
  },
  {
    name: "Lev Cinema",
    logoUrl: "/images/brands/lev-cinema.png",
    website: "https://www.lev.co.il",
    description: "An unspecified birthday gift",
    category: "entertainment"
  },
  {
    name: "Max Brenner",
    logoUrl: "/images/brands/max-brenner.png",
    website: "https://www.maxbrenner.co.il",
    description: "Complimentary hot chocolate",
    category: "food"
  },
  {
    name: "ACE Hardware",
    logoUrl: "/images/brands/ace.png",
    website: "https://www.ace.co.il",
    description: "₪50 discount on a purchase of ₪299+",
    category: "home"
  },
  {
    name: "The Body Shop",
    logoUrl: "/images/brands/body-shop.png",
    website: "https://www.thebodyshop.co.il",
    description: "Birthday voucher (e.g., ~₪25)",
    category: "beauty"
  },
  {
    name: "Golda",
    logoUrl: "/images/brands/golda.png",
    website: "https://www.golda.co.il",
    description: "Unspecified benefit, likely bonus points",
    category: "food"
  },
  {
    name: "Dream Card",
    logoUrl: "/images/brands/dream-card.png",
    website: "https://www.dreamcard.co.il",
    description: "30% discount at each participating brand",
    category: "multi-brand"
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

    // Optional: create partnership (Nono & Mimi ↔ Giraffe)
    const nono = createdBrands.find(b => b.name === 'Nono & Mimi');
    const giraffe = createdBrands.find(b => b.name === 'Giraffe');
    if (nono && giraffe) {
      try {
        await prisma.brandPartnership.create({ data: { brandAId: nono.id, brandBId: giraffe.id } });
      } catch {}
    }

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
      },
      // Co-branded example between Nono & Mimi and Giraffe
      {
        brandId: createdBrands.find(b => b.name === "Nono & Mimi")?.id,
        title: "הטבה משותפת Nono & Giraffe",
        description: "קינוח מתנה או בקבוק יין בהצגת ת.ז בחודש יום ההולדת בסניפים משתתפים",
        termsAndConditions: "בתוקף בחודש יום ההולדת, בהזמנה מעל 80₪, לא כולל כפל מבצעים; הבחירה בין קינוח או בקבוק יין בהתאם לסניף ולמלאי",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://nonomimi.com",
        validityType: "birthday_entire_month",
        validityDuration: 30
      },
      // Giraffe specific: dessert or a wine bottle
      {
        brandId: createdBrands.find(b => b.name === "Giraffe")?.id,
        title: "קינוח או בקבוק יין מתנה",
        description: "בחודש יום ההולדת, בהצגת תעודה מזהה, תהנו מקינוח מתנה או בקבוק יין",
        termsAndConditions: "מימוש פעם אחת בלבד במהלך חודש יום ההולדת, בהזמנה מעל 80₪, בכפוף למלאי ובסניפים משתתפים",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.giraffe.co.il/",
        validityType: "birthday_entire_month",
        validityDuration: 30
      }
    ];

    await Promise.all(
      sampleBenefits.map(async (benefit) => {
        if (benefit.brandId) {
          return await prisma.benefit.create({
            data: {
              ...benefit,
              brandId: benefit.brandId as string
            }
          });
        }
      })
    );

    return NextResponse.json({
      message: "databaseSeedSuccess",
      brandsCreated: createdBrands.length,
      benefitsCreated: sampleBenefits.length
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { message: "databaseSeedError" },
      { status: 500 }
    );
  }
} 