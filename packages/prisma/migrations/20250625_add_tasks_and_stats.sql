-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'completed', 'blocked');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "priority" "TaskPriority" NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectStats" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tasks" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "inProgress" INTEGER NOT NULL DEFAULT 0,
    "blockers" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStats_projectId_key" ON "ProjectStats"("projectId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStats" ADD CONSTRAINT "ProjectStats_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create trigger to update project stats when tasks are modified
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO "ProjectStats" ("id", "projectId", "tasks", "completed", "inProgress", "blockers", "updatedAt")
        VALUES (gen_random_uuid(), NEW."projectId", 1,
            CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
            CASE WHEN NEW.status = 'in_progress' THEN 1 ELSE 0 END,
            CASE WHEN NEW.status = 'blocked' THEN 1 ELSE 0 END,
            NOW())
        ON CONFLICT ("projectId") DO UPDATE
        SET "tasks" = "ProjectStats"."tasks" + 1,
            "completed" = "ProjectStats"."completed" + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
            "inProgress" = "ProjectStats"."inProgress" + CASE WHEN NEW.status = 'in_progress' THEN 1 ELSE 0 END,
            "blockers" = "ProjectStats"."blockers" + CASE WHEN NEW.status = 'blocked' THEN 1 ELSE 0 END,
            "updatedAt" = NOW();
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE "ProjectStats"
        SET "completed" = "ProjectStats"."completed" + 
            CASE 
                WHEN OLD.status != 'completed' AND NEW.status = 'completed' THEN 1
                WHEN OLD.status = 'completed' AND NEW.status != 'completed' THEN -1
                ELSE 0
            END,
            "inProgress" = "ProjectStats"."inProgress" + 
            CASE 
                WHEN OLD.status != 'in_progress' AND NEW.status = 'in_progress' THEN 1
                WHEN OLD.status = 'in_progress' AND NEW.status != 'in_progress' THEN -1
                ELSE 0
            END,
            "blockers" = "ProjectStats"."blockers" + 
            CASE 
                WHEN OLD.status != 'blocked' AND NEW.status = 'blocked' THEN 1
                WHEN OLD.status = 'blocked' AND NEW.status != 'blocked' THEN -1
                ELSE 0
            END,
            "updatedAt" = NOW()
        WHERE "projectId" = NEW."projectId";
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "ProjectStats"
        SET "tasks" = "ProjectStats"."tasks" - 1,
            "completed" = "ProjectStats"."completed" - CASE WHEN OLD.status = 'completed' THEN 1 ELSE 0 END,
            "inProgress" = "ProjectStats"."inProgress" - CASE WHEN OLD.status = 'in_progress' THEN 1 ELSE 0 END,
            "blockers" = "ProjectStats"."blockers" - CASE WHEN OLD.status = 'blocked' THEN 1 ELSE 0 END,
            "updatedAt" = NOW()
        WHERE "projectId" = OLD."projectId";
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Task"
FOR EACH ROW EXECUTE FUNCTION update_project_stats();
