-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "ViewStatus" AS ENUM ('PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "SideType" AS ENUM ('SIDE', 'COUNTERPART');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('LINK', 'YOUTUBE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "political_views" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" "ViewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "political_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view_sides" (
    "id" TEXT NOT NULL,
    "politicalViewId" TEXT NOT NULL,
    "type" "SideType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "view_sides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "viewSideId" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "politicalViewId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_threads" (
    "id" TEXT NOT NULL,
    "politicalViewId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "political_views_categoryId_idx" ON "political_views"("categoryId");

-- CreateIndex
CREATE INDEX "political_views_status_idx" ON "political_views"("status");

-- CreateIndex
CREATE UNIQUE INDEX "view_sides_politicalViewId_type_key" ON "view_sides"("politicalViewId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_userId_politicalViewId_key" ON "reactions"("userId", "politicalViewId");

-- CreateIndex
CREATE INDEX "comments_threadId_idx" ON "comments"("threadId");

-- AddForeignKey
ALTER TABLE "political_views" ADD CONSTRAINT "political_views_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "political_views" ADD CONSTRAINT "political_views_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_sides" ADD CONSTRAINT "view_sides_politicalViewId_fkey" FOREIGN KEY ("politicalViewId") REFERENCES "political_views"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_viewSideId_fkey" FOREIGN KEY ("viewSideId") REFERENCES "view_sides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_politicalViewId_fkey" FOREIGN KEY ("politicalViewId") REFERENCES "political_views"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_threads" ADD CONSTRAINT "comment_threads_politicalViewId_fkey" FOREIGN KEY ("politicalViewId") REFERENCES "political_views"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "comment_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
