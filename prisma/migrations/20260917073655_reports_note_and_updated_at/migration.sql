-- AlterTable: 기존 행은 createdAt으로 백필한 뒤 NOT NULL로 조인다
ALTER TABLE "WeeklyUpdate" ADD COLUMN     "updatedAt" TIMESTAMP(3);
UPDATE "WeeklyUpdate" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
ALTER TABLE "WeeklyUpdate" ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "ReportNote" (
    "weekStart" DATE NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportNote_pkey" PRIMARY KEY ("weekStart")
);

-- AddForeignKey
ALTER TABLE "ReportNote" ADD CONSTRAINT "ReportNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
