/**
 * Benefit termsUrl resolution (no Prisma / DB).
 * Shared by seed.js and catalog ops parsers.
 */

const DREAM_CARD_ABOUT_URL = 'https://www.dreamcard.co.il/about';

const MINNA_TOMEI_TERMS_URL =
  'https://www.minna-tomei.co.il/wp-content/uploads/2026/08/%D7%97%D7%93%D7%A9-%D7%AA%D7%A7%D7%A0%D7%95%D7%9F-%D7%9E%D7%99%D7%A0%D7%94-%D7%98%D7%95%D7%9E%D7%99%D7%99.pdf';

/** Official full terms/disclaimer URLs where known (overrides benefit.url). */
const BRAND_TERMS_URLS = {
  'Minna Tomei': MINNA_TOMEI_TERMS_URL,
  Fox: DREAM_CARD_ABOUT_URL,
  'Terminal X': DREAM_CARD_ABOUT_URL,
  Billabong: DREAM_CARD_ABOUT_URL,
  Laline: DREAM_CARD_ABOUT_URL,
  Aerie: DREAM_CARD_ABOUT_URL,
  'American Eagle': DREAM_CARD_ABOUT_URL,
  Mango: DREAM_CARD_ABOUT_URL,
  'Fox Home': DREAM_CARD_ABOUT_URL,
  'Lord Kitsch': DREAM_CARD_ABOUT_URL,
  SOHO: DREAM_CARD_ABOUT_URL,
  Lavido: DREAM_CARD_ABOUT_URL,
  'Dream Card': DREAM_CARD_ABOUT_URL,
};

function buildBrandLookupMaps(brands) {
  const websiteByName = {};
  const actionUrlByName = {};
  for (const brand of brands) {
    websiteByName[brand.name] = brand.website;
    actionUrlByName[brand.name] = brand.actionUrl;
  }
  return { websiteByName, actionUrlByName };
}

function resolveTermsUrl(brandName, benefit, lookup) {
  if (benefit.termsUrl) return benefit.termsUrl;
  if (BRAND_TERMS_URLS[brandName]) return BRAND_TERMS_URLS[brandName];
  if (benefit.url) return benefit.url;
  if (lookup.actionUrlByName[brandName]) {
    return lookup.actionUrlByName[brandName];
  }
  return lookup.websiteByName[brandName] || null;
}

module.exports = {
  DREAM_CARD_ABOUT_URL,
  MINNA_TOMEI_TERMS_URL,
  BRAND_TERMS_URLS,
  buildBrandLookupMaps,
  resolveTermsUrl,
};
