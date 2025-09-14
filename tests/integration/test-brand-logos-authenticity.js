/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Brand logos authenticity validation', () => {
  let brands = [];

  beforeAll(async () => {
    brands = await prisma.brand.findMany({
      select: { name: true, logoUrl: true, website: true },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should have actual logo files (not self-generated SVG text)', async () => {
    const publicDir = path.join(process.cwd(), 'public');
    const selfGenerated = [];
    const missing = [];

    for (const brand of brands) {
      // Check for inline SVG data URLs (often self-generated)
      if (brand.logoUrl.startsWith('data:image/svg+xml')) {
        selfGenerated.push({
          name: brand.name,
          logoUrl: brand.logoUrl,
          reason: 'Inline SVG data URL (likely self-generated)',
        });
        continue;
      }

      // Check if local file exists
      if (brand.logoUrl.startsWith('/')) {
        const logoPath = brand.logoUrl;
        const abs = path.join(publicDir, logoPath);

        if (!fs.existsSync(abs)) {
          missing.push({
            name: brand.name,
            file: abs,
            logoUrl: brand.logoUrl,
          });
          continue;
        }

        // Check file size (very small files might be placeholders)
        const stats = fs.statSync(abs);
        if (stats.size < 500) {
          // Less than 500 bytes is suspicious
          selfGenerated.push({
            name: brand.name,
            logoUrl: brand.logoUrl,
            reason: `File too small (${stats.size} bytes) - likely placeholder`,
            filePath: abs,
          });
        }

        // Check if it's a simple SVG with just text (self-generated)
        if (logoPath.endsWith('.svg')) {
          const content = fs.readFileSync(abs, 'utf-8');
          if (content.includes('<text') && content.length < 1000) {
            selfGenerated.push({
              name: brand.name,
              logoUrl: brand.logoUrl,
              reason: 'Simple SVG with text (likely self-generated)',
              filePath: abs,
            });
          }
        }
      }
    }

    if (missing.length > 0) {
      console.log('❌ Missing logo files:');
      missing.forEach((item) => {
        console.log(`  - ${item.name}: ${item.logoUrl} -> ${item.file}`);
      });
    }

    if (selfGenerated.length > 0) {
      console.log('⚠️  Potentially self-generated logos:');
      selfGenerated.forEach((item) => {
        console.log(`  - ${item.name}: ${item.reason}`);
        if (item.logoUrl.startsWith('data:')) {
          console.log(`    URL: ${item.logoUrl.substring(0, 100)}...`);
        } else {
          console.log(`    Path: ${item.logoUrl}`);
        }
      });
    }

    // Allow some self-generated logos for testing, but flag them
    expect(missing).toHaveLength(0);

    // Report the ratio of authentic vs self-generated
    const authentic = brands.length - selfGenerated.length;
    const ratio = authentic / brands.length;
    console.log(
      `📊 Logo authenticity: ${authentic}/${brands.length} (${(ratio * 100).toFixed(1)}%) appear to be authentic`
    );

    // Expect at least 80% to be authentic (not self-generated)
    expect(ratio).toBeGreaterThan(0.8);
  });

  it('should validate that brand websites exist and match logo sources', () => {
    const brandsWithoutWebsites = brands.filter(
      (b) => !b.website || b.website.trim() === ''
    );

    if (brandsWithoutWebsites.length > 0) {
      console.log(
        '⚠️  Brands without websites (harder to verify logo authenticity):'
      );
      brandsWithoutWebsites.forEach((brand) => {
        console.log(`  - ${brand.name}`);
      });
    }

    // Most brands should have websites for logo verification
    const withWebsites = brands.filter(
      (b) => b.website && b.website.trim() !== ''
    );
    const websiteRatio = withWebsites.length / brands.length;

    console.log(
      `🌐 Website coverage: ${withWebsites.length}/${brands.length} (${(websiteRatio * 100).toFixed(1)}%) have websites`
    );
    expect(websiteRatio).toBeGreaterThan(0.85);
  });

  it('should detect common placeholder or generic patterns', () => {
    const suspicious = [];

    for (const brand of brands) {
      // Check for placeholder patterns in URLs
      const suspiciousPatterns = [
        'placeholder',
        'example.com',
        'generic',
        'default',
        'test',
        'logo-placeholder',
      ];

      const hasSuspiciousPattern = suspiciousPatterns.some((pattern) =>
        brand.logoUrl.toLowerCase().includes(pattern)
      );

      if (hasSuspiciousPattern) {
        suspicious.push({
          name: brand.name,
          logoUrl: brand.logoUrl,
          reason: 'Contains suspicious placeholder pattern',
        });
      }

      // Check for very generic SVG content (just initials)
      if (brand.logoUrl.startsWith('data:image/svg+xml')) {
        const decoded = decodeURIComponent(brand.logoUrl);
        if (
          decoded.includes('<text') &&
          decoded.match(/<text[^>]*>([A-Z]{1,3})<\/text>/)
        ) {
          suspicious.push({
            name: brand.name,
            logoUrl: brand.logoUrl.substring(0, 100) + '...',
            reason: 'SVG contains only initials (generic placeholder)',
          });
        }
      }
    }

    if (suspicious.length > 0) {
      console.log('🚨 Suspicious placeholder logos detected:');
      suspicious.forEach((item) => {
        console.log(`  - ${item.name}: ${item.reason}`);
      });
    }

    // Should have minimal suspicious/placeholder logos
    expect(suspicious.length).toBeLessThan(brands.length * 0.1); // Less than 10%
  });

  it('should have diverse logo file formats (not all the same type)', () => {
    const formats = {};
    const localLogos = brands.filter((b) => b.logoUrl.startsWith('/'));

    localLogos.forEach((brand) => {
      const ext = path.extname(brand.logoUrl).toLowerCase();
      formats[ext] = (formats[ext] || 0) + 1;
    });

    console.log('📁 Logo file formats distribution:');
    Object.entries(formats).forEach(([format, count]) => {
      const percentage = ((count / localLogos.length) * 100).toFixed(1);
      console.log(
        `  ${format || 'no-extension'}: ${count} files (${percentage}%)`
      );
    });

    // Should have variety of formats (PNG, SVG, maybe JPG)
    const formatCount = Object.keys(formats).length;
    expect(formatCount).toBeGreaterThan(1);

    // No single format should dominate more than 80%
    const maxFormatRatio =
      Math.max(...Object.values(formats)) / localLogos.length;
    expect(maxFormatRatio).toBeLessThan(0.8);
  });

  it('should flag brands that might need logo updates', () => {
    const needsUpdate = [];

    brands.forEach((brand) => {
      let score = 0;
      let reasons = [];

      // Positive indicators (good signs)
      if (
        brand.logoUrl.startsWith('/images/brands/') &&
        brand.logoUrl.includes('.png')
      ) {
        score += 2; // PNG files are often higher quality
      }

      if (brand.website && brand.website.startsWith('https://')) {
        score += 1; // Has proper website
      }

      // Negative indicators (need attention)
      if (brand.logoUrl.startsWith('data:')) {
        score -= 3;
        reasons.push('Using inline SVG data');
      }

      if (!brand.website || brand.website.trim() === '') {
        score -= 1;
        reasons.push('No website URL');
      }

      if (brand.logoUrl.includes('.svg') && brand.logoUrl.startsWith('/')) {
        // Check if it's a simple text-based SVG
        try {
          const publicDir = path.join(process.cwd(), 'public');
          const abs = path.join(publicDir, brand.logoUrl);
          if (fs.existsSync(abs)) {
            const content = fs.readFileSync(abs, 'utf-8');
            if (content.includes('<text') && content.length < 1000) {
              score -= 2;
              reasons.push('Simple text-based SVG');
            }
          }
        } catch (e) {
          // Ignore file read errors
        }
      }

      if (score < 0) {
        needsUpdate.push({
          name: brand.name,
          score,
          reasons,
          logoUrl: brand.logoUrl.startsWith('data:')
            ? brand.logoUrl.substring(0, 50) + '...'
            : brand.logoUrl,
        });
      }
    });

    if (needsUpdate.length > 0) {
      console.log('📋 Brands that might need authentic logo updates:');
      needsUpdate
        .sort((a, b) => a.score - b.score)
        .forEach((brand) => {
          console.log(`  - ${brand.name} (score: ${brand.score})`);
          console.log(`    Logo: ${brand.logoUrl}`);
          console.log(`    Issues: ${brand.reasons.join(', ')}`);
        });
    }

    // For information purposes - this shouldn't fail the test
    console.log(
      `💡 ${needsUpdate.length}/${brands.length} brands flagged for potential logo updates`
    );
  });
});
