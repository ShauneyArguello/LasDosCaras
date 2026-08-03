-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activationToken" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING';

-- DataMigration: grandfather in users that existed before the activation flow, so they are not locked out of login
UPDATE "users" SET "status" = 'ACTIVE' WHERE "status" = 'PENDING';

-- CreateTable
CREATE TABLE "hashtags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hashtags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HashtagToPoliticalView" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "hashtags_name_key" ON "hashtags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_HashtagToPoliticalView_AB_unique" ON "_HashtagToPoliticalView"("A", "B");

-- CreateIndex
CREATE INDEX "_HashtagToPoliticalView_B_index" ON "_HashtagToPoliticalView"("B");

-- CreateIndex
CREATE UNIQUE INDEX "users_activationToken_key" ON "users"("activationToken");

-- AddForeignKey
ALTER TABLE "_HashtagToPoliticalView" ADD CONSTRAINT "_HashtagToPoliticalView_A_fkey" FOREIGN KEY ("A") REFERENCES "hashtags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HashtagToPoliticalView" ADD CONSTRAINT "_HashtagToPoliticalView_B_fkey" FOREIGN KEY ("B") REFERENCES "political_views"("id") ON DELETE CASCADE ON UPDATE CASCADE;

