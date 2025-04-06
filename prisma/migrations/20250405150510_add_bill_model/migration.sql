/*
  Warnings:

  - You are about to drop the column `reference` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `status` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "reference",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL;
