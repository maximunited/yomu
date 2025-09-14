/**
 * Logo Authenticity Validation Script
 * Validates that brand logos are from authentic sources, not self-generated
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateLogos() {
  console.log('🔍 Validating brand logo authenticity...\n');

  try {
    const brands = await prisma.brand.findMany({
      select: { name: true, logoUrl: true, website: true },
    });

    console.log(`📊 Found ${brands.length} brands to validate\n`);

    const results = {
      total: brands.length,
      authentic: 0,
      selfGenerated: 0,
      missing: 0,
      suspicious: 0,
    };

    const issues = {
      selfGenerated: [],
      missing: [],
      suspicious: [],
    };

    const publicDir = path.join(process.cwd(), 'public');

    for (const brand of brands) {
      let isAuthentic = true;

      // Check for inline SVG data URLs (often self-generated)
      if (brand.logoUrl.startsWith('data:image/svg+xml')) {
        isAuthentic = false;
        results.selfGenerated++;
        issues.selfGenerated.push({
          name: brand.name,
          reason: 'Inline SVG data URL (likely self-generated)',
          logoUrl: brand.logoUrl.substring(0, 100) + '...',
        });
        continue;
      }

      // Check if local file exists
      if (brand.logoUrl.startsWith('/')) {
        const logoPath = brand.logoUrl;
        const abs = path.join(publicDir, logoPath);

        if (!fs.existsSync(abs)) {
          isAuthentic = false;
          results.missing++;
          issues.missing.push({
            name: brand.name,
            file: logoPath,
            absolutePath: abs,
          });
          continue;
        }

        // Check file size (very small files might be placeholders)
        const stats = fs.statSync(abs);
        if (stats.size < 500) {
          // Less than 500 bytes is suspicious
          isAuthentic = false;
          results.suspicious++;
          issues.suspicious.push({
            name: brand.name,
            reason: `File too small (${stats.size} bytes) - likely placeholder`,
            logoUrl: brand.logoUrl,
          });
          continue;
        }

        // Check if it's a simple SVG with just text (self-generated)
        if (logoPath.endsWith('.svg')) {
          const content = fs.readFileSync(abs, 'utf-8');
          if (content.includes('<text') && content.length < 1000) {
            isAuthentic = false;
            results.selfGenerated++;
            issues.selfGenerated.push({
              name: brand.name,
              reason: 'Simple SVG with text (likely self-generated)',
              logoUrl: brand.logoUrl,
            });
            continue;
          }
        }

        // Check for placeholder patterns
        const suspiciousPatterns = [
          'placeholder',
          'example.com',
          'generic',
          'default',
          'test',
        ];

        const hasSuspiciousPattern = suspiciousPatterns.some((pattern) =>
          brand.logoUrl.toLowerCase().includes(pattern)
        );

        if (hasSuspiciousPattern) {
          isAuthentic = false;
          results.suspicious++;
          issues.suspicious.push({
            name: brand.name,
            reason: 'Contains suspicious placeholder pattern',
            logoUrl: brand.logoUrl,
          });
          continue;
        }
      }

      if (isAuthentic) {
        results.authentic++;
      }
    }

    // Report Results
    console.log('📈 VALIDATION RESULTS:');
    console.log('─'.repeat(50));
    console.log(
      `✅ Authentic logos: ${results.authentic}/${results.total} (${((results.authentic / results.total) * 100).toFixed(1)}%)`
    );
    console.log(
      `🔧 Self-generated: ${results.selfGenerated}/${results.total} (${((results.selfGenerated / results.total) * 100).toFixed(1)}%)`
    );
    console.log(
      `❌ Missing files: ${results.missing}/${results.total} (${((results.missing / results.total) * 100).toFixed(1)}%)`
    );
    console.log(
      `⚠️  Suspicious: ${results.suspicious}/${results.total} (${((results.suspicious / results.total) * 100).toFixed(1)}%)`
    );

    // Detailed issue reports
    if (issues.selfGenerated.length > 0) {
      console.log('\n🔧 SELF-GENERATED LOGOS (need authentic replacements):');
      issues.selfGenerated.forEach((issue) => {
        console.log(`  ❌ ${issue.name}: ${issue.reason}`);
        if (issue.logoUrl) {
          console.log(`     ${issue.logoUrl}`);
        }
      });
    }

    if (issues.missing.length > 0) {
      console.log('\n❌ MISSING LOGO FILES:');
      issues.missing.forEach((issue) => {
        console.log(`  ❌ ${issue.name}: ${issue.file}`);
        console.log(`     Expected at: ${issue.absolutePath}`);
      });
    }

    if (issues.suspicious.length > 0) {
      console.log('\n⚠️  SUSPICIOUS LOGOS:');
      issues.suspicious.forEach((issue) => {
        console.log(`  ⚠️  ${issue.name}: ${issue.reason}`);
        console.log(`     ${issue.logoUrl}`);
      });
    }

    // Check website coverage
    const brandsWithWebsites = brands.filter(
      (b) => b.website && b.website.trim() !== ''
    );
    const websiteRatio = brandsWithWebsites.length / brands.length;

    console.log(
      `\n🌐 WEBSITE COVERAGE: ${brandsWithWebsites.length}/${brands.length} (${(websiteRatio * 100).toFixed(1)}%) have websites`
    );

    // File format distribution
    const localLogos = brands.filter((b) => b.logoUrl.startsWith('/'));
    const formats = {};

    localLogos.forEach((brand) => {
      const ext = path.extname(brand.logoUrl).toLowerCase();
      formats[ext] = (formats[ext] || 0) + 1;
    });

    console.log('\n📁 LOGO FILE FORMATS:');
    Object.entries(formats).forEach(([format, count]) => {
      const percentage = ((count / localLogos.length) * 100).toFixed(1);
      console.log(
        `  ${format || 'no-extension'}: ${count} files (${percentage}%)`
      );
    });

    // Overall assessment
    const authenticityRatio = results.authentic / results.total;
    console.log('\n🎯 OVERALL ASSESSMENT:');
    console.log('─'.repeat(50));

    if (authenticityRatio >= 0.9) {
      console.log('✅ EXCELLENT: Most logos appear authentic');
    } else if (authenticityRatio >= 0.7) {
      console.log(
        '👍 GOOD: Majority of logos are authentic, some need updates'
      );
    } else if (authenticityRatio >= 0.5) {
      console.log('⚠️  FAIR: Many logos need authentic replacements');
    } else {
      console.log(
        '❌ POOR: Most logos appear to be placeholders or self-generated'
      );
    }

    console.log(
      `\nRecommendation: Replace ${results.selfGenerated + results.suspicious} logos with authentic versions from brand websites.`
    );

    // Identify brands that need priority attention
    const priorityBrands = [
      ...issues.selfGenerated.map((i) => i.name),
      ...issues.suspicious.map((i) => i.name),
    ];

    if (priorityBrands.length > 0) {
      console.log('\n🚨 PRIORITY BRANDS (need authentic logos):');
      priorityBrands.forEach((name) => {
        const brand = brands.find((b) => b.name === name);
        console.log(
          `  • ${name}${brand?.website ? ` - ${brand.website}` : ' (no website)'}`
        );
      });
    }
  } catch (error) {
    console.error('❌ Error validating logos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
if (require.main === module) {
  validateLogos().catch(console.error);
}

module.exports = { validateLogos };
