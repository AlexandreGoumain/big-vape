import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/app/api/prisma/client";

export async function POST(request: NextRequest) {
  try {
    // Check for setup token from request body for initial setup
    const body = await request.json().catch(() => ({}));
    const setupToken = body.setupToken || request.headers.get("x-setup-token");

    // Allow setup with token OR admin session
    const session = await auth();
    const isAdmin = session?.user?.role === "admin";
    const hasSetupToken = setupToken === "init-loyalty-2025";

    if (!isAdmin && !hasSetupToken) {
      return NextResponse.json(
        { error: "Accès non autorisé - Admin ou token requis" },
        { status: 403 }
      );
    }

    const results: string[] = [];

    // Step 1: Add loyalty fields to User table
    results.push("📦 Adding loyalty fields to User table...");
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`User\`
        ADD COLUMN \`loyaltyPoints\` INT NOT NULL DEFAULT 0,
        ADD COLUMN \`totalPointsEarned\` INT NOT NULL DEFAULT 0
      `);
      results.push("✅ User table updated");
    } catch (error: any) {
      if (error.message.includes("Duplicate column")) {
        results.push("⚠️  User loyalty fields already exist");
      } else {
        throw error;
      }
    }

    // Step 2: Create ProductView table
    results.push("\n📦 Creating ProductView table...");
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`ProductView\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`userId\` VARCHAR(191) NULL,
          \`productId\` INT NOT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          INDEX \`ProductView_productId_idx\` (\`productId\`),
          INDEX \`ProductView_userId_idx\` (\`userId\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      results.push("✅ ProductView table created");
    } catch (error: any) {
      results.push(`⚠️  ProductView: ${error.message}`);
    }

    // Step 3: Create Newsletter table
    results.push("\n📦 Creating Newsletter table...");
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`Newsletter\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`email\` VARCHAR(191) NOT NULL UNIQUE,
          \`isActive\` BOOLEAN NOT NULL DEFAULT true,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      results.push("✅ Newsletter table created");
    } catch (error: any) {
      results.push(`⚠️  Newsletter: ${error.message}`);
    }

    // Step 4: Create LoyaltyTransaction table
    results.push("\n📦 Creating LoyaltyTransaction table...");
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`LoyaltyTransaction\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`userId\` VARCHAR(191) NOT NULL,
          \`points\` INT NOT NULL,
          \`type\` VARCHAR(191) NOT NULL,
          \`description\` TEXT NOT NULL,
          \`orderId\` INT NULL,
          \`rewardId\` INT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          INDEX \`LoyaltyTransaction_userId_idx\` (\`userId\`),
          INDEX \`LoyaltyTransaction_createdAt_idx\` (\`createdAt\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      results.push("✅ LoyaltyTransaction table created");
    } catch (error: any) {
      results.push(`⚠️  LoyaltyTransaction: ${error.message}`);
    }

    // Step 5: Create LoyaltyReward table
    results.push("\n📦 Creating LoyaltyReward table...");
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`LoyaltyReward\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`title\` VARCHAR(191) NOT NULL,
          \`description\` TEXT NOT NULL,
          \`pointsCost\` INT NOT NULL,
          \`type\` VARCHAR(191) NOT NULL,
          \`value\` INT NOT NULL,
          \`isActive\` BOOLEAN NOT NULL DEFAULT true,
          \`stock\` INT NULL,
          \`validDays\` INT NOT NULL DEFAULT 30,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      results.push("✅ LoyaltyReward table created");
    } catch (error: any) {
      results.push(`⚠️  LoyaltyReward: ${error.message}`);
    }

    // Step 6: Create UserReward table
    results.push("\n📦 Creating UserReward table...");
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`UserReward\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`userId\` VARCHAR(191) NOT NULL,
          \`rewardId\` INT NOT NULL,
          \`isUsed\` BOOLEAN NOT NULL DEFAULT false,
          \`usedAt\` DATETIME(3) NULL,
          \`expiresAt\` DATETIME(3) NOT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          INDEX \`UserReward_userId_idx\` (\`userId\`),
          INDEX \`UserReward_expiresAt_idx\` (\`expiresAt\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      results.push("✅ UserReward table created");
    } catch (error: any) {
      results.push(`⚠️  UserReward: ${error.message}`);
    }

    // Step 7: Insert initial rewards
    results.push("\n🎁 Creating initial rewards...");
    const rewards = [
      { title: '5€ de réduction', description: 'Économisez 5€ sur votre prochaine commande (minimum 30€)', pointsCost: 500, type: 'discount_fixed', value: 500, validDays: 30 },
      { title: '10% de réduction', description: '10% de réduction sur votre prochaine commande', pointsCost: 750, type: 'discount_percentage', value: 10, validDays: 30 },
      { title: 'Livraison gratuite', description: 'Livraison offerte sur votre prochaine commande', pointsCost: 300, type: 'free_shipping', value: 0, validDays: 30 },
      { title: '15% de réduction', description: '15% de réduction sur votre prochaine commande', pointsCost: 1200, type: 'discount_percentage', value: 15, validDays: 30 },
      { title: '10€ de réduction', description: 'Économisez 10€ sur votre prochaine commande (minimum 50€)', pointsCost: 1000, type: 'discount_fixed', value: 1000, validDays: 30 },
      { title: '20% de réduction', description: '20% de réduction sur votre prochaine commande', pointsCost: 2000, type: 'discount_percentage', value: 20, validDays: 45 },
      { title: '20€ de réduction', description: 'Économisez 20€ sur votre prochaine commande (minimum 100€)', pointsCost: 2000, type: 'discount_fixed', value: 2000, validDays: 45 },
      { title: '25% de réduction VIP', description: '25% de réduction exclusive pour nos membres VIP', pointsCost: 3000, type: 'discount_percentage', value: 25, validDays: 60 },
    ];

    for (const reward of rewards) {
      try {
        await prisma.loyaltyReward.create({ data: reward });
        results.push(`  ✓ ${reward.title} (${reward.pointsCost} points)`);
      } catch (error: any) {
        if (error.code === "P2002") {
          results.push(`  ⚠️  ${reward.title} (already exists)`);
        } else {
          results.push(`  ❌ ${reward.title}: ${error.message}`);
        }
      }
    }

    // Final stats
    results.push("\n📊 Final status:");
    const rewardCount = await prisma.loyaltyReward.count();
    const userCount = await prisma.user.count();
    results.push(`  - ${rewardCount} rewards in catalog`);
    results.push(`  - ${userCount} users in database`);

    results.push("\n🎉 Loyalty program setup completed!");
    results.push("\n📝 Next steps:");
    results.push("  1. Visit /account/loyalty");
    results.push("  2. Test signup bonus (create new account)");
    results.push("  3. Test order points (make a purchase)");
    results.push("  4. Test review points (write a review)");

    return NextResponse.json({
      success: true,
      message: "Loyalty program initialized successfully",
      log: results.join("\n"),
    });
  } catch (error: any) {
    console.error("Error setting up loyalty program:", error);
    return NextResponse.json(
      {
        error: "Error during setup",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
