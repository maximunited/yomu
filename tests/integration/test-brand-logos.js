/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { predefinedBrands } = require('../../scripts/seed');

describe('Brand logos assets', () => {
  it('every predefined brand logo should point to an existing file under public/', () => {
    const publicDir = path.join(process.cwd(), 'public');
    const missing = [];
    for (const brand of predefinedBrands) {
      const logoPath = brand.logoUrl.startsWith('/')
        ? brand.logoUrl
        : `/${brand.logoUrl}`;
      const abs = path.join(publicDir, logoPath);
      if (!fs.existsSync(abs)) {
        missing.push({ name: brand.name, file: abs });
      }
    }
    if (missing.length) {
      console.log('Missing logo assets:', missing);
    }
    expect(missing).toHaveLength(0);
  });
});
