-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "isLead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredPosition" "Position";
