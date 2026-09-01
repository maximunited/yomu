const {
  parseSeedCatalog,
  enrichCatalogBenefits,
} = require('./lib/parse-seed-catalog');

const catalog = parseSeedCatalog();

const rows = enrichCatalogBenefits(catalog)
  .filter((b) => b.brandName)
  .map((b) => ({
    brandName: b.brandName,
    title: b.title,
    termsUrl: b.termsUrl,
  }));

console.log(JSON.stringify(rows, null, 2));
