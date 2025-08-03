const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper function to import brands from JSON file
async function importBrandsFromJson(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Importing ${data.length} brands...`);
    
    for (const brand of data) {
      await prisma.brand.create({
        data: {
          name: brand.name,
          logoUrl: brand.logoUrl,
          website: brand.website,
          description: brand.description,
          category: brand.category,
          actionUrl: brand.actionUrl,
          actionType: brand.actionType,
          actionLabel: brand.actionLabel,
          isActive: brand.isActive ?? true
        }
      });
      console.log(`✓ Created brand: ${brand.name}`);
    }
    
    console.log('Brand import completed successfully!');
  } catch (error) {
    console.error('Error importing brands:', error);
  }
}

// Helper function to import benefits from JSON file
async function importBenefitsFromJson(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Importing ${data.length} benefits...`);
    
    for (const benefit of data) {
      // First, find the brand by name
      const brand = await prisma.brand.findFirst({
        where: { name: benefit.brandName }
      });
      
      if (!brand) {
        console.log(`⚠️  Brand not found: ${benefit.brandName}, skipping benefit: ${benefit.title}`);
        continue;
      }
      
      await prisma.benefit.create({
        data: {
          brandId: brand.id,
          title: benefit.title,
          description: benefit.description,
          termsAndConditions: benefit.termsAndConditions,
          redemptionMethod: benefit.redemptionMethod,
          promoCode: benefit.promoCode,
          url: benefit.url,
          validityType: benefit.validityType,
          validityDuration: benefit.validityDuration,
          isFree: benefit.isFree ?? true,
          isActive: benefit.isActive ?? true
        }
      });
      console.log(`✓ Created benefit: ${benefit.title} for ${benefit.brandName}`);
    }
    
    console.log('Benefit import completed successfully!');
  } catch (error) {
    console.error('Error importing benefits:', error);
  }
}

// Helper function to export all brands to JSON
async function exportBrandsToJson(filePath) {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        benefits: true
      }
    });
    
    fs.writeFileSync(filePath, JSON.stringify(brands, null, 2));
    console.log(`✓ Exported ${brands.length} brands to ${filePath}`);
  } catch (error) {
    console.error('Error exporting brands:', error);
  }
}

// Helper function to export all benefits to JSON
async function exportBenefitsToJson(filePath) {
  try {
    const benefits = await prisma.benefit.findMany({
      include: {
        brand: true
      }
    });
    
    fs.writeFileSync(filePath, JSON.stringify(benefits, null, 2));
    console.log(`✓ Exported ${benefits.length} benefits to ${filePath}`);
  } catch (error) {
    console.error('Error exporting benefits:', error);
  }
}

// Helper function to list all brands
async function listBrands() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { benefits: true }
        }
      }
    });
    
    console.log('\n📋 Brands:');
    console.log('─'.repeat(80));
    brands.forEach(brand => {
      console.log(`${brand.id} | ${brand.name} | ${brand.category} | ${brand.isActive ? '✅' : '❌'} | ${brand._count.benefits} benefits`);
    });
  } catch (error) {
    console.error('Error listing brands:', error);
  }
}

// Helper function to list all benefits
async function listBenefits() {
  try {
    const benefits = await prisma.benefit.findMany({
      include: {
        brand: true
      }
    });
    
    console.log('\n🎁 Benefits:');
    console.log('─'.repeat(80));
    benefits.forEach(benefit => {
      console.log(`${benefit.id} | ${benefit.title} | ${benefit.brand.name} | ${benefit.isActive ? '✅' : '❌'} | ${benefit.isFree ? 'Free' : 'Paid'}`);
    });
  } catch (error) {
    console.error('Error listing benefits:', error);
  }
}

// Helper function to toggle brand status
async function toggleBrandStatus(brandId) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });
    
    if (!brand) {
      console.log('❌ Brand not found');
      return;
    }
    
    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: { isActive: !brand.isActive }
    });
    
    console.log(`✓ ${updatedBrand.name} is now ${updatedBrand.isActive ? 'active' : 'inactive'}`);
  } catch (error) {
    console.error('Error toggling brand status:', error);
  }
}

// Helper function to toggle benefit status
async function toggleBenefitStatus(benefitId) {
  try {
    const benefit = await prisma.benefit.findUnique({
      where: { id: benefitId }
    });
    
    if (!benefit) {
      console.log('❌ Benefit not found');
      return;
    }
    
    const updatedBenefit = await prisma.benefit.update({
      where: { id: benefitId },
      data: { isActive: !benefit.isActive }
    });
    
    console.log(`✓ ${updatedBenefit.title} is now ${updatedBenefit.isActive ? 'active' : 'inactive'}`);
  } catch (error) {
    console.error('Error toggling benefit status:', error);
  }
}

// Main function to handle command line arguments
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'import-brands':
      if (!arg) {
        console.log('Usage: node admin-helper.js import-brands <json-file>');
        return;
      }
      await importBrandsFromJson(arg);
      break;
      
    case 'import-benefits':
      if (!arg) {
        console.log('Usage: node admin-helper.js import-benefits <json-file>');
        return;
      }
      await importBenefitsFromJson(arg);
      break;
      
    case 'export-brands':
      await exportBrandsToJson(arg || 'brands-export.json');
      break;
      
    case 'export-benefits':
      await exportBenefitsToJson(arg || 'benefits-export.json');
      break;
      
    case 'list-brands':
      await listBrands();
      break;
      
    case 'list-benefits':
      await listBenefits();
      break;
      
    case 'toggle-brand':
      if (!arg) {
        console.log('Usage: node admin-helper.js toggle-brand <brand-id>');
        return;
      }
      await toggleBrandStatus(arg);
      break;
      
    case 'toggle-benefit':
      if (!arg) {
        console.log('Usage: node admin-helper.js toggle-benefit <benefit-id>');
        return;
      }
      await toggleBenefitStatus(arg);
      break;
      
    default:
      console.log(`
🤖 Admin Helper Script

Usage:
  node admin-helper.js <command> [argument]

Commands:
  import-brands <file>     Import brands from JSON file
  import-benefits <file>    Import benefits from JSON file
  export-brands [file]      Export brands to JSON file (default: brands-export.json)
  export-benefits [file]    Export benefits to JSON file (default: benefits-export.json)
  list-brands              List all brands with their status
  list-benefits            List all benefits with their status
  toggle-brand <id>        Toggle brand active status
  toggle-benefit <id>      Toggle benefit active status

Examples:
  node admin-helper.js import-brands ./new-brands.json
  node admin-helper.js list-brands
  node admin-helper.js toggle-brand clxyz123
      `);
  }
  
  await prisma.$disconnect();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  importBrandsFromJson,
  importBenefitsFromJson,
  exportBrandsToJson,
  exportBenefitsToJson,
  listBrands,
  listBenefits,
  toggleBrandStatus,
  toggleBenefitStatus
}; 