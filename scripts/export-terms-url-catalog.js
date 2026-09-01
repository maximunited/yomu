const {
  predefinedBrands,
  buildBrandLookupMaps,
  resolveTermsUrl,
} = require('./seed');
const { parseSeedCatalog } = require('./lib/parse-seed-catalog');

const catalog = parseSeedCatalog();
const lookup = buildBrandLookupMaps(predefinedBrands);

const rows = catalog.benefits
  .filter((b) => b.brandName)
  .map((b) => ({
    brandName: b.brandName,
    title: b.title,
    termsUrl: resolveTermsUrl(b.brandName, { url: b.url }, lookup),
  }));

console.log(JSON.stringify(rows, null, 2));
