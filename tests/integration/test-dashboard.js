const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDashboard() {
  try {
    console.log("=== Testing Dashboard Data ===");

    // Get user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found");
      return;
    }

    console.log(`User: ${user.name} (${user.email})`);
    console.log(`DOB: ${user.dateOfBirth}`);

    // Get user's memberships
    const userMemberships = await prisma.userMembership.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        brand: true,
      },
    });

    console.log(`\nUser has ${userMemberships.length} active memberships:`);
    userMemberships.forEach((m) => {
      console.log(`- ${m.brand.name} (${m.brandId})`);
    });

    // Get all benefits
    const allBenefits = await prisma.benefit.findMany({
      include: {
        brand: true,
      },
    });

    console.log(`\nTotal benefits in database: ${allBenefits.length}`);

    // Filter benefits to only show those for brands the user is a member of
    const userBrandIds = new Set(userMemberships.map((m) => m.brandId));
    console.log(`User brand IDs: ${Array.from(userBrandIds)}`);

    const userBenefits = allBenefits.filter((benefit) =>
      userBrandIds.has(benefit.brandId),
    );

    console.log(`\nBenefits for user's memberships: ${userBenefits.length}`);
    userBenefits.forEach((b) => {
      console.log(`- ${b.title} (${b.brand.name}) - ${b.validityType}`);
    });

    // Test filtering logic
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();
    const userDOB = user.dateOfBirth ? new Date(user.dateOfBirth) : null;

    console.log(
      `\nCurrent month: ${currentMonth} (${new Date().toLocaleString("en-US", {
        month: "long",
      })})`,
    );
    console.log(`Current day: ${currentDay}`);
    if (userDOB) {
      console.log(`User birthday month: ${userDOB.getMonth()}`);
      console.log(`User birthday day: ${userDOB.getDate()}`);
      console.log(`Is birthday month? ${userDOB.getMonth() === currentMonth}`);
    }

    // Filter active benefits with new logic
    const activeBenefits = userBenefits.filter((b) => {
      if (!userDOB) return false;

      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = new Date().getMonth();
      const currentDay = new Date().getDate();

      switch (b.validityType) {
        case "birthday_entire_month":
          const isBirthdayMonth = birthdayMonth === currentMonth;
          console.log(
            `Benefit ${b.id} (${b.title}): validityType=${b.validityType}, isBirthdayMonth=${isBirthdayMonth}`,
          );
          return isBirthdayMonth;

        case "birthday_exact_date":
          if (birthdayMonth === currentMonth) {
            const daysUntilBirthday = birthdayDay - currentDay;
            const isWithinWeek =
              daysUntilBirthday >= -7 && daysUntilBirthday <= 7;
            console.log(
              `Benefit ${b.id} (${b.title}): validityType=${b.validityType}, daysUntilBirthday=${daysUntilBirthday}, isWithinWeek=${isWithinWeek}`,
            );
            return isWithinWeek;
          }
          return false;

        default:
          // For legacy types, fall back to old logic
          if (b.validityType === "birthday_month") {
            const isBirthdayMonth = birthdayMonth === currentMonth;
            console.log(
              `Benefit ${b.id} (${b.title}): legacy validityType=${b.validityType}, isBirthdayMonth=${isBirthdayMonth}`,
            );
            return isBirthdayMonth;
          }
          if (b.validityType === "birthday_date") {
            if (birthdayMonth === currentMonth) {
              const daysUntilBirthday = birthdayDay - currentDay;
              const isWithinWeek =
                daysUntilBirthday >= -7 && daysUntilBirthday <= 7;
              console.log(
                `Benefit ${b.id} (${b.title}): legacy validityType=${b.validityType}, daysUntilBirthday=${daysUntilBirthday}, isWithinWeek=${isWithinWeek}`,
              );
              return isWithinWeek;
            }
            return false;
          }
          return false;
      }
    });

    console.log(`\nActive benefits: ${activeBenefits.length}`);
    activeBenefits.forEach((b) => {
      console.log(`✓ ${b.title} (${b.brand.name})`);
    });

    // Filter upcoming benefits
    const upcomingBenefits = userBenefits.filter((b) => {
      if (!userDOB) return false;

      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = new Date().getMonth();
      const currentDay = new Date().getDate();

      switch (b.validityType) {
        case "birthday_exact_date":
          if (birthdayMonth === currentMonth) {
            const daysUntilBirthday = birthdayDay - currentDay;
            const isNotYetActive = daysUntilBirthday > 7;
            console.log(
              `Upcoming Benefit ${b.id} (${b.title}): validityType=${b.validityType}, daysUntilBirthday=${daysUntilBirthday}, isNotYetActive=${isNotYetActive}`,
            );
            return isNotYetActive;
          }
          return false;

        case "birthday_entire_month":
          const isNotBirthdayMonth = birthdayMonth !== currentMonth;
          console.log(
            `Upcoming Benefit ${b.id} (${b.title}): validityType=${b.validityType}, isNotBirthdayMonth=${isNotBirthdayMonth}`,
          );
          return isNotBirthdayMonth;

        default:
          return false;
      }
    });

    console.log(`\nUpcoming benefits: ${upcomingBenefits.length}`);
    upcomingBenefits.forEach((b) => {
      console.log(`✓ ${b.title} (${b.brand.name})`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboard();
