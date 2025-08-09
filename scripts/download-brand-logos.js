/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const { predefinedBrands } = require('./seed');

const TARGET_DIR = path.join(process.cwd(), 'public');

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const req = lib.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirects
        res.destroy();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  const mapping = {
    "McDonald's": 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/mcdonalds.svg',
    'Super-Pharm - LifeStyle': 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/superu.svg',
    Fox: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/fox.svg',
    Isracard: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Isracard_logo.png',
    'H&M': 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg',
    BBB: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Burgus_Burger_Bar_logo.png',
    Shufersal: 'https://upload.wikimedia.org/wikipedia/he/0/0a/Shufersal_new_logo.png',
    KFC: 'https://upload.wikimedia.org/wikipedia/commons/5/57/KFC_logo.svg',
  };

  let downloaded = 0;
  for (const brand of predefinedBrands) {
    const url = mapping[brand.name];
    if (!url) continue;
    const logoPath = brand.logoUrl.startsWith('/') ? brand.logoUrl : `/${brand.logoUrl}`;
    const abs = path.join(TARGET_DIR, logoPath);
    ensureDirSync(path.dirname(abs));
    try {
      await download(url, abs);
      console.log(`Downloaded ${brand.name} -> ${abs}`);
      downloaded++;
    } catch (err) {
      console.warn(`Failed to download ${brand.name}: ${err.message}`);
    }
  }
  console.log(`Done. Downloaded ${downloaded} brand logos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


