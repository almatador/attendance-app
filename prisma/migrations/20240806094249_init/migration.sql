/*
  Warnings:

  - You are about to drop the column `jopTitel` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `_adminusers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jobTitle` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_adminusers` DROP FOREIGN KEY `_AdminUsers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_adminusers` DROP FOREIGN KEY `_AdminUsers_B_fkey`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `jopTitel`,
    ADD COLUMN `adminId` INTEGER NULL,
    ADD COLUMN `jobTitle` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_adminusers`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
