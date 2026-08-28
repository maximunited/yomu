import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { captureException } from '@/lib/monitoring';

const SOFT_BRAND_NAMES = new Set([
  'H&M',
  'שילב',
  'Shufersal',
  'Isracard',
  'Honigman',
  'Brill Group / Gali',
  'Jump / עונות',
]);

const predefinedBrands = [
  {
    name: "McDonald's",
    logoUrl: '/images/brands/mcdonalds.png',
    website: 'https://www.mcdonalds.co.il',
    description: 'הטבות על מזון מהיר',
    category: 'food',
  },
  {
    name: 'Super-Pharm - LifeStyle',
    logoUrl: '/images/brands/super-pharm.png',
    website: 'https://www.super-pharm.co.il',
    description: 'הטבות על מוצרי בריאות ויופי',
    category: 'health',
  },
  {
    name: 'Fox',
    logoUrl: '/images/brands/fox.png',
    website: 'https://www.fox.co.il',
    description: 'הטבות על ביגוד והנעלה',
    category: 'fashion',
  },
  {
    name: 'Isracard',
    logoUrl: '/images/brands/isracard.png',
    website: 'https://www.isracard.co.il',
    description: 'הטבות על דלק ותחבורה',
    category: 'transport',
  },
  {
    name: 'H&M',
    logoUrl: '/images/brands/hm.png',
    website: 'https://www.hm.com/il',
    description: 'הטבות על ביגוד והנעלה',
    category: 'fashion',
  },
  {
    name: 'BBB',
    logoUrl: '/images/brands/bbb.png',
    website: 'https://www.burgus.co.il/',
    description: 'רשת מסעדות המבורגרים (BBB) – הטבות יום הולדת במסעדות הרשת',
    category: 'food',
    actionUrl: 'https://www.burgus.co.il/club',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Shufersal',
    logoUrl: '/images/brands/shufersal.png',
    website: 'https://www.shufersal.co.il',
    description: 'הטבות על מוצרי מזון',
    category: 'grocery',
  },
  {
    name: 'KFC',
    logoUrl: '/images/brands/kfc.png',
    website: 'https://www.kfc.co.il',
    description: '1+1 על המבורגר קלאסי או זינגר בחודש יום ההולדת',
    category: 'food',
  },
  {
    name: 'Nono & Mimi',
    logoUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' rx='16' ry='16' fill='%23000'/><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='%23fff'>NM</text></svg>",
    website: 'https://nonomimi.com',
    description: 'הטבות במסעדות נונו & מימי',
    category: 'food',
    actionUrl: 'https://nonomimi.com',
    actionType: 'website',
    actionLabel: 'הזמנה באתר Nono&Mimi',
  },
  {
    name: 'Giraffe',
    logoUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' rx='16' ry='16' fill='%23f59e0b'/><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='%23000'>G</text></svg>",
    website: 'https://www.giraffe.co.il/',
    description: "הטבות במסעדות ג'ירף",
    category: 'food',
    actionUrl: 'https://www.giraffe.co.il/',
    actionType: 'website',
    actionLabel: 'הזמנה באתר Giraffe',
  },
  {
    name: 'Minna Tomei',
    logoUrl: '/images/brands/minna-tomei.png',
    website: 'https://www.minna-tomei.co.il',
    description: 'מועדון לקוחות Minna Tomei',
    category: 'food',
    actionUrl: 'https://www.minna-tomei.co.il/members/',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון Minna Tomei',
  },
  {
    name: 'אסקייפרום',
    logoUrl: '/images/brands/escape-room.png',
    website: 'https://www.escaperoom.co.il',
    description: '50 שח הנחה בחודש יומולדת',
    category: 'entertainment',
  },
  {
    name: 'באקרו - Buckaroo',
    logoUrl: '/images/brands/buckaroo.png',
    website: 'https://www.buckaroobbq.co.il',
    description: 'מנה ראשונה וקינוח מתנה',
    category: 'food',
  },
  {
    name: 'שגב',
    logoUrl: '/images/brands/segev.png',
    website: 'https://www.segevchef.com',
    description: 'מנה ראשונה מתנה בישיבה בלבד כל החודש',
    category: 'food',
  },
  {
    name: "ג'מס - Jem's",
    logoUrl: '/images/brands/james.png',
    website: 'https://www.jems.co.il',
    description: 'חצי ליטר בירה מתנה בישיבה בלבד כל החודש',
    category: 'food',
  },
  {
    name: 'פראג הקטנה',
    logoUrl: '/images/brands/prague.png',
    website: 'https://littleprague.co.il/',
    description: "מסעדה צ'כית אותנטית - כל החודש",
    category: 'food',
  },
  {
    name: 'מיקה חנויות נוחות',
    logoUrl: '/images/brands/mika.jpg',
    website: 'https://www.mika.co.il',
    description: '10 שח מתנה בהצגת תעודה',
    category: 'convenience',
  },
  {
    name: 'מנמ - MNM',
    logoUrl: '/images/brands/menam.png',
    website: 'https://www.mnmltd.co.il/',
    description: '50 שח מתנה (מעל 300)',
    category: 'home',
  },
  {
    name: 'שילב',
    logoUrl: '/images/brands/shilav.jpg',
    website: 'https://www.shilav.co.il',
    description: 'הטבות על מוצרי תינוקות',
    category: 'baby',
  },
  {
    name: 'יומנגס - Humongous',
    logoUrl: '/images/brands/humongous.png',
    website: 'https://www.humongous.co.il/',
    description: 'רשת המבורגרים - הטבות יום הולדת',
    category: 'food',
    actionUrl: 'https://www.humongous.co.il/fat',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'M32 המבורגרים',
    logoUrl: '/images/brands/m32.png',
    website: 'https://www.m32.co.il',
    description: '15% הנחה בחודש יום ההולדת',
    category: 'food',
    actionUrl: 'https://www.m32.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Castro CU',
    logoUrl: '/images/brands/castro.svg',
    website: 'https://www.castro.co.il',
    description: 'מועדון CU - 20% הנחה בחודש יום ההולדת',
    category: 'fashion',
    actionUrl: 'https://www.castro.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Delta',
    logoUrl: '/images/brands/delta.svg',
    website: 'https://www.delta.co.il',
    description: '15% הנחה על רכישה אחת בחודש יום ההולדת',
    category: 'fashion',
    actionUrl: 'https://www.delta.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'WOW',
    logoUrl: '/images/brands/wow.svg',
    website: 'https://www.wow.co.il',
    description: 'מועדון לקוחות - 50% הנחה בחודש יום ההולדת',
    category: 'fashion',
    actionUrl: 'https://www.wow.co.il/customers-club',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Cafe Mandarin',
    logoUrl: '/images/brands/cafe-mandarin.svg',
    website: 'https://www.mandarin.org.il',
    description: 'מועדון לקוחות - 25% הנחה עד ₪300',
    category: 'food',
    actionUrl: 'https://www.mandarin.org.il/club',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Factory 54',
    logoUrl: '/images/brands/factory54.svg',
    website: 'https://www.factory54.co.il',
    description: 'מועדון לקוחות - מתנת יום הולדת (~₪49/שנה)',
    category: 'fashion',
    actionUrl: 'https://www.factory54.co.il/club',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Golf & Co',
    logoUrl: '/images/brands/golf.svg',
    website: 'https://www.golf.co.il',
    description: 'מועדון לקוחות - הטבת יום הולדת',
    category: 'fashion',
    actionUrl: 'https://www.golf.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Honigman',
    logoUrl: '/images/brands/honigman.svg',
    website: 'https://www.honigman.com',
    description: 'מתנת יום הולדת (תנאים לא ודאיים — לאימות)',
    category: 'fashion',
    actionUrl: 'https://www.honigman.com',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Brill Group / Gali',
    logoUrl: '/images/brands/gali.svg',
    website: 'https://www.gali.co.il',
    description: '~20% הנחה ביום הולדת (לאימות)',
    category: 'fashion',
    actionUrl: 'https://www.gali.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Jump / עונות',
    logoUrl: '/images/brands/jump.svg',
    website: 'https://www.jump.co.il',
    description: 'מתנת יום הולדת ~₪50 (לאימות)',
    category: 'fashion',
    actionUrl: 'https://www.jump.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Burgers Bar',
    logoUrl: '/images/brands/burgers-bar.svg',
    website: 'https://burgersbar.co.il',
    description: '10% הנחה בחודש יום ההולדת',
    category: 'food',
    actionUrl: 'https://burgersbar.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Burger Station',
    logoUrl: '/images/brands/burger-station.png',
    website: 'https://burgerstation.co.il',
    description: 'תוספת חינם בחודש יום ההולדת - מועדון Station+',
    category: 'food',
    actionUrl: 'https://burgerstation.co.il/club/',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'מסעדת ליבירה',
    logoUrl: '/images/brands/libira.png',
    website: 'https://www.libira.co.il',
    description: 'בירה וקינוח בישיבה בלבד כל החודש',
    category: 'food',
  },
  {
    name: 'Lord Kitsch',
    logoUrl: '/images/brands/lordkitsch.png',
    website: 'https://www.lordkitsch.co.il',
    description: 'אופנת נשים',
    category: 'fashion',
  },
  {
    name: 'SOHO',
    logoUrl: '/images/brands/soho.png',
    website: 'https://www.sohocenter.co.il',
    description: 'הטבת יום הולדת לחברי מועדון הלקוחות',
    category: 'home',
  },
  {
    name: 'Lavido',
    logoUrl: '/images/brands/lavido.png',
    website: 'https://www.lavido.com',
    description: 'A birthday gift and a discount',
    category: 'beauty',
  },
  {
    name: 'Cafe Greg',
    logoUrl: '/images/brands/cafe-greg.png',
    website: 'https://gregcafe.co.il/',
    description: 'Complimentary Belgian waffle',
    category: 'food',
  },
  {
    name: 'MAC Cosmetics',
    logoUrl: '/images/brands/mac.png',
    website: 'https://www.maccosmetics.co.il',
    description: 'A special birthday gift',
    category: 'beauty',
  },
  {
    name: 'Isrotel',
    logoUrl: '/images/brands/isrotel.png',
    website: 'https://www.isrotel.co.il',
    description:
      '100 points, free spa entry, 20% off spa treatments, wine in room',
    category: 'travel',
  },
  {
    name: 'Roladin',
    logoUrl: '/images/brands/roladin.png',
    website: 'https://www.roladin.co.il',
    description: 'An unspecified birthday gift (e.g., pastry or coffee)',
    category: 'food',
  },
  {
    name: 'El Al',
    logoUrl: '/images/brands/elal.png',
    website: 'https://www.elal.co.il',
    description: 'Buy one flight ticket, get the second for 50% off + points',
    category: 'travel',
  },
  {
    name: 'rebar',
    logoUrl: '/images/brands/rebar.png',
    website: 'https://www.rebar.co.il',
    description: 'A discount on a birthday drink',
    category: 'food',
  },
  {
    name: 'Lev Cinema',
    logoUrl: '/images/brands/lev-cinema.png',
    website: 'https://www.lev.co.il',
    description: 'An unspecified birthday gift',
    category: 'entertainment',
  },
  {
    name: 'Max Brenner',
    logoUrl: '/images/brands/max-brenner.png',
    website: 'https://www.maxbrenner.co.il',
    description: 'Complimentary hot chocolate',
    category: 'food',
  },
  {
    name: 'ACE Hardware',
    logoUrl: '/images/brands/ace.png',
    website: 'https://www.ace.co.il',
    description: '₪50 discount on a purchase of ₪299+',
    category: 'home',
  },
  {
    name: 'The Body Shop',
    logoUrl: '/images/brands/body-shop.png',
    website: 'https://www.thebodyshop.co.il',
    description: 'Birthday voucher (e.g., ~₪25)',
    category: 'beauty',
  },
  {
    name: 'Golda',
    logoUrl: '/images/brands/golda.png',
    website: 'https://www.golda.co.il',
    description: 'Unspecified benefit, likely bonus points',
    category: 'food',
  },
  {
    name: 'Dream Card',
    logoUrl: '/images/brands/dream-card.png',
    website: 'https://www.dreamcard.co.il',
    description: '30% discount at each participating brand',
    category: 'multi-brand',
  },
];

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  // Prefer CLI seed in all environments. Opt-in only via ALLOW_API_SEED=1.
  if (process.env.ALLOW_API_SEED !== '1') {
    return NextResponse.json(
      {
        error:
          'API seed is disabled. Use `node scripts/seed.js --mode=upsert` (set ALLOW_API_SEED=1 to override).',
      },
      { status: 403 }
    );
  }

  try {
    // Clear existing brands and benefits (admin + ALLOW_API_SEED only)
    await prisma.benefit.deleteMany();
    await prisma.userMembership.deleteMany();
    await prisma.brand.deleteMany();

    // Create brands
    const createdBrands = await Promise.all(
      predefinedBrands.map(async (brand) => {
        return await prisma.brand.create({
          data: brand,
        });
      })
    );

    // Optional: create partnership (Nono & Mimi ↔ Giraffe)
    const nono = createdBrands.find((b) => b.name === 'Nono & Mimi');
    const giraffe = createdBrands.find((b) => b.name === 'Giraffe');
    if (nono && giraffe) {
      try {
        await prisma.brandPartnership.create({
          data: { brandAId: nono.id, brandBId: giraffe.id },
        });
      } catch {}
    }

    // Create some sample benefits
    const sampleBenefits = [
      {
        brandId: createdBrands.find((b) => b.name === "McDonald's")?.id,
        title: 'גלידה פיצוץ מתנה',
        description:
          "גלידה פיצוץ בגודל רגיל מיום ההולדת ולמשך 10 ימים לחברי אפליקציית McDonald's",
        termsAndConditions:
          'גודל רגיל בלבד | מיום ההולדת + 10 ימים | לא תקף למשלוחים | לפי תקנון האפליקציה',
        redemptionMethod: 'app',
        promoCode: null,
        url: 'https://www.mcdonalds.co.il',
        validityType: 'birthday_10_days_after',
        validityDuration: 10,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'BBB')?.id,
        title: 'Happy BBBirthday — שתייה ומנה ראשונה',
        description: 'שתייה ומנה ראשונה מתנה בחודש יום ההולדת לחברי מועדון BBB',
        termsAndConditions: 'למימוש בחודש יום ההולדת לפי תקנון המועדון',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.burgus.co.il/club',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'יומנגס - Humongous')?.id,
        title: 'המבורגר חינם ביום הולדת',
        description: 'המבורגר חינם ביום ההולדת עצמו לחברי מועדון Humongous',
        termsAndConditions: 'תקף ביום ההולדת בלבד',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.humongous.co.il/fat',
        validityType: 'birthday_exact_date',
        validityDuration: 1,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'M32 המבורגרים')?.id,
        title: '15% הנחה בחודש יום ההולדת',
        description: '15% הנחה בחודש יום ההולדת במסעדות M32',
        termsAndConditions:
          'ההנחה חלה רק על הרכישה השנייה כחבר מועדון (לא על רכישת ההצטרפות) | לפי תקנון המועדון באתר M32',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.m32.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'KFC')?.id,
        title: '1+1 על המבורגר קלאסי או זינגר',
        description:
          '1+1 על המבורגר קלאסי או זינגר בחודש יום ההולדת לחברי מועדון KFC',
        termsAndConditions:
          'ההטבה חלה רק על הרכישה השנייה כחבר מועדון (לא על רכישת ההצטרפות) | תקף לכל החודש הקלנדרי של יום ההולדת | לפי תקנון המועדון באתר KFC',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.kfc.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Castro CU')?.id,
        title: '20% הנחה בחודש יום ההולדת',
        description: '20% הנחה לחברי מועדון CU בחודש יום ההולדת',
        termsAndConditions: 'לפי תקנון מועדון CU',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.castro.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Delta')?.id,
        title: '15% הנחה על רכישה אחת',
        description: '15% הנחה על רכישה אחת בחודש יום ההולדת',
        termsAndConditions: 'רכישה אחת בחודש יום ההולדת',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.delta.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'WOW')?.id,
        title: '50% הנחה בחודש יום ההולדת',
        description: '50% הנחה לחברי מועדון WOW בחודש יום ההולדת',
        termsAndConditions: 'לפי תקנון המועדון',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.wow.co.il/customers-club',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Cafe Mandarin')?.id,
        title: '25% הנחה עד ₪300',
        description: '25% הנחה עד תקרת ₪300 בחודש יום ההולדת',
        termsAndConditions: 'לפי תקנון המועדון',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.mandarin.org.il/club',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Factory 54')?.id,
        title: 'מתנת יום הולדת',
        description: 'מתנת יום הולדת לחברי מועדון Factory 54 (~₪49/שנה)',
        termsAndConditions: 'חברות בתשלום',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.factory54.co.il/club',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Golf & Co')?.id,
        title: 'הטבת יום הולדת למועדון',
        description: 'הטבת יום הולדת לחברי מועדון Golf & Co',
        termsAndConditions: 'לפי תקנון המועדון',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.golf.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Honigman')?.id,
        title: 'מתנת יום הולדת',
        description: 'מתנת יום הולדת (תנאים לא ודאיים — לאימות)',
        termsAndConditions: 'לא מאומת במלואו',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.honigman.com',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Brill Group / Gali')?.id,
        title: '~20% הנחה ביום הולדת',
        description: 'כ־20% הנחה ביום הולדת (לאימות)',
        termsAndConditions: 'לא מאומת במלואו',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.gali.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Jump / עונות')?.id,
        title: 'מתנת יום הולדת ~₪50',
        description: 'מתנת יום הולדת בסך כ־₪50 (לאימות)',
        termsAndConditions: 'לא מאומת במלואו',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.jump.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Burgers Bar')?.id,
        title: '10% הנחה בחודש יום ההולדת',
        description: '10% הנחה בחודש יום ההולדת ברשת Burgers Bar',
        termsAndConditions:
          'לא ניתן לשלב עם מבצעים אחרים (no double discounts) | לפי תקנון המועדון',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://burgersbar.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Burger Station')?.id,
        title: 'תוספת חינם בחודש יום ההולדת',
        description:
          'תוספת חינם בחודש יום ההולדת לחברי מועדון Station+ ברשת בורגר סטיישן',
        termsAndConditions:
          'מועדון Station+ חינמי | לפי תקנון המועדון ב-burgerstation.co.il/club | מגבלות שילוב לפי תקנון האתר',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://burgerstation.co.il/club/',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'שגב')?.id,
        title: 'מנה ראשונה מתנה',
        description: 'מנה ראשונה מתנה בחודש יום ההולדת — בישיבה בלבד',
        termsAndConditions:
          'תקף לכל החודש הקלנדרי של יום ההולדת | למימוש בישיבה בלבד | אין כפל מבצעים',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.segevchef.com',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === "ג'מס - Jem's")?.id,
        title: 'חצי ליטר בירה מתנה',
        description:
          'חצי ליטר בירה מתנה בחודש יום ההולדת — בישיבה בלבד (לא לטייק אוויי / משלוחים)',
        termsAndConditions:
          'תקף לכל החודש הקלנדרי של יום ההולדת | למימוש בישיבה בלבד (לא לטייק אוויי / משלוחים)',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.jems.co.il/',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      // Minna Tomei: Free sushi roll during birthday month
      {
        brandId: createdBrands.find((b) => b.name === 'Minna Tomei')?.id,
        title: 'רול סושי לבחירה מתנה בעסקה מעל 50 שקלים',
        description:
          'למימוש חד פעמי בחודש יום ההולדת בהצגת ת.ז; הרול הזול מבין הרולים בעסקה',
        termsAndConditions:
          'למימוש חד פעמי | תקף בחודש הקלנדרי של יום ההולדת | הרול הזול מבין הרולים בעסקה',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.minna-tomei.co.il/members/',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      // Minna Tomei: 5% points accumulation (year-round)
      {
        brandId: createdBrands.find((b) => b.name === 'Minna Tomei')?.id,
        title: '5% צבירת נקודות',
        description: 'צבירת 5% נקודות בכל ביקור לחברי מועדון Minna Tomei',
        termsAndConditions: 'לפי תקנון המועדון באתר',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.minna-tomei.co.il/members/',
        validityType: 'always',
        validityDuration: null,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Super-Pharm - LifeStyle')
          ?.id,
        title: '20% הנחה על כל הקנייה',
        description: '20% הנחה על כל הקנייה בחודש יום ההולדת',
        termsAndConditions: 'תקף לחודש שלם, לא ניתן לשלב עם מבצעים אחרים',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.super-pharm.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      // Co-branded example between Nono & Mimi and Giraffe
      {
        brandId: createdBrands.find((b) => b.name === 'Nono & Mimi')?.id,
        title: 'הטבה משותפת Nono & Giraffe',
        description:
          'קינוח מתנה או בקבוק יין בהצגת ת.ז בחודש יום ההולדת בסניפים משתתפים',
        termsAndConditions:
          'בתוקף בחודש יום ההולדת, בהזמנה מעל 80₪, לא כולל כפל מבצעים; הבחירה בין קינוח או בקבוק יין בהתאם לסניף ולמלאי',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://nonomimi.com',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
      // Giraffe specific: dessert or a wine bottle
      {
        brandId: createdBrands.find((b) => b.name === 'Giraffe')?.id,
        title: 'קינוח או בקבוק יין מתנה',
        description:
          'בחודש יום ההולדת, בהצגת תעודה מזהה, תהנו מקינוח מתנה או בקבוק יין',
        termsAndConditions:
          'מימוש פעם אחת בלבד במהלך חודש יום ההולדת, בהזמנה מעל 80₪, בכפוף למלאי ובסניפים משתתפים',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.giraffe.co.il/',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
      },
    ];

    const now = new Date();
    await Promise.all(
      sampleBenefits.map(async (benefit) => {
        if (benefit.brandId) {
          const brand = createdBrands.find((b) => b.id === benefit.brandId);
          const isSoft = brand ? SOFT_BRAND_NAMES.has(brand.name) : false;
          return await prisma.benefit.create({
            data: {
              ...benefit,
              brandId: benefit.brandId as string,
              verified: !isSoft,
              lastChecked: isSoft ? null : now,
            },
          });
        }
      })
    );

    return NextResponse.json({
      message: 'databaseSeedSuccess',
      brandsCreated: createdBrands.length,
      benefitsCreated: sampleBenefits.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    await captureException(error, {
      tags: { area: 'api-seed', stage: 'post' },
    });
    return NextResponse.json({ message: 'databaseSeedError' }, { status: 500 });
  }
}
