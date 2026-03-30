/*
  Warnings:

  - You are about to drop the column `idDeleted` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "idDeleted",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
