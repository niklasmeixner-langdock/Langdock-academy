/*
  Warnings:

  - You are about to drop the column `apiKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceSlug` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "apiKey",
DROP COLUMN "workspaceSlug";
