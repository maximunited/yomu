const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== Checking Database Contents ===');
    
    // Check users
    const users = await prisma.user.findMany();
    console.log(`\nUsers (${users.length}):`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - DOB: ${user.dateOfBirth}`);
    });
    
    // Check brands
    const brands = await prisma.brand.findMany();
    console.log(`\nBrands (${brands.length}):`);
    brands.forEach(brand => {
      console.log(`- ${brand.name} (${brand.category})`);
    });
    
    // Check benefits
    const benefits = await prisma.benefit.findMany({
      include: {
        brand: true
      }
    });
    console.log(`\nBenefits (${benefits.length}):`);
    benefits.forEach(benefit => {
      console.log(`- ${benefit.title} (${benefit.brand.name}) - Validity: ${benefit.validityType || 'birthday_month'}`);
    });
    
    // Check user memberships
    const memberships = await prisma.userMembership.findMany({
      include: {
        user: true,
        brand: true
      }
    });
    console.log(`\nUser Memberships (${memberships.length}):`);
    memberships.forEach(membership => {
      console.log(`- ${membership.user.name} -> ${membership.brand.name} (${membership.isActive ? 'Active' : 'Inactive'})`);
    });
    
    // Test filtering logic
    console.log('\n=== Testing Filtering Logic ===');
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();
    console.log(`Current month: ${currentMonth} (${new Date().toLocaleString('en-US', { month: 'long' })})`);
    console.log(`Current day: ${currentDay}`);
    
    if (users.length > 0) {
      const user = users[0];
      const userDOB = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
      console.log(`User DOB: ${userDOB}`);
      if (userDOB) {
        console.log(`User birthday month: ${userDOB.getMonth()}`);
        console.log(`User birthday day: ${userDOB.getDate()}`);
        console.log(`Is birthday month? ${userDOB.getMonth() === currentMonth}`);
      }
      
      // Get user's active memberships
      const userMemberships = await prisma.userMembership.findMany({
        where: {
          userId: user.id,
          isActive: true
        },
        include: {
          brand: true
        }
      });
      
      console.log(`\nUser has ${userMemberships.length} active memberships`);
      
      // Test which benefits should be active
      console.log('\nBenefits that should be active:');
      let activeCount = 0;
      let totalUserBenefits = 0;
      
      benefits.forEach(benefit => {
        // Check if user is a member of this brand
        const isUserMember = userMemberships.some(m => m.brandId === benefit.brandId);
        if (!isUserMember) return;
        
        totalUserBenefits++;
        const validityType = benefit.validityType || 'birthday_month';
        let shouldBeActive = false;
        let reason = '';
        
        if (validityType === 'birthday_month' && userDOB) {
          shouldBeActive = userDOB.getMonth() === currentMonth;
          reason = shouldBeActive ? 'Birthday month' : 'Not birthday month';
        } else if (validityType === 'birthday_date' && userDOB) {
          const birthdayMonth = userDOB.getMonth();
          const birthdayDay = userDOB.getDate();
          if (birthdayMonth === currentMonth) {
            const daysUntilBirthday = birthdayDay - currentDay;
            shouldBeActive = daysUntilBirthday >= -7 && daysUntilBirthday <= 7;
            reason = shouldBeActive ? `Within 7 days of birthday (${daysUntilBirthday} days)` : `Not within 7 days of birthday (${daysUntilBirthday} days)`;
          } else {
            reason = 'Not birthday month';
          }
        }
        
        if (shouldBeActive) {
          console.log(`✓ ${benefit.title} (${benefit.brand.name}) - ${validityType} - ${reason}`);
          activeCount++;
        } else {
          console.log(`✗ ${benefit.title} (${benefit.brand.name}) - ${validityType} - ${reason}`);
        }
      });
      
      console.log(`\nSummary: ${activeCount} out of ${totalUserBenefits} user benefits should be active`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 