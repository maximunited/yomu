/**
 * Unified Seeding Script
 * --------------------------------------
 * Purpose: Seed ALL brands, partnerships, and benefits in one place.
 * How to run:
 *   - Fresh install (wipe + seed):
 *       node scripts/seed.js --mode=fresh
 *   - Safe update (no wipe, upsert brands/benefits/partnerships):
 *       node scripts/seed.js --mode=upsert
 *   - Limit to specific brands (comma-separated):
 *       node scripts/seed.js --mode=upsert --brands="Giraffe,Nono & Mimi"
 * What it does:
 *   - On --mode=fresh only: clears benefits, memberships, partnerships, brands
 *   - Default mode is upsert (no wipe)
 *   - Creates/updates brands (including co-brands like Nono & Mimi and Giraffe)
 *   - Creates a brand partnership (Nono & Mimi ↔ Giraffe)
 *   - Seeds benefits, including a co-branded sample and a Giraffe-specific benefit
 * Notes:
 *   - Inline SVGs are used for new logos to avoid missing assets. Replace with files in public/images/brands/ when available.
 */
const { createPrismaClient, disconnectPrisma } = require('./prisma-client');

console.log('Starting seed script...');

const prisma = createPrismaClient();

/** Soft / uncertain research — benefits seed with verified: false */
const SOFT_BRAND_NAMES = new Set(['Shufersal', 'Isracard', 'Golda']);

const DREAM_CARD_ABOUT_URL = 'https://www.dreamcard.co.il/about';

const DREAM_CARD_BIRTHDAY_TERMS =
  'נדרשת חברות ב-Dream Card (₪69 חד-פעמי) או Dream Card VIP; עד ₪500 לקנייה (Dream Card) או ₪1,000 (VIP); מימוש חד-פעמי בכל מותג; לא ביחד עם הטבת הצטרפות; שילב אינה חלק מ-Dream Card; תקף מהחודש העוקב להצטרפות לחברים חדשים';

function buildDreamCardBirthdayBenefit(
  createdBrands,
  brandName,
  storeLabel,
  url = DREAM_CARD_ABOUT_URL
) {
  return {
    brandId: createdBrands.find((b) => b.name === brandName)?.id,
    title: '30% הנחה בחודש יום ההולדת (Dream Card)',
    description: `30% הנחה למימוש פעם אחת בחודש יום ההולדת ב${storeLabel} — דרך מועדון Dream Card של קבוצת פוקס`,
    termsAndConditions: DREAM_CARD_BIRTHDAY_TERMS,
    redemptionMethod: 'in-store',
    promoCode: null,
    url,
    validityType: 'birthday_entire_month',
    validityDuration: 30,
    isFree: false,
  };
}

