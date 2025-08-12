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
    name: "Nono & Mimi",
    // Simple inline SVG logo placeholder to avoid missing assets
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
    description: "חדרי בריחה - 50 שח הנחה בחודש יומולדת",
    category: "entertainment"
  },
  {
    name: "באקרו - Buckaroo",
    logoUrl: "/images/brands/buckaroo.svg",
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
    name: "ג'מס - Jem's",
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
    name: "יומנגס",
    logoUrl: "/images/brands/humongous.svg",
    website: "https://www.humongous.co.il/",
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
  // DREAM CARD brands
  {
    name: "Terminal X",
    logoUrl: "/images/brands/terminal-x.png",
    website: "https://www.terminal-x.com",
    description: "30% הנחה הטבת יום ההולדת - כרטיס DREAM CARD",
    category: "fashion"
  },
  {
    name: "Billabong",
    logoUrl: "/images/brands/billabong.png",
    website: "https://www.billabong.co.il",
    description: "30% הנחה הטבת יום ההולדת - כרטיס DREAM CARD",
    category: "fashion"
  },
  {
    name: "Laline",
    logoUrl: "/images/brands/laline.png",
    website: "https://www.laline.co.il",
    description: "30% הנחה הטבת יום ההולדת - כרטיס DREAM CARD",
    category: "beauty"
  },
  {
    name: "The Children's Place",
    logoUrl: "/images/brands/tcp.png",
    website: "https://www.childrensplace.co.il",
    description: "30% הנחה הטבת יום ההולדת - כרטיס DREAM CARD",
    category: "kids"
  },
  {
    name: "Aerie",
    logoUrl: "/images/brands/aerie.png",
    website: "https://www.aerie.co.il",
    description: "30% הנחה הטבת יום ההולדת - כרטיס DREAM CARD",
    category: "fashion"
  },
  {
    name: "American Eagle",
    logoUrl: "/images/brands/american-eagle.png",
    website: "https://www.ae.co.il",
    description: "30% הנחה הטבת יום ההולדת - כרטיס DREAM CARD",
    category: "fashion"
  },
  {
    name: "Mango",
    logoUrl: "/images/brands/mango.png",
    website: "https://www.mango.co.il",
    description: "30% הנחה הטבת יום ההולדת - כרטיס DREAM CARD",
    category: "fashion"
  },
  {
    name: "Fox Home",
    logoUrl: "/images/brands/fox-home.png",
    website: "https://www.fox.co.il/home",
    description: "30% הנחה הטבת יום ההולדת - כרטיס DREAM CARD",
    category: "home"
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
        brandId: createdBrands.find(b => b.name === "ג'מס - Jem's")?.id,
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
      },
      {
        brandId: createdBrands.find(b => b.name === "SOHO")?.id,
        title: "50 ₪ מתנה לקנייה בחנויות SOHO",
        description: "₪50 gift voucher. Join 'The Friends of Soho' mailing list online (Free membership).",
        termsAndConditions: "Must have made a purchase of ₪99+ in the past year. Must present ID in-store. ההטבה הינה אישית ואינה ניתנת להעברה. ההטבה תקפה בקניית מוצר במחירו המלא ואינה כוללת כפל מבצעים והטבות. ההטבה ניתנת למימוש בחנויות סוהו בלבד. Contact: service@sohocenter.co.il",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.sohocenter.co.il",
        validityType: "birthday_plus_period",
        validityDuration: 14,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "Lavido")?.id,
        title: "Birthday Gift and Discount",
        description: "A birthday gift and a discount. Sign up for the LAVIDO Club online (Free membership).",
        termsAndConditions: "Given with a purchase made during the birthday month. Verification Status: Verified",
        redemptionMethod: "online",
        promoCode: null,
        url: "https://www.lavido.com",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "Cafe Greg")?.id,
        title: "Complimentary Belgian Waffle",
        description: "Complimentary Belgian waffle. Download the Cafe Greg app and register (Free membership).",
        termsAndConditions: "Requires the purchase of a main course. Verification Status: Verified",
        redemptionMethod: "app",
        promoCode: null,
        url: "https://www.cafegreg.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "MAC Cosmetics")?.id,
        title: "Special Birthday Gift",
        description: "A special birthday gift. Sign up for the M·A·C Lover program online or in-store (Free membership).",
        termsAndConditions: "Must be in the 'Devoted' tier or higher. Verification Status: Verified",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.maccosmetics.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "Isrotel")?.id,
        title: "100 Points + Spa Benefits + Wine",
        description: "100 points, free spa entry, 20% off spa treatments, wine in room. Sign up for Chug HaShemesh (₪250 / 2 years).",
        termsAndConditions: "Benefit applies from the second stay onwards. Verification Status: Verified",
        redemptionMethod: "online",
        promoCode: null,
        url: "https://www.isrotel.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: false
      },
      {
        brandId: createdBrands.find(b => b.name === "Roladin")?.id,
        title: "Birthday Gift",
        description: "An unspecified birthday gift (e.g., pastry or coffee). Sign up for MY ROLADIN online or in-store via QR code (Free membership).",
        termsAndConditions: "Must be a member for at least 3 months prior. Verification Status: Verified",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.roladin.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "El Al")?.id,
        title: "50% Off Second Flight + Points",
        description: "Buy one flight ticket, get the second for 50% off + points. Sign up for Frequent Flyer program ($25+ FLY CARD).",
        termsAndConditions: "Requires TOP status or FLY CARD. Valid on specific dates. Verification Status: Verified",
        redemptionMethod: "online",
        promoCode: null,
        url: "https://www.elal.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: false
      },
      {
        brandId: createdBrands.find(b => b.name === "rebar")?.id,
        title: "Birthday Drink Discount",
        description: "A discount on a birthday drink. Download the rebar app and register (Free membership).",
        termsAndConditions: "Unspecified discount amount. Verification Status: Verified",
        redemptionMethod: "app",
        promoCode: null,
        url: "https://www.rebar.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "Lev Cinema")?.id,
        title: "Birthday Gift",
        description: "An unspecified birthday gift. Purchase a ticket subscription package (Paid membership via ticket bundles).",
        termsAndConditions: "Gift is not specified. Verification Status: Verified",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.lev.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: false
      },
      {
        brandId: createdBrands.find(b => b.name === "Max Brenner")?.id,
        title: "Complimentary Hot Chocolate",
        description: "Complimentary hot chocolate. Download the app (Free membership).",
        termsAndConditions: "Based on Australian program. Requires local verification. 14 days before/after birthday. Verification Status: Requires Confirmation",
        redemptionMethod: "app",
        promoCode: null,
        url: "https://www.maxbrenner.co.il",
        validityType: "birthday_plus_period",
        validityDuration: 14,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "ACE Hardware")?.id,
        title: "₪50 Discount on ₪299+ Purchase",
        description: "₪50 discount on a purchase of ₪299+. Sign up for the customer club (Unspecified membership cost).",
        termsAndConditions: "Minimum purchase required. Verification Status: Israeli Offer Verified",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.ace.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: false
      },
      {
        brandId: createdBrands.find(b => b.name === "The Body Shop")?.id,
        title: "Birthday Voucher",
        description: "Birthday voucher (e.g., ~₪25). Sign up for Love Your Body online or in-store (Free membership).",
        termsAndConditions: "Based on UK/SA programs. Value in ILS requires local verification. Verification Status: Requires Confirmation",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.thebodyshop.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "Golda")?.id,
        title: "Birthday Bonus Points",
        description: "Unspecified benefit, likely bonus points ('Lek'). Download the Golda app and register (Free membership).",
        termsAndConditions: "Specific birthday benefit is not stated. Verification Status: Requires Confirmation",
        redemptionMethod: "app",
        promoCode: null,
        url: "https://www.golda.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
      },
      {
        brandId: createdBrands.find(b => b.name === "Dream Card")?.id,
        title: "30% Discount at Participating Brands",
        description: "30% discount at each participating brand. Sign up in-store at any participating brand or online (₪69 one-time membership).",
        termsAndConditions: "Max purchase of ₪500 per brand. One use per brand. Participating brands: Terminal X, Billabong, Laline, The Children's Place, Aerie, American Eagle, Mango, Fox Home, Fox. Verification Status: Verified",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://www.dreamcard.co.il",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: false
      },
      // Co-branded example between Nono & Mimi and Giraffe
      {
        brandId: createdBrands.find(b => b.name === "Nono & Mimi")?.id,
        title: "הטבה משותפת Nono & Giraffe",
        description: "קינוח מתנה בהצגת ת.ז בחודש יום ההולדת בסניפים משתתפים",
        termsAndConditions: "בתוקף בחודש יום ההולדת, בהזמנה מעל 80₪, לא כולל כפל מבצעים",
        redemptionMethod: "in-store",
        promoCode: null,
        url: "https://nonomimi.com",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        isFree: true
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

// Export for tooling/tests
module.exports = { predefinedBrands, seed };

// Run only when executed directly
if (require.main === module) {
  seed().catch(console.error);
}