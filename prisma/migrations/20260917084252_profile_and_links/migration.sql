-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'NOVICE', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "level" "SkillLevel",
ADD COLUMN     "skills" TEXT;

-- CreateTable
CREATE TABLE "ProfileLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "PlanDocKind" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileLink_userId_idx" ON "ProfileLink"("userId");

-- AddForeignKey
ALTER TABLE "ProfileLink" ADD CONSTRAINT "ProfileLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