const predefinedBrands = [
  {
    name: "McDonald's",
    logoUrl: '/images/brands/mcdonalds.png',
    website: 'https://www.mcdonalds.co.il',
    description: 'הטבות על מזון מהיר',
    category: 'food',
    actionUrl: 'https://www.mcdonalds.co.il',
    actionType: 'website',
    actionLabel: "לאתר McDonald's",
  },
  {
    name: 'Super-Pharm - LifeStyle',
    logoUrl: '/images/brands/super-pharm.png',
    website: 'https://www.super-pharm.co.il',
    description: 'הטבות על מוצרי בריאות ויופי',
    category: 'health',
    actionUrl: 'https://www.super-pharm.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Fox',
    logoUrl: '/images/brands/fox.png',
    website: 'https://www.fox.co.il',
    description:
      'מועדון Dream Card — 30% הנחה בחודש יום ההולדת ב-FOX ובמותגי הקבוצה',
    category: 'fashion',
    actionUrl:
      'https://fox.co.il/pages/dream-card-%D7%94%D7%98%D7%91%D7%95%D7%AA-%D7%9E%D7%95%D7%A2%D7%93%D7%95%D7%9F',
    actionType: 'website',
    actionLabel: 'הצטרפות ל-Dream Card',
  },
  {
    name: 'Isracard',
    logoUrl: '/images/brands/isracard.svg',
    website: 'https://www.isracard.co.il',
    description:
      'כרטיסי אשראי — אין מועדון קמעונאי אחיד; הטבות תלויות מוצר (לא יום הולדת קבוע)',
    category: 'transport',
    actionUrl: 'https://www.isracard.co.il',
    actionType: 'website',
    actionLabel: 'לאתר Isracard',
  },
  {
    name: 'H&M',
    logoUrl: '/images/brands/hm.png',
    website: 'https://www.hm.com/il',
    description: 'H&M Membership — הטבת יום הולדת שנתית משתנה',
    category: 'fashion',
    actionUrl: 'https://www.hm.com/il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
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
    description:
      'מועדון שופרסל — לא נמצאה הטבת יום הולדת אישית קבועה (קופונים מותאמים בלבד)',
    category: 'grocery',
    actionUrl: 'https://www.shufersal.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'KFC',
    logoUrl: '/images/brands/kfc.png',
    website: 'https://www.kfc.co.il',
    description: '1+1 על המבורגר קלאסי או זינגר בחודש יום ההולדת',
    category: 'food',
    actionUrl: 'https://www.kfc.co.il',
    actionType: 'website',
    actionLabel: 'לאתר KFC',
  },
  {
    name: 'Nono & Mimi',
    logoUrl: '/images/brands/nono-mimi.png',
    website: 'https://nonomimi.com',
    description: 'הטבות במסעדות נונו & מימי',
    category: 'food',
    actionUrl: 'https://nonomimi.com',
    actionType: 'website',
    actionLabel: 'הזמנה באתר Nono&Mimi',
  },
  {
    name: 'Giraffe',
    logoUrl: '/images/brands/giraffe.png',
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
    description: 'חדרי בריחה - 50 שח הנחה בחודש יומולדת',
    category: 'entertainment',
    actionUrl: 'https://www.escaperoom.co.il',
    actionType: 'website',
    actionLabel: 'לאתר אסקייפרום',
  },
  {
    name: 'באקרו - Buckaroo',
    logoUrl: '/images/brands/buckaroo.png',
    website: 'https://www.buckaroobbq.co.il',
    description: 'מסעדת בשרים - קינוח ומנה ראשונה מתנה',
    category: 'food',
    actionUrl: 'https://www.buckaroobbq.co.il',
    actionType: 'website',
    actionLabel: 'לאתר באקרו',
  },
  {
    name: 'שגב',
    logoUrl: '/images/brands/segev.png',
    website: 'https://www.segevchef.com',
    description: 'מנה ראשונה מתנה בישיבה בלבד כל החודש',
    category: 'food',
    actionUrl: 'https://www.segevchef.com',
    actionType: 'website',
    actionLabel: 'לאתר שגב',
  },
  {
    name: "ג'מס - Jem's",
    logoUrl: '/images/brands/james.png',
    website: 'https://www.jems.co.il',
    description: 'חצי ליטר בירה מתנה בישיבה בלבד כל החודש',
    category: 'food',
    actionUrl: 'https://www.jems.co.il',
    actionType: 'website',
    actionLabel: "לאתר ג'מס",
  },
  {
    name: 'פראג הקטנה',
    logoUrl: '/images/brands/prague.png',
    website: 'https://littleprague.co.il/',
    description: "מסעדה צ'כית אותנטית - כל החודש",
    category: 'food',
    actionUrl: 'https://littleprague.co.il/',
    actionType: 'website',
    actionLabel: 'לאתר פראג הקטנה',
  },
  {
    name: 'מיקה חנויות נוחות',
    logoUrl: '/images/brands/mika.jpg',
    website: 'https://www.mika.co.il',
    description: '10 שח מתנה בהצגת תעודה מזהה',
    category: 'convenience',
    actionUrl: 'https://www.mika.co.il',
    actionType: 'website',
    actionLabel: 'לאתר מיקה',
  },
  {
    name: 'מנמ - MNM',
    logoUrl: '/images/brands/menam.png',
    website: 'https://www.mnmltd.co.il/',
    description: '50 שח מתנה בקנייה מעל 300 שח',
    category: 'home',
    actionUrl: 'https://www.mnmltd.co.il/',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'שילב',
    logoUrl: '/images/brands/shilav.jpg',
    website: 'https://www.shilav.co.il',
    description: 'שילב — הטבות מועדון + Dream Card',
    category: 'baby',
    actionUrl: 'https://www.shilav.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
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
    name: 'מסעדת ליבירה',
    logoUrl: '/images/brands/libira.png',
    website: 'https://www.libira.co.il',
    description: 'בירה וקינוח בישיבה בלבד כל החודש',
    category: 'food',
    actionUrl: 'https://www.libira.co.il',
    actionType: 'website',
    actionLabel: 'לאתר ליבירה',
  },
  // Researched clubs (Notion — In YomU was false)
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
    description:
      'מועדון קיווי / Honigman Kids — הטבות יום הולדת לילדים רשומים (לא מועדון מבוגרים)',
    category: 'fashion',
    actionUrl:
      'https://kiwi-kids.co.il/%D7%9E%D7%95%D7%A2%D7%93%D7%95%D7%9F-%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA',
    actionType: 'website',
    actionLabel: 'תקנון מועדון לקוחות',
  },
  {
    name: 'Brill Group / Gali',
    logoUrl: '/images/brands/gali.svg',
    website: 'https://www.gali.co.il',
    description: 'קבוצת בריל — מועדון Super Friends (Gali ורשתות)',
    category: 'fashion',
    actionUrl: 'https://www.gali.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Jump / עונות',
    logoUrl: '/images/brands/jump.svg',
    website: 'https://www.jump.co.il',
    description: 'רשת אופנה עונות ו-Jump',
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
  // DREAM CARD brands
  {
    name: 'Terminal X',
    logoUrl: '/images/brands/terminal-x.png',
    website: 'https://www.terminalx.com',
    description: 'מועדון Dream Card — 30% הנחה בחודש יום ההולדת ב-Terminal X',
    category: 'fashion',
    actionUrl: 'https://www.dreamcard.co.il/about',
    actionType: 'website',
    actionLabel: 'הצטרפות ל-Dream Card',
  },
  {
    name: 'Billabong',
    logoUrl: '/images/brands/billabong.png',
    website: 'https://www.billabong.com',
    description: 'מועדון Dream Card — 30% הנחה בחודש יום ההולדת ב-Billabong',
    category: 'fashion',
    actionUrl: 'https://www.dreamcard.co.il/about',
    actionType: 'website',
    actionLabel: 'הצטרפות ל-Dream Card',
  },
  {
    name: 'Laline',
    logoUrl: '/images/brands/laline.png',
    website: 'https://www.laline.co.il',
    description: 'מועדון Dream Card — 30% הנחה בחודש יום ההולדת ב-Laline',
    category: 'beauty',
    actionUrl: 'https://www.dreamcard.co.il/about',
    actionType: 'website',
    actionLabel: 'הצטרפות ל-Dream Card',
  },
  {
    name: "The Children's Place",
    logoUrl: '/images/brands/tcp.png',
    website: 'https://www.dreamcard.co.il',
    description:
      "מועדון Dream Card — 30% הנחה בחודש יום ההולדת ב-The Children's Place",
    category: 'kids',
    actionUrl: 'https://www.dreamcard.co.il/about',
    actionType: 'website',
    actionLabel: 'הצטרפות ל-Dream Card',
  },
  {
    name: 'Aerie',
    logoUrl: '/images/brands/aerie.png',
    website: 'https://www.dreamcard.co.il',
    description: 'מועדון Dream Card — 30% הנחה בחודש יום ההולדת ב-Aerie',
    category: 'fashion',
    actionUrl: 'https://www.dreamcard.co.il/about',
    actionType: 'website',
    actionLabel: 'הצטרפות ל-Dream Card',
  },
  {
    name: 'American Eagle',
    logoUrl: '/images/brands/american-eagle.png',
    website: 'https://www.dreamcard.co.il',
    description:
      'מועדון Dream Card — 30% הנחה בחודש יום ההולדת ב-American Eagle',
    category: 'fashion',
    actionUrl: 'https://www.dreamcard.co.il/about',
    actionType: 'website',
    actionLabel: 'הצטרפות ל-Dream Card',
  },
  {
    name: 'Mango',
    logoUrl: '/images/brands/mango.png',
    website: 'https://shop.mango.com/il',
    description: 'מועדון Dream Card — 30% הנחה בחודש יום ההולדת ב-Mango',
    category: 'fashion',
    actionUrl: 'https://www.dreamcard.co.il/about',
    actionType: 'website',
    actionLabel: 'הצטרפות ל-Dream Card',
  },
  {
    name: 'Fox Home',
    logoUrl: '/images/brands/fox-home.png',
    website: 'https://www.fox.co.il',
    description: 'מועדון Dream Card — 30% הנחה בחודש יום ההולדת ב-FOX HOME',
    category: 'home',
    actionUrl:
      'https://fox.co.il/pages/dream-card-%D7%94%D7%98%D7%91%D7%95%D7%AA-%D7%9E%D7%95%D7%A2%D7%93%D7%95%D7%9F',
    actionType: 'website',
    actionLabel: 'הצטרפות ל-Dream Card',
  },
  {
    name: 'Lord Kitsch',
    logoUrl: '/images/brands/lordkitsch.png',
    website: 'https://www.lordkitsch.co.il',
    description: 'מועדון לקוחות בסניפים — הטבת יום הולדת מותאמת אישית ב-SMS',
    category: 'fashion',
    actionUrl:
      'https://www.lordkitsch.co.il/pages/36992-%D7%94%D7%98%D7%91%D7%AA-%D7%99%D7%95%D7%9D-%D7%94%D7%95%D7%9C%D7%93%D7%AA',
    actionType: 'website',
    actionLabel: 'הרשמה למועדון בסניף',
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
    actionUrl: 'https://gregcafe.co.il/club/',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
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
    website: 'https://max-brenner.co.il',
    description: 'מועדון מקס ברנר — קינוח מתנה בחודש יום ההולדת (תשלום שנתי)',
    category: 'food',
    actionUrl:
      'https://max-brenner.co.il/pages/%D7%AA%D7%A7%D7%A0%D7%95%D7%9F-%D7%9E%D7%95%D7%A2%D7%93%D7%95%D7%9F-%D7%A1%D7%A0%D7%99%D7%A4%D7%99%D7%9D',
    actionType: 'website',
    actionLabel: 'תקנון מועדון סניפים',
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
    website: 'https://www.bodyshop.co.il',
    description: 'מועדון Body Shop Israel — 30% הנחה ביום ההולדת',
    category: 'beauty',
    actionUrl: 'https://www.bodyshop.co.il/birthday',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
  {
    name: 'Golda',
    logoUrl: '/images/brands/golda.png',
    website: 'https://www.goldaglida.co.il',
    description:
      'אפליקציית גולדה + צבירת לק — אין הטבת יום הולדת רשמית מתועדת בתקנון',
    category: 'food',
    actionUrl: 'https://goldaglida.delivapp.com/he/home',
    actionType: 'website',
    actionLabel: 'לאפליקציית גולדה',
  },
  {
    name: 'Dream Card',
    logoUrl: '/images/brands/dream-card.png',
    website: 'https://www.dreamcard.co.il',
    description: '30% discount at each participating brand',
    category: 'multi-brand',
    actionUrl: 'https://www.dreamcard.co.il',
    actionType: 'website',
    actionLabel: 'הצטרפות למועדון',
  },
];

async function seed() {
  try {
    console.log('Starting database seed...');

    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    // Args
    const rawArgs = process.argv.slice(2);
    const args = rawArgs.reduce((acc, arg) => {
      const [k, v] = arg.replace(/^--/, '').split('=');
      acc[k] = v === undefined ? true : v;
      return acc;
    }, {});
    const mode = (args.mode || 'upsert').toLowerCase(); // 'fresh' | 'upsert'
    const brandFilter = (args.brands || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const shouldIncludeBrand = (name) =>
      brandFilter.length === 0 || brandFilter.includes(name);

    // Wipe only on fresh — never delete before mode is known
    if (mode === 'fresh') {
      if (brandFilter.length > 0) {
        throw new Error(
          'Refusing --mode=fresh with --brands=. Fresh wipe is global; omit --brands or use --mode=upsert.'
        );
      }
      console.log('Mode: fresh. Clearing existing data...');
      await prisma.benefit.deleteMany();
      await prisma.userMembership.deleteMany();
      await prisma.brandPartnership.deleteMany();
      await prisma.brand.deleteMany();
      console.log('Cleared existing data');
    } else {
      console.log(
        'Mode: upsert. Existing data will be updated/created without wiping.'
      );
    }

    console.log('Creating/updating brands...');
    // Legacy names → current seed names (rename-safe upsert)
    const brandNameAliases = {
      'יומנגס - Humongous': ['יומנגס'],
      'מנמ - MNM': ['מנמ', 'מנמ עשה זאת בעצמך'],
      'באקרו - Buckaroo': ['מסעדת באקרו (רעננה)', 'באקרו'],
      "ג'מס - Jem's": ["ג'מס"],
      שגב: ['שגב (מסעדה)'],
      'פראג הקטנה': ['פראג הקטנה (מסעדה)'],
    };

    async function upsertBrandByName(brand) {
      if (!shouldIncludeBrand(brand.name)) return null;
      const aliases = brandNameAliases[brand.name] || [];
      const existing = await prisma.brand.findFirst({
        where: {
          OR: [{ name: brand.name }, ...aliases.map((name) => ({ name }))],
        },
      });
      if (existing) {
        const updated = await prisma.brand.update({
          where: { id: existing.id },
          data: brand,
        });
        console.log(
          existing.name === brand.name
            ? `Updated brand: ${brand.name}`
            : `Renamed brand: ${existing.name} → ${brand.name}`
        );
        return updated;
      }
      const created = await prisma.brand.create({ data: brand });
      console.log(`Created brand: ${brand.name}`);
      return created;
    }

    const createdBrands = (
      await Promise.all(predefinedBrands.map((b) => upsertBrandByName(b)))
    ).filter(Boolean);

    console.log(`Created ${createdBrands.length} brands`);

    // Create brand partnerships (co-branding)
    const nono = createdBrands.find((b) => b.name === 'Nono & Mimi');
    const giraffe = createdBrands.find((b) => b.name === 'Giraffe');
    if (nono && giraffe) {
      // Ensure unique pair once (A->B)
      const existing = await prisma.brandPartnership.findFirst({
        where: { brandAId: nono.id, brandBId: giraffe.id },
      });
      if (!existing) {
        await prisma.brandPartnership.create({
          data: { brandAId: nono.id, brandBId: giraffe.id },
        });
        console.log('Created partnership: Nono & Mimi ↔ Giraffe');
      } else {
        console.log('Partnership already exists: Nono & Mimi ↔ Giraffe');
      }
    }

    // Create benefits with updated specifications
    console.log('Creating/updating benefits...');
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
        isFree: true,
      },
      // Minna Tomei: Free sushi roll with purchase over 50 NIS during birthday month
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
        isFree: true,
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
        isFree: true,
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
        isFree: false,
      },
      // BBB — Happy BBBirthday drink + starter
      {
        brandId: createdBrands.find((b) => b.name === 'BBB')?.id,
        title: 'Happy BBBirthday — שתייה ומנה ראשונה',
        description:
          'שתייה ומנה ראשונה מתנה בחודש יום ההולדת לחברי מועדון BBB (burgus.co.il/club)',
        termsAndConditions:
          'למימוש בחודש יום ההולדת לפי תקנון המועדון באתר BBB',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.burgus.co.il/club',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      // Humongous — free burger on exact birthday
      {
        brandId: createdBrands.find((b) => b.name === 'יומנגס - Humongous')?.id,
        title: 'המבורגר חינם ביום הולדת',
        description:
          'המבורגר חינם ביום ההולדת עצמו לחברי מועדון Humongous (לא גלידה)',
        termsAndConditions:
          'תקף ביום ההולדת בלבד | הצטרפות למועדון ב-humongous.co.il/fat',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.humongous.co.il/fat',
        validityType: 'birthday_exact_date',
        validityDuration: 1,
        isFree: true,
      },
      // M32 — 15% off birthday month (2nd member purchase only)
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
      // Castro CU
      {
        brandId: createdBrands.find((b) => b.name === 'Castro CU')?.id,
        title: '20% הנחה בחודש יום ההולדת',
        description: '20% הנחה לחברי מועדון CU בחודש יום ההולדת',
        termsAndConditions: 'לפי תקנון מועדון CU באתר Castro',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.castro.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // Delta
      {
        brandId: createdBrands.find((b) => b.name === 'Delta')?.id,
        title: '15% הנחה על רכישה אחת',
        description: '15% הנחה על רכישה אחת בחודש יום ההולדת',
        termsAndConditions: 'רכישה אחת בחודש יום ההולדת | לפי תקנון המועדון',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.delta.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // WOW
      {
        brandId: createdBrands.find((b) => b.name === 'WOW')?.id,
        title: '50% הנחה בחודש יום ההולדת',
        description: '50% הנחה לחברי מועדון WOW בחודש יום ההולדת',
        termsAndConditions: 'לפי תקנון המועדון ב-wow.co.il/customers-club',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.wow.co.il/customers-club',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // Cafe Mandarin
      {
        brandId: createdBrands.find((b) => b.name === 'Cafe Mandarin')?.id,
        title: '25% הנחה עד ₪300',
        description: '25% הנחה עד תקרת ₪300 בחודש יום ההולדת',
        termsAndConditions: 'לפי תקנון המועדון ב-mandarin.org.il/club',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.mandarin.org.il/club',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // Factory 54
      {
        brandId: createdBrands.find((b) => b.name === 'Factory 54')?.id,
        title: 'מתנת יום הולדת',
        description: 'מתנת יום הולדת לחברי מועדון Factory 54 (~₪49/שנה)',
        termsAndConditions: 'חברות בתשלום | לפי תקנון המועדון באתר',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.factory54.co.il/club',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // Golf & Co
      {
        brandId: createdBrands.find((b) => b.name === 'Golf & Co')?.id,
        title: 'הטבת יום הולדת למועדון',
        description: 'הטבת יום הולדת לחברי מועדון Golf & Co',
        termsAndConditions: 'לפי תקנון המועדון באתר Golf',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.golf.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      // Fox — Dream Card (verified 2026-08-16 — fox.co.il + dreamcard.co.il)
      {
        brandId: createdBrands.find((b) => b.name === 'Fox')?.id,
        title: '30% הנחה בחודש יום ההולדת (Dream Card)',
        description:
          '30% הנחה למימוש פעם אחת ב-FOX בחודש יום ההולדת — דרך מועדון Dream Card של קבוצת פוקס',
        termsAndConditions:
          'נדרשת חברות ב-Dream Card (₪69 חד-פעמי) או Dream Card VIP; עד ₪500 לקנייה (Dream Card) או ₪1,000 (VIP); מימוש חד-פעמי בכל מותג; לא ביחד עם הטבת הצטרפות; שילב אינה חלק מ-Dream Card; תקף מהחודש העוקב להצטרפות לחברים חדשים',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://fox.co.il/pages/dream-card-%D7%94%D7%98%D7%91%D7%95%D7%AA-%D7%9E%D7%95%D7%A2%D7%93%D7%95%D7%9F',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // Lord Kitsch (verified 2026-08-16 — מועדון בסניפים + SMS; אחוז לא מפורסם)
      {
        brandId: createdBrands.find((b) => b.name === 'Lord Kitsch')?.id,
        title: 'הטבת יום הולדת מותאמת אישית (SMS)',
        description:
          'חברי מועדון Lord Kitsch (הרשמה בסניף בלבד) מקבלים הטבת יום הולדת מותאמת אישית ב-SMS עם קישור למימוש בקופה',
        termsAndConditions:
          'המועדון פועל בסניפים בלבד (לא באתר); נדרשת תעודת זהות ותאריך לידה בהצטרפות; מימוש בהצגת SMS בקופה; אחוז ההנחה משתנה ואינו מפורסם בתקנון ציבורי — לפי מדיניות פרטיות lordkitsch.co.il (יוני 2026)',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.lordkitsch.co.il/pages/36992-%D7%94%D7%98%D7%91%D7%AA-%D7%99%D7%95%D7%9D-%D7%94%D7%95%D7%9C%D7%93%D7%AA',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // Dream Card partners (verified 2026-08-16 — dreamcard.co.il/about)
      buildDreamCardBirthdayBenefit(
        createdBrands,
        'Terminal X',
        'Terminal X',
        'https://www.terminalx.com'
      ),
      buildDreamCardBirthdayBenefit(createdBrands, 'Billabong', 'Billabong'),
      buildDreamCardBirthdayBenefit(
        createdBrands,
        'Laline',
        'Laline',
        'https://www.laline.co.il'
      ),
      buildDreamCardBirthdayBenefit(
        createdBrands,
        "The Children's Place",
        "The Children's Place"
      ),
      buildDreamCardBirthdayBenefit(createdBrands, 'Aerie', 'Aerie'),
      buildDreamCardBirthdayBenefit(
        createdBrands,
        'American Eagle',
        'American Eagle'
      ),
      buildDreamCardBirthdayBenefit(
        createdBrands,
        'Mango',
        'Mango',
        'https://shop.mango.com/il'
      ),
      buildDreamCardBirthdayBenefit(
        createdBrands,
        'Fox Home',
        'FOX HOME',
        'https://fox.co.il/pages/dream-card-%D7%94%D7%98%D7%91%D7%95%D7%AA-%D7%9E%D7%95%D7%A2%D7%93%D7%95%D7%9F'
      ),
      // H&M (verified 2026-08-14 — hm.com/hw_il regulations)
      {
        brandId: createdBrands.find((b) => b.name === 'H&M')?.id,
        title: 'הטבת יום הולדת שנתית',
        description:
          'הטבת יום הולדת חד-שנתית משתנה לחברי H&M Membership (סוג ההטבה נקבע מעת לעת)',
        termsAndConditions:
          'מימוש חד-פעמי בחודש הלועזי של יום ההולדת; באתר או בחנות (בחנות עם תעודה מזהה); לא כולל קולקציית מעצב ופרחים יבשים; נכנס לתוקף מהחודש העוקב להצטרפות אם נרשמת בחודש יום ההולדת',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www2.hm.com/hw_il/customer-service/legal-and-privacy/regulations.html',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // שילב — Dream Card (verified 2026-08-14 — dreamcard.co.il)
      {
        brandId: createdBrands.find((b) => b.name === 'שילב')?.id,
        title: '30% הנחה בחודש יום ההולדת (Dream Card)',
        description:
          '30% הנחה למימוש פעם אחת בחודש יום ההולדת בחנויות ובאתר שילב — לחברי Dream Card / Dream Card VIP',
        termsAndConditions:
          'נדרשת חברות ב-Dream Card; עד ₪500 לקנייה (Dream Card) או עד ₪1,000 (VIP); לא לממש יחד עם הטבת הצטרפות; מימוש באתר עם התחברות באותו מספר זהות',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.dreamcard.co.il/about',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // Honigman / Kiwi Kids club (verified 2026-08-14 — kiwi-kids.co.il מועדון לקוחות §24)
      {
        brandId: createdBrands.find((b) => b.name === 'Honigman')?.id,
        title: 'הטבת יום הולדת משתנה לילדים (מועדון קיווי)',
        description:
          'חברי מועדון קיווי / Honigman Kids זכאים להטבת יום הולדת משתנה לכל ילד רשום (עד 4) בחודש הקלנדרי שבו חל יום הולדתו',
        termsAndConditions:
          'מועדון ילדים בלבד (קיווי, Honigman Kids, Yidishkeit); ההטבה משתנה לפי שיקול דעת החברה; רישום עד 4 ילדים עם תאריכי לידה; מימוש בהצגת ספח ת.ז. הכולל שמות הילדים; הטבה אחת בלבד בחודש גם אם יותר מילד אחד חוגג באותו חודש; לא בחודש ההצטרפות; זמינות 30 יום לאחר עדכון פרטי הילדים בלינק מ-SMS; הטבה שלא מומשה בחודש יום ההולדת פוקעת',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://kiwi-kids.co.il/%D7%9E%D7%95%D7%A2%D7%93%D7%95%D7%9F-%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      // Brill Group / Gali (verified 2026-08-14 — gali.co.il/membership-terms)
      {
        brandId: createdBrands.find((b) => b.name === 'Brill Group / Gali')?.id,
        title: '20% הנחה ביום הולדת',
        description:
          'הנחה חד-פעמית של 20% מסכום רכישה בודדת בכל רשתות קבוצת בריל בחודש הלועזי שבו חל יום ההולדת',
        termsAndConditions:
          'מוגבל לרכישה אחת בכל רשת עד 700 ₪ כולל כפל מבצעים; חברה חדשה בחודש יום ההולדת — מהשנה הלועזית העוקבת; מימוש בסניף עם תעודה מזהה',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.gali.co.il/membership-terms',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // Jump / עונות (verified 2026-08-14 — onot.co.il/members-policy)
      {
        brandId: createdBrands.find((b) => b.name === 'Jump / עונות')?.id,
        title: '20% הנחה נוספת בחודש יום ההולדת',
        description: '20% הנחה נוספים על מבצעי החנות הקיימים בחודש יום ההולדת',
        termsAndConditions:
          'מימוש בסניף עם תעודה מזהה; ההנחה נוספת על מבצעים קיימים בחנות; חברות פעילה במועדון',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.onot.co.il/members-policy',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      // Burgers Bar — 10% off birthday month
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
      // Burger Station — free side dish birthday month (Station+)
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
        brandId: createdBrands.find((b) => b.name === 'אסקייפרום')?.id,
        title: '50 שח הנחה בחודש יומולדת',
        description:
          '50 שח הנחה על חדרי בריחה בחודש יום ההולדת - כל החודש הקלנדרי',
        termsAndConditions: 'תקף לכל החודש הקלנדרי של יום ההולדת',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.escaperoom.co.il/',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'באקרו - Buckaroo')?.id,
        title: 'קינוח ומנה ראשונה מתנה',
        description: 'קינוח ומנה ראשונה מתנה כל החודש',
        termsAndConditions: 'תקף לכל החודש הקלנדרי של יום ההולדת',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.buckaroobbq.co.il/',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'מסעדת ליבירה')?.id,
        title: 'הטבות מיוחדות כל החודש',
        description: 'הטבות מיוחדות במסעדת ליבירה כל החודש',
        termsAndConditions: 'תקף לכל החודש הקלנדרי של יום ההולדת',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.libira.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'פראג הקטנה')?.id,
        title: 'הטבות מיוחדות כל החודש',
        description: "הטבות מיוחדות במסעדה צ'כית אותנטית כל החודש",
        termsAndConditions: 'תקף לכל החודש הקלנדרי של יום ההולדת',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://littleprague.co.il/',
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
      {
        brandId: createdBrands.find((b) => b.name === 'מיקה חנויות נוחות')?.id,
        title: '10 שח מתנה בהצגת תעודה מזהה',
        description: '10 שח מתנה בהצגת תעודה מזהה כל החודש',
        termsAndConditions:
          'תקף לכל החודש הקלנדרי של יום ההולדת, נדרשת הצגת תעודה מזהה',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.mika.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      // KFC — 1+1 classic burger or Zinger (birthday month; 2nd member purchase only)
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
        brandId: createdBrands.find((b) => b.name === 'מנמ - MNM')?.id,
        title: '50 שח מתנה בקנייה מעל 300 שח',
        description: '50 שח מתנה בקנייה מעל 300 שח כל החודש',
        termsAndConditions:
          'תקף לכל החודש הקלנדרי של יום ההולדת, בקנייה מעל 300 שח',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.mnmltd.co.il/',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'SOHO')?.id,
        title: '50 ₪ מתנה לקנייה בחנויות SOHO',
        description:
          "₪50 gift voucher. Join 'The Friends of Soho' mailing list online (Free membership).",
        termsAndConditions:
          'Must have made a purchase of ₪99+ in the past year. Must present ID in-store. ההטבה הינה אישית ואינה ניתנת להעברה. ההטבה תקפה בקניית מוצר במחירו המלא ואינה כוללת כפל מבצעים והטבות. ההטבה ניתנת למימוש בחנויות סוהו בלבד. Contact: service@sohocenter.co.il',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.sohocenter.co.il',
        validityType: 'birthday_plus_period',
        validityDuration: 14,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Lavido')?.id,
        title: 'Birthday Gift and Discount',
        description:
          'A birthday gift and a discount. Sign up for the LAVIDO Club online (Free membership).',
        termsAndConditions:
          'Given with a purchase made during the birthday month. Verification Status: Verified',
        redemptionMethod: 'online',
        promoCode: null,
        url: 'https://www.lavido.com',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Cafe Greg')?.id,
        title: 'Complimentary Belgian Waffle',
        description:
          'Complimentary Belgian waffle. Download the Cafe Greg app and register (Free membership).',
        termsAndConditions:
          'Requires the purchase of a main course. Verification Status: Verified',
        redemptionMethod: 'app',
        promoCode: null,
        url: 'https://gregcafe.co.il/club/',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'MAC Cosmetics')?.id,
        title: 'Special Birthday Gift',
        description:
          'A special birthday gift. Sign up for the M·A·C Lover program online or in-store (Free membership).',
        termsAndConditions:
          "Must be in the 'Devoted' tier or higher. Verification Status: Verified",
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.maccosmetics.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Isrotel')?.id,
        title: '100 Points + Spa Benefits + Wine',
        description:
          '100 points, free spa entry, 20% off spa treatments, wine in room. Sign up for Chug HaShemesh (₪250 / 2 years).',
        termsAndConditions:
          'Benefit applies from the second stay onwards. Verification Status: Verified',
        redemptionMethod: 'online',
        promoCode: null,
        url: 'https://www.isrotel.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Roladin')?.id,
        title: 'Birthday Gift',
        description:
          'An unspecified birthday gift (e.g., pastry or coffee). Sign up for MY ROLADIN online or in-store via QR code (Free membership).',
        termsAndConditions:
          'Must be a member for at least 3 months prior. Verification Status: Verified',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.roladin.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'El Al')?.id,
        title: '50% Off Second Flight + Points',
        description:
          'Buy one flight ticket, get the second for 50% off + points. Sign up for Frequent Flyer program ($25+ FLY CARD).',
        termsAndConditions:
          'Requires TOP status or FLY CARD. Valid on specific dates. Verification Status: Verified',
        redemptionMethod: 'online',
        promoCode: null,
        url: 'https://www.elal.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'rebar')?.id,
        title: 'Birthday Drink Discount',
        description:
          'A discount on a birthday drink. Download the rebar app and register (Free membership).',
        termsAndConditions:
          'Unspecified discount amount. Verification Status: Verified',
        redemptionMethod: 'app',
        promoCode: null,
        url: 'https://www.rebar.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Lev Cinema')?.id,
        title: 'Birthday Gift',
        description:
          'An unspecified birthday gift. Purchase a ticket subscription package (Paid membership via ticket bundles).',
        termsAndConditions:
          'Gift is not specified. Verification Status: Verified',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.lev.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Max Brenner')?.id,
        title: 'קינוח מתנה בחודש יום ההולדת',
        description:
          'קינוח מתנה לחברי מועדון מקס ברנר (תשלום שנתי) — מימוש בחודש הקלנדרי של יום ההולדת בסניפי השוקולד בר',
        termsAndConditions:
          'מועדון סניפים בלבד (מופעל ע״י וליוקארד); דמי חברות שנתיים; אין כפל מבצעים; הטבות אישיות ולא ניתנות להעברה או להמרה בכסף — תקנון מועדון סניפים §3.3 max-brenner.co.il',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://max-brenner.co.il/pages/%D7%AA%D7%A7%D7%A0%D7%95%D7%9F-%D7%9E%D7%95%D7%A2%D7%93%D7%95%D7%9F-%D7%A1%D7%A0%D7%99%D7%A4%D7%99%D7%9D',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'ACE Hardware')?.id,
        title: '₪50 Discount on ₪299+ Purchase',
        description:
          '₪50 discount on a purchase of ₪299+. Sign up for the customer club (Unspecified membership cost).',
        termsAndConditions:
          'Minimum purchase required. Verification Status: Israeli Offer Verified',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.ace.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'The Body Shop')?.id,
        title: '30% הנחה ביום ההולדת',
        description:
          '30% הנחה על קנייה ממגוון מוצרי Body Shop Israel — לחברי מועדון הלקוחות',
        termsAndConditions:
          'מימוש עד חודש מתאריך יום ההולדת; אין כפל מבצעים; מק״ט הנחה 1964; הצגת ת.ז. ומסך ההטבה בחנות — bodyshop.co.il/birthday',
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.bodyshop.co.il/birthday',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Golda')?.id,
        title: 'אין הטבת יום הולדת רשמית מתועדת',
        description:
          'אפליקציית גולדה מציעה צבירת לק (Lek) על הזמנות, אך לא נמצא תקנון רשמי להטבת יום הולדת קבועה',
        termsAndConditions:
          'soft — שיווק עונתי/מארזים אפשריים; אין מקור רשמי לבונוס לק ביום הולדת; goldaglida.co.il + אפליקציית המשלוחים',
        redemptionMethod: 'app',
        promoCode: null,
        url: 'https://www.goldaglida.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: true,
      },
      {
        brandId: createdBrands.find((b) => b.name === 'Dream Card')?.id,
        title: '30% Discount at Participating Brands',
        description:
          '30% discount at each participating brand. Sign up in-store at any participating brand or online (₪69 one-time membership).',
        termsAndConditions:
          "עד ₪500 לקנייה (Dream Card) או ₪1,000 (VIP); מימוש חד-פעמי בכל מותג; מותגים: FOX, FOX HOME, AMERICAN EAGLE, AERIE, MANGO, FOOT LOCKER, LALINE, BILLABONG, THE CHILDREN'S PLACE, TERMINAL X, RUBY BAY, FLYING TIGER, SUNGLASSES HUT, QUICKSILVER (dreamcard.co.il/about); שילב אינה חלק מהמועדון",
        redemptionMethod: 'in-store',
        promoCode: null,
        url: 'https://www.dreamcard.co.il',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        isFree: false,
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
        isFree: true,
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
        isFree: true,
      },
    ];

    // Legacy benefit titles → current titles (rename-safe upsert by brand)
    const benefitTitleAliases = {
      "McDonald's": {
        'גלידה פיצוץ מתנה': ['המבורגר חינם ביום הולדת'],
      },
      'M32 המבורגרים': {
        '15% הנחה בחודש יום ההולדת': ['15% הנחה ביום הולדת'],
      },
      KFC: {
        '1+1 על המבורגר קלאסי או זינגר': ['המבורגר 1+1 מתנה'],
      },
      'Brill Group / Gali': {
        '20% הנחה ביום הולדת': ['~20% הנחה ביום הולדת'],
      },
      'Jump / עונות': {
        '20% הנחה נוספת בחודש יום ההולדת': ['מתנת יום הולדת ~₪50'],
      },
      Honigman: {
        'הטבת יום הולדת משתנה לילדים (מועדון קיווי)': ['מתנת יום הולדת'],
      },
      'Max Brenner': {
        'קינוח מתנה בחודש יום ההולדת': ['Complimentary Hot Chocolate'],
      },
      'The Body Shop': {
        '30% הנחה ביום ההולדת': ['Birthday Voucher'],
      },
      Golda: {
        'אין הטבת יום הולדת רשמית מתועדת': ['Birthday Bonus Points'],
      },
    };

    const now = new Date();
    await Promise.all(
      sampleBenefits.map(async (benefit) => {
        if (!benefit.brandId) return null;
        // Respect --brands filter by checking the brand name
        const brand = await prisma.brand.findUnique({
          where: { id: benefit.brandId },
        });
        if (!brand || !shouldIncludeBrand(brand.name)) return null;

        const isSoft = SOFT_BRAND_NAMES.has(brand.name);
        const benefitData = {
          ...benefit,
          verified: !isSoft,
          lastChecked: isSoft ? null : now,
        };

        // Upsert by (brandId + title), including legacy title aliases
        const titleAliases =
          benefitTitleAliases[brand.name]?.[benefit.title] || [];
        const existing = await prisma.benefit.findFirst({
          where: {
            brandId: benefit.brandId,
            OR: [
              { title: benefit.title },
              ...titleAliases.map((title) => ({ title })),
            ],
          },
        });
        if (mode === 'fresh') {
          const created = await prisma.benefit.create({ data: benefitData });
          console.log(`Created benefit: ${benefit.title}`);
          return created;
        }
        if (existing) {
          const updated = await prisma.benefit.update({
            where: { id: existing.id },
            data: benefitData,
          });
          console.log(`Updated benefit: ${benefit.title}`);
          return updated;
        }
        const created = await prisma.benefit.create({ data: benefitData });
        console.log(`Created benefit: ${benefit.title}`);
        return created;
      })
    );

    console.log(`Created ${sampleBenefits.length} benefits`);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Error stack:', error.stack);
  } finally {
    await disconnectPrisma();
    console.log('Database disconnected');
  }
}

// Export for tooling/tests
module.exports = { predefinedBrands, seed };

// Run only when executed directly
if (require.main === module) {
  seed().catch(console.error);
}
