-- Migration: Add loyalty program and tracking features
-- Created: 2025-11-05

-- Add loyalty points fields to User table
ALTER TABLE `User`
  ADD COLUMN `loyaltyPoints` INT NOT NULL DEFAULT 0,
  ADD COLUMN `totalPointsEarned` INT NOT NULL DEFAULT 0;

-- Create ProductView table for tracking
CREATE TABLE `ProductView` (
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

-- Create Newsletter table
CREATE TABLE `Newsletter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Newsletter_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create LoyaltyTransaction table
CREATE TABLE `LoyaltyTransaction` (
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

-- Create LoyaltyReward table
CREATE TABLE `LoyaltyReward` (
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
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create UserReward table
CREATE TABLE `UserReward` (
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
