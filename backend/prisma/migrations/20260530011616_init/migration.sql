-- CreateTable
CREATE TABLE "students" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "parent_name" TEXT NOT NULL,
    "parent_whatsapp" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" INTEGER NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "schedules_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "enthusiasm_score" INTEGER NOT NULL,
    "focus_score" INTEGER NOT NULL,
    "understanding_score" INTEGER NOT NULL,
    "homework" TEXT,
    "progress_notes" TEXT,
    "parent_notes" TEXT,
    "attendance_status" TEXT NOT NULL DEFAULT 'present',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "daily_reports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_name_idx" ON "students"("name");

-- CreateIndex
CREATE INDEX "schedules_student_id_idx" ON "schedules"("student_id");

-- CreateIndex
CREATE INDEX "schedules_day_of_week_idx" ON "schedules"("day_of_week");

-- CreateIndex
CREATE INDEX "daily_reports_student_id_idx" ON "daily_reports"("student_id");

-- CreateIndex
CREATE INDEX "daily_reports_date_idx" ON "daily_reports"("date");

-- CreateIndex
CREATE INDEX "daily_reports_student_id_date_idx" ON "daily_reports"("student_id", "date");
