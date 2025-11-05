-- CreateTable ProductVariant
CREATE TABLE `ProductVariant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `priceAdjustment` INTEGER NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `image` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductVariant_sku_key`(`sku`),
    INDEX `ProductVariant_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable CartItem - Add variantId
ALTER TABLE `CartItem` ADD COLUMN `variantId` INTEGER NULL;

-- AlterTable CartItem - Drop old unique constraint
ALTER TABLE `CartItem` DROP INDEX `CartItem_cartId_productId_key`;

-- AlterTable CartItem - Add new unique constraint with variantId
ALTER TABLE `CartItem` ADD UNIQUE INDEX `CartItem_cartId_productId_variantId_key`(`cartId`, `productId`, `variantId`);

-- AlterTable CartItem - Add index for variantId
ALTER TABLE `CartItem` ADD INDEX `CartItem_variantId_idx`(`variantId`);

-- AlterTable OrderItem - Add variantId and variantName
ALTER TABLE `OrderItem` ADD COLUMN `variantId` INTEGER NULL,
    ADD COLUMN `variantName` VARCHAR(191) NULL;

-- AlterTable OrderItem - Add index for variantId
ALTER TABLE `OrderItem` ADD INDEX `OrderItem_variantId_idx`(`variantId`);

-- AddForeignKey ProductVariant to Product
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey CartItem to ProductVariant
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey OrderItem to ProductVariant
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
