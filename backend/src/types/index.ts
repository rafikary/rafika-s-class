// Base types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

// Student types
export interface StudentInput {
  name: string;
  grade: string;
  parentName: string;
  parentWhatsapp?: string;
  address?: string;
  tarif?: number;
  status?: string;
}

export interface StudentWithReports {
  id: number;
  name: string;
  grade: string;
  parentName: string;
  parentWhatsapp: string | null;
  address: string | null;
  status: string;
  totalReports?: number;
}

// Schedule types
export interface ScheduleInput {
  studentId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

// Daily Report types
export interface DailyReportInput {
  studentId: number;
  date: string | Date;
  startTime: string;
  endTime: string;
  subject: string;
  topic: string;
  enthusiasmScore: number;
  focusScore: number;
  understandingScore: number;
  homework?: string;
  progressNotes?: string;
  parentNotes?: string;
  attendanceStatus?: string;
}

export interface DailyReportWithStudent {
  id: number;
  date: Date;
  startTime: string;
  endTime: string;
  subject: string;
  topic: string;
  enthusiasmScore: number;
  focusScore: number;
  understandingScore: number;
  homework: string | null;
  progressNotes: string | null;
  parentNotes: string | null;
  attendanceStatus: string;
  student: {
    id: number;
    name: string;
    grade: string;
  };
}

// Monthly Report types
export interface MonthlyReportQuery {
  studentId: number;
  month: number;
  year: number;
}

export interface MonthlyReportSummary {
  totalSessions: number;
  present: number;
  excused: number;
  sick: number;
  cancelled: number;
  avgEnthusiasm: number;
  avgFocus: number;
  avgUnderstanding: number;
  subjectsCovered: string[];
}

export interface MonthlyReportData {
  student: {
    id: number;
    name: string;
    grade: string;
    parentName: string;
    parentWhatsapp: string | null;
  };
  period: {
    month: number;
    year: number;
    monthName: string;
  };
  summary: MonthlyReportSummary;
  reports: DailyReportWithStudent[];
  overallNotes?: string;
}

// WhatsApp types
export interface WhatsAppMessageData {
  studentName: string;
  parentName: string;
  teacherName: string;
  month: string;
  year: number;
  totalSessions: number;
  subjectsSummary: string;
  progressSummary: string;
}

// Query params
export interface StudentQueryParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReportQueryParams {
  studentId?: number;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  subject?: string;
  page?: number;
  limit?: number;
}

export interface ScheduleQueryParams {
  studentId?: number;
  dayOfWeek?: string;
}
