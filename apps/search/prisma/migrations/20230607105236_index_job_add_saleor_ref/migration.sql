/*
  Warnings:

  - Added the required column `ownerSaleor` to the `IndexJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IndexJob" ADD COLUMN     "ownerSaleor" TEXT NOT NULL;
