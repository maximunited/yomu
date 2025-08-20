const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createPartnerships() {
  try {
    console.log("🔄 Creating partnerships between existing brands...");

    // Get all brands
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        actionUrl: true,
        actionType: true,
        actionLabel: true,
      },
    });

    console.log(
      "Found brands:",
      brands.map((b) => ({ name: b.name, category: b.category })),
    );

    // Find Giraffe and Nono&Mimi brands
    const giraffeBrand = brands.find((b) =>
      b.name.toLowerCase().includes("giraffe"),
    );
    const nonoMimiBrand = brands.find(
      (b) =>
        b.name.toLowerCase().includes("nono") ||
        b.name.toLowerCase().includes("mimi"),
    );

    if (giraffeBrand && nonoMimiBrand) {
      console.log(
        `Creating partnership: ${giraffeBrand.name} ↔ ${nonoMimiBrand.name}`,
      );

      // Check if partnership already exists
      const existingPartnership = await prisma.brandPartnership.findFirst({
        where: {
          OR: [
            { brandAId: giraffeBrand.id, brandBId: nonoMimiBrand.id },
            { brandAId: nonoMimiBrand.id, brandBId: giraffeBrand.id },
          ],
        },
      });

      if (existingPartnership) {
        console.log("Partnership already exists!");
      } else {
        await prisma.brandPartnership.create({
          data: {
            brandAId: giraffeBrand.id,
            brandBId: nonoMimiBrand.id,
          },
        });
        console.log("✅ Partnership created successfully!");
      }

      // Update action URLs for brands based on category
      const brandUpdates = [];

      for (const brand of brands) {
        let actionUrl = null;
        let actionType = null;
        let actionLabel = null;

        switch (brand.category.toLowerCase()) {
          case "restaurant":
          case "food":
            actionUrl = "https://www.opentable.com/";
            actionType = "reserve";
            actionLabel = "הזמנת מקום";
            break;
          case "home":
            actionUrl = `https://www.google.com/maps/search/${encodeURIComponent(
              brand.name,
            )}`;
            actionType = "navigate";
            actionLabel = "נווט לחנות";
            break;
          case "baby":
            actionUrl = `https://www.google.com/maps/search/${encodeURIComponent(
              brand.name,
            )}`;
            actionType = "navigate";
            actionLabel = "נווט לחנות";
            break;
          case "transport":
            actionUrl = `https://www.google.com/maps/search/${encodeURIComponent(
              brand.name,
            )}`;
            actionType = "navigate";
            actionLabel = "מצא מיקום";
            break;
          default:
            actionUrl = null; // Will use brand's website
            actionType = "visit";
            actionLabel = "בקר באתר";
        }

        if (!brand.actionUrl && actionUrl) {
          brandUpdates.push({
            id: brand.id,
            name: brand.name,
            updates: { actionUrl, actionType, actionLabel },
          });
        }
      }

      // Apply brand updates
      for (const update of brandUpdates) {
        await prisma.brand.update({
          where: { id: update.id },
          data: update.updates,
        });
        console.log(
          `✅ Updated ${update.name} with action: ${update.updates.actionLabel}`,
        );
      }
    } else {
      console.log("Could not find both Giraffe and Nono&Mimi brands");
      console.log(
        "Available brands:",
        brands.map((b) => b.name),
      );
    }

    // List all partnerships
    const partnerships = await prisma.brandPartnership.findMany({
      include: {
        brandA: { select: { name: true } },
        brandB: { select: { name: true } },
      },
    });

    console.log("\n🤝 Current partnerships:");
    partnerships.forEach((p) => {
      console.log(`  ${p.brandA.name} ↔ ${p.brandB.name}`);
    });
  } catch (error) {
    console.error("❌ Error creating partnerships:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createPartnerships();
