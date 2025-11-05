import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting loyalty program setup...\n");

  try {
    // 1. Apply SQL migration
    console.log("📦 Applying database migration...");
    const sqlPath = path.join(
      __dirname,
      "../prisma/migrations/manual_add_loyalty_features.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split by semicolons and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (error: any) {
        // Ignore errors for columns/tables that already exist
        if (
          !error.message.includes("Duplicate column") &&
          !error.message.includes("already exists")
        ) {
          console.error(`Error executing statement: ${statement.substring(0, 50)}...`);
          throw error;
        } else {
          console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
        }
      }
    }
    console.log("✅ Migration applied successfully!\n");

    // 2. Create initial rewards
    console.log("🎁 Creating initial loyalty rewards...");

    const rewardsToCreate = [
      {
        title: "5€ de réduction",
        description: "Économisez 5€ sur votre prochaine commande (minimum 30€)",
        pointsCost: 500,
        type: "discount_fixed",
        value: 500, // 5€ en centimes
        validDays: 30,
      },
      {
        title: "10% de réduction",
        description: "10% de réduction sur votre prochaine commande",
        pointsCost: 750,
        type: "discount_percentage",
        value: 10,
        validDays: 30,
      },
      {
        title: "Livraison gratuite",
        description: "Livraison offerte sur votre prochaine commande",
        pointsCost: 300,
        type: "free_shipping",
        value: 0,
        validDays: 30,
      },
      {
        title: "15% de réduction",
        description: "15% de réduction sur votre prochaine commande",
        pointsCost: 1200,
        type: "discount_percentage",
        value: 15,
        validDays: 30,
      },
      {
        title: "10€ de réduction",
        description: "Économisez 10€ sur votre prochaine commande (minimum 50€)",
        pointsCost: 1000,
        type: "discount_fixed",
        value: 1000, // 10€ en centimes
        validDays: 30,
      },
      {
        title: "20% de réduction",
        description: "20% de réduction sur votre prochaine commande",
        pointsCost: 2000,
        type: "discount_percentage",
        value: 20,
        validDays: 45,
      },
      {
        title: "20€ de réduction",
        description: "Économisez 20€ sur votre prochaine commande (minimum 100€)",
        pointsCost: 2000,
        type: "discount_fixed",
        value: 2000, // 20€ en centimes
        validDays: 45,
      },
      {
        title: "25% de réduction VIP",
        description: "25% de réduction exclusive pour nos membres VIP",
        pointsCost: 3000,
        type: "discount_percentage",
        value: 25,
        validDays: 60,
      },
    ];

    for (const reward of rewardsToCreate) {
      try {
        const created = await prisma.loyaltyReward.create({
          data: reward,
        });
        console.log(`  ✓ Created: ${created.title} (${created.pointsCost} points)`);
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`  ⚠️  Skipped (already exists): ${reward.title}`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n✅ All rewards created successfully!\n");

    // 3. Stats
    console.log("📊 Current status:");
    const rewardCount = await prisma.loyaltyReward.count();
    const userCount = await prisma.user.count();
    console.log(`  - ${rewardCount} rewards in catalog`);
    console.log(`  - ${userCount} users in database`);

    console.log("\n🎉 Loyalty program setup completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("  1. Test signup bonus: Créer un nouveau compte");
    console.log("  2. Test order points: Passer une commande");
    console.log("  3. Test review points: Laisser un avis");
    console.log("  4. Test rewards: Échanger des points sur /account/loyalty");
  } catch (error) {
    console.error("\n❌ Error during setup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
