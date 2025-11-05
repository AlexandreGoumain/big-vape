-- Initialize Loyalty Program
-- This script creates tables and initial rewards

-- Step 1: Add loyalty fields to User table (if not exists)
ALTER TABLE `User`
  ADD COLUMN IF NOT EXISTS `loyaltyPoints` INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `totalPointsEarned` INT NOT NULL DEFAULT 0;

-- Step 2: Create ProductView table
CREATE TABLE IF NOT EXISTS `ProductView` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` VARCHAR(191) NULL,
  `productId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ProductView_productId_idx` (`productId`),
  INDEX `ProductView_userId_idx` (`userId`),
  CONSTRAINT `ProductView_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ProductView_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 3: Create Newsletter table
CREATE TABLE IF NOT EXISTS `Newsletter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Newsletter_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 4: Create LoyaltyTransaction table
CREATE TABLE IF NOT EXISTS `LoyaltyTransaction` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` VARCHAR(191) NOT NULL,
  `points` INT NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `orderId` INT NULL,
  `rewardId` INT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `LoyaltyTransaction_userId_idx` (`userId`),
  INDEX `LoyaltyTransaction_createdAt_idx` (`createdAt`),
  CONSTRAINT `LoyaltyTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 5: Create LoyaltyReward table
CREATE TABLE IF NOT EXISTS `LoyaltyReward` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `pointsCost` INT NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `value` INT NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `stock` INT NULL,
  `validDays` INT NOT NULL DEFAULT 30,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 6: Create UserReward table
CREATE TABLE IF NOT EXISTS `UserReward` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` VARCHAR(191) NOT NULL,
  `rewardId` INT NOT NULL,
  `isUsed` BOOLEAN NOT NULL DEFAULT false,
  `usedAt` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `UserReward_userId_idx` (`userId`),
  INDEX `UserReward_expiresAt_idx` (`expiresAt`),
  CONSTRAINT `UserReward_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserReward_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `LoyaltyReward`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 7: Insert initial rewards
INSERT INTO `LoyaltyReward` (`title`, `description`, `pointsCost`, `type`, `value`, `validDays`)
VALUES
  ('5€ de réduction', 'Économisez 5€ sur votre prochaine commande (minimum 30€)', 500, 'discount_fixed', 500, 30),
  ('10% de réduction', '10% de réduction sur votre prochaine commande', 750, 'discount_percentage', 10, 30),
  ('Livraison gratuite', 'Livraison offerte sur votre prochaine commande', 300, 'free_shipping', 0, 30),
  ('15% de réduction', '15% de réduction sur votre prochaine commande', 1200, 'discount_percentage', 15, 30),
  ('10€ de réduction', 'Économisez 10€ sur votre prochaine commande (minimum 50€)', 1000, 'discount_fixed', 1000, 30),
  ('20% de réduction', '20% de réduction sur votre prochaine commande', 2000, 'discount_percentage', 20, 45),
  ('20€ de réduction', 'Économisez 20€ sur votre prochaine commande (minimum 100€)', 2000, 'discount_fixed', 2000, 45),
  ('25% de réduction VIP', '25% de réduction exclusive pour nos membres VIP', 3000, 'discount_percentage', 25, 60)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Display success message
SELECT '✅ Loyalty program initialized successfully!' AS Status;
SELECT COUNT(*) AS 'Total Rewards' FROM `LoyaltyReward`;
