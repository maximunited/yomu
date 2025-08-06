const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// New validity types mapping
const validityTypeMapping = {
  // Birthday benefits
  "birthday_date": "birthday_exact_date", // Only on the exact birthday
  "birthday_month": "birthday_entire_month", // Entire birthday month
  "birthday_week": "birthday_week_before_after", // Week before and after birthday
  
  // Anniversary benefits (for future use)
  "anniversary_date": "anniversary_exact_date", // Only on the exact anniversary
  "anniversary_month": "anniversary_entire_month", // Entire anniversary month
  "anniversary_week": "anniversary_week_before_after", // Week before and after anniversary
  
  // Additional granular types
  "birthday_weekend": "birthday_weekend", // Weekend of birthday
  "birthday_30_days": "birthday_30_days", // 30 days from birthday
  "birthday_7_days_before": "birthday_7_days_before", // 7 days before birthday
  "birthday_7_days_after": "birthday_7_days_after", // 7 days after birthday
  "birthday_3_days_before": "birthday_3_days_before", // 3 days before birthday
  "birthday_3_days_after": "birthday_3_days_after", // 3 days after birthday
};

// Updated benefits with better categorization
const updatedBenefits = [
  // McDonald's - exact birthday only
  {
    brandName: "McDonald's",
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // Super-Pharm - entire month
  {
    brandName: "Super-Pharm - LifeStyle",
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // KFC - exact birthday only
  {
    brandName: "KFC",
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // H&M - entire month
  {
    brandName: "H&M",
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // Fox - entire month
  {
    brandName: "Fox",
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // Shufersal - entire month
  {
    brandName: "Shufersal",
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // BBB - entire month
  {
    brandName: "BBB",
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // מסעדת ליבירה - exact birthday only
  {
    brandName: "מסעדת ליבירה",
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // מסעדת באקרו - exact birthday only
  {
    brandName: "מסעדת באקרו (רעננה)",
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // פראג הקטנה - exact birthday only
  {
    brandName: "פראג הקטנה (מסעדה)",
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // שגב - exact birthday only
  {
    brandName: "שגב (מסעדה)",
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // ג'מס - exact birthday only
  {
    brandName: "ג'מס",
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // יומנגס - exact birthday only
  {
    brandName: "יומנגס",
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // M32 המבורגרים - exact birthday only
  {
    brandName: "M32 המבורגרים",
    validityType: "birthday_exact_date",
    validityDuration: 1
  },
  
  // מיקה חנויות נוחות - entire month
  {
    brandName: "מיקה חנויות נוחות",
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // שילב - entire month
  {
    brandName: "שילב",
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // מנמ עשה זאת בעצמך - entire month
  {
    brandName: "מנמ עשה זאת בעצמך",
    validityType: "birthday_entire_month",
    validityDuration: 30
  },
  
  // אסקייפרום - exact birthday only
  {
    brandName: "אסקייפרום",
    validityType: "birthday_exact_date",
    validityDuration: 1
  }
];

async function updateValidityTypes() {
  try {
    console.log('Updating validity types...');
    
    // Update each benefit with the new validity type
    for (const benefitData of updatedBenefits) {
      const brand = await prisma.brand.findFirst({
        where: { name: benefitData.brandName }
      });
      
      if (brand) {
        const benefit = await prisma.benefit.findFirst({
          where: { brandId: brand.id }
        });
        
        if (benefit) {
          await prisma.benefit.update({
            where: { id: benefit.id },
            data: {
              validityType: benefitData.validityType,
              validityDuration: benefitData.validityDuration
            }
          });
          console.log(`✓ Updated ${benefitData.brandName}: ${benefit.validityType} -> ${benefitData.validityType}`);
        } else {
          console.log(`⚠ No benefit found for ${benefitData.brandName}`);
        }
      } else {
        console.log(`⚠ Brand not found: ${benefitData.brandName}`);
      }
    }
    
    console.log('\nValidity types updated successfully!');
    
    // Show summary
    const benefits = await prisma.benefit.findMany({
      include: { brand: true }
    });
    
    console.log('\nUpdated benefits:');
    benefits.forEach(b => {
      console.log(`- ${b.title} (${b.brand.name}): ${b.validityType} (${b.validityDuration} days)`);
    });
    
  } catch (error) {
    console.error('Error updating validity types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateValidityTypes(); 