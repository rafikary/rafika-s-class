-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_daily_reports" (
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
    "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "daily_reports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_daily_reports" ("attendance_status", "created_at", "date", "end_time", "enthusiasm_score", "focus_score", "homework", "id", "parent_notes", "progress_notes", "start_time", "student_id", "subject", "topic", "understanding_score", "updated_at") SELECT "attendance_status", "created_at", "date", "end_time", "enthusiasm_score", "focus_score", "homework", "id", "parent_notes", "progress_notes", "start_time", "student_id", "subject", "topic", "understanding_score", "updated_at" FROM "daily_reports";
DROP TABLE "daily_reports";
ALTER TABLE "new_daily_reports" RENAME TO "daily_reports";
CREATE INDEX "daily_reports_student_id_idx" ON "daily_reports"("student_id");
CREATE INDEX "daily_reports_date_idx" ON "daily_reports"("date");
CREATE INDEX "daily_reports_student_id_date_idx" ON "daily_reports"("student_id", "date");
CREATE INDEX "daily_reports_payment_status_idx" ON "daily_reports"("payment_status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
