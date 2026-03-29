/*
  Warnings:

  - You are about to drop the column `isDeletedAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "isDeletedAt",
ADD COLUMN     "DeletedAt" TIMESTAMP(3);
