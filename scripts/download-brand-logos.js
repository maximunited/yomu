/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const { predefinedBrands } = require("./seed");

const TARGET_DIR = path.join(process.cwd(), "public");

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    const req = lib.get(url, (res) => {
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
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
      file.on("finish", () => file.close(resolve));
    });
    req.on("error", (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  // Curated SVG or specific sources to preserve vector quality or brand-correct assets
  const curated = {
    "McDonald's":
      "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/mcdonalds.svg",
    "H&M": "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
    KFC: "https://upload.wikimedia.org/wikipedia/commons/5/57/KFC_logo.svg",
    Fox: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/fox.svg",
    "Minna Tomei": "https://logo.clearbit.com/minna-tomei.co.il?size=512",
  };

  let downloaded = 0;
  for (const brand of predefinedBrands) {
    // Skip inline data URIs; those are intentional placeholders
    if (
      brand.logoUrl &&
      typeof brand.logoUrl === "string" &&
      brand.logoUrl.startsWith("data:")
    ) {
      console.warn(`Skipping ${brand.name}: inline logo URL (data URI)`);
      continue;
    }
    const destRel = brand.logoUrl.startsWith("/")
      ? brand.logoUrl
      : `/${brand.logoUrl}`;
    const destAbs = path.join(TARGET_DIR, destRel);
    ensureDirSync(path.dirname(destAbs));

    const ext = path.extname(destRel).toLowerCase();
    let sourceUrl = null;

    // Prefer curated assets when available (esp. for SVG destinations)
    if (curated[brand.name]) {
      sourceUrl = curated[brand.name];
    } else {
      // Try Clearbit logo API using the brand website domain
      try {
        const host = new URL(brand.website).hostname;
        // Only attempt Clearbit when destination is a raster (png), to avoid svg/png mismatch
        if (ext !== ".svg" && host) {
          sourceUrl = `https://logo.clearbit.com/${host}?size=512`;
        }
      } catch {
        // Ignore URL parsing issues
      }
    }

    if (!sourceUrl) {
      console.warn(
        `Skipping ${brand.name}: no suitable source for destination ${destRel}`,
      );
      continue;
    }

    try {
      await download(sourceUrl, destAbs);
      console.log(`Downloaded ${brand.name} -> ${destRel}`);
      downloaded++;
    } catch (err) {
      console.warn(
        `Failed to download ${brand.name} from ${sourceUrl}: ${err.message}`,
      );
    }
  }
  console.log(`Done. Downloaded ${downloaded} brand logos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
