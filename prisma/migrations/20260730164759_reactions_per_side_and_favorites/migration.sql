-- Reset existing reactions: they were keyed by political view, not by side, and cannot
-- be mapped to a specific side automatically. Test/dev data only.
DELETE FROM "reactions";

-- DropForeignKey
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_politicalViewId_fkey";

-- DropIndex
DROP INDEX "reactions_userId_politicalViewId_key";

-- AlterTable
ALTER TABLE "reactions" DROP COLUMN "politicalViewId",
ADD COLUMN     "viewSideId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "politicalViewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_politicalViewId_key" ON "favorites"("userId", "politicalViewId");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_userId_viewSideId_key" ON "reactions"("userId", "viewSideId");

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_viewSideId_fkey" FOREIGN KEY ("viewSideId") REFERENCES "view_sides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_politicalViewId_fkey" FOREIGN KEY ("politicalViewId") REFERENCES "political_views"("id") ON DELETE CASCADE ON UPDATE CASCADE;
