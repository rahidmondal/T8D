-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TaskList" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Task_lastModified_idx" ON "Task"("lastModified");

-- CreateIndex
CREATE INDEX "Task_is_deleted_idx" ON "Task"("is_deleted");

-- CreateIndex
CREATE INDEX "TaskList_lastModified_idx" ON "TaskList"("lastModified");

-- CreateIndex
CREATE INDEX "TaskList_is_deleted_idx" ON "TaskList"("is_deleted");
