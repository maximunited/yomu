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

function download(
  url,
  dest,
  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': userAgent,
        Accept: 'image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    };
    const req = lib.get(url, options, (res) => {
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        // Follow redirects
        res.destroy();
        file.destroy();
        download(res.headers.location, dest, userAgent)
          .then(resolve)
          .catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.destroy();
        fs.unlink(dest, () =>
          reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        );
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    });
    req.on('error', (err) => {
      file.destroy();
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function getFaviconUrl(website) {
  try {
    const url = new URL(website);
    return `${url.protocol}//${url.hostname}/favicon.ico`;
  } catch {
    return null;
  }
}

async function tryMultipleSources(brand, destAbs, ext) {
  const sources = [];

  // Method 1: Curated high-quality sources
  const curated = {
    "McDonald's": [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/04/McDonalds-Logo.png',
    ],
    'H&M': [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1200px-H%26M-Logo.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/05/HM-Logo.png',
    ],
    KFC: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/1200px-KFC_logo.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/04/KFC-Logo.png',
    ],
    Billabong: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Billabong_logo.svg/1200px-Billabong_logo.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/09/Billabong-Logo.png',
    ],
    'American Eagle': [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/American_Eagle_Outfitters_logo.svg/1200px-American_Eagle_Outfitters_logo.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/04/American-Eagle-Logo.png',
    ],
    Mango: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Mango_Logo.svg/1200px-Mango_Logo.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/04/Mango-Logo.png',
    ],
    'The Body Shop': [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/The_Body_Shop_logo.svg/1200px-The_Body_Shop_logo.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/04/The-Body-Shop-Logo.png',
    ],
    'Max Brenner': [
      'https://logos-world.net/wp-content/uploads/2020/12/Max-Brenner-Logo.png',
    ],
  };

  if (curated[brand.name]) {
    sources.push(...curated[brand.name]);
  }

  // Method 2: Try Clearbit API
  try {
    const host = new URL(brand.website).hostname;
    if (ext !== '.svg' && host) {
      sources.push(`https://logo.clearbit.com/${host}?size=512`);
    }
  } catch {}

  // Method 3: Try LogoAPI (alternative service)
  try {
    const host = new URL(brand.website).hostname;
    sources.push(
      `https://img.logo.dev/${host}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ&size=512`
    );
  } catch {}

  // Method 4: Try favicon as fallback
  const faviconUrl = await getFaviconUrl(brand.website);
  if (faviconUrl) {
    sources.push(faviconUrl);
  }

  // Method 5: Try DuckDuckGo favicon API
  try {
    const host = new URL(brand.website).hostname;
    sources.push(`https://icons.duckduckgo.com/ip3/${host}.ico`);
  } catch {}

  // Try each source until one works
  for (const sourceUrl of sources) {
    try {
      await download(sourceUrl, destAbs);
      const stats = fs.statSync(destAbs);
      if (stats.size > 100) {
        // Ensure we got a real file
        return sourceUrl;
      } else {
        fs.unlinkSync(destAbs); // Remove tiny/empty files
      }
    } catch (err) {
      // Continue to next source
      try {
        if (fs.existsSync(destAbs)) fs.unlinkSync(destAbs);
      } catch {}
    }
  }

  throw new Error(`All sources failed for ${brand.name}`);
}

async function main() {
  console.log('🔍 Enhanced logo download with multiple sources...');

  let downloaded = 0;
  let attempts = 0;

  // Focus on brands that currently have missing or problematic logos
  const problematicBrands = predefinedBrands.filter((brand) => {
    if (brand.logoUrl.startsWith('data:')) return false; // Skip inline data URIs

    const destRel = brand.logoUrl.startsWith('/')
      ? brand.logoUrl
      : `/${brand.logoUrl}`;
    const destAbs = path.join(TARGET_DIR, destRel);

    if (!fs.existsSync(destAbs)) return true; // Missing file

    const stats = fs.statSync(destAbs);
    return stats.size < 1000; // Small/empty file
  });

  console.log(
    `📊 Found ${problematicBrands.length} brands with missing/problematic logos`
  );

  for (const brand of problematicBrands) {
    attempts++;
    console.log(
      `\n[${attempts}/${problematicBrands.length}] Processing ${brand.name}...`
    );

    const destRel = brand.logoUrl.startsWith('/')
      ? brand.logoUrl
      : `/${brand.logoUrl}`;
    const destAbs = path.join(TARGET_DIR, destRel);
    ensureDirSync(path.dirname(destAbs));

    const ext = path.extname(destRel).toLowerCase();

    try {
      const sourceUrl = await tryMultipleSources(brand, destAbs, ext);
      console.log(`✅ Downloaded ${brand.name} from ${sourceUrl}`);
      downloaded++;
    } catch (err) {
      console.warn(`❌ Failed to download ${brand.name}: ${err.message}`);
    }

    // Add small delay to be respectful to servers
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n🎉 Done. Downloaded ${downloaded}/${attempts} brand logos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
