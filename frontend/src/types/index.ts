// Student types
export interface Student {
  id: number;
  name: string;
  grade: string;
  parentName: string;
  parentWhatsapp: string | null;
  address: string | null;
  tarif: number | null;
  status: string;
  salaryScheduleType: string;
  monthlyPaymentDate: number | null;
  lastSalaryGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
  totalReports?: number;
}

export interface StudentFormData {
  name: string;
  grade: string;
  parentName: string;
  parentWhatsapp?: string;
  address?: string;
  tarif?: number;
  status?: string;
  salaryScheduleType?: string;
  monthlyPaymentDate?: number;
}

// Schedule types
export interface Schedule {
  id: number;
  studentId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    name: string;
    grade: string;
  };
}

export interface ScheduleFormData {
  studentId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

// Report types
export interface DailyReport {
  id: number;
  studentId: number;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  topic: string;
  subject2?: string | null;
  topic2?: string | null;
  subject3?: string | null;
  topic3?: string | null;
  enthusiasmScore: number;
  focusScore: number;
  understandingScore: number;
  homework: string | null;
  progressNotes: string | null;
  parentNotes: string | null;
  attendanceStatus: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    name: string;
    grade: string;
  };
}

export interface DailyReportFormData {
  studentId: number;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  topic: string;
  subject2?: string;
  topic2?: string;
  subject3?: string;
  topic3?: string;
  enthusiasmScore: number;
  focusScore: number;
  understandingScore: number;
  homework?: string;
  progressNotes?: string;
  parentNotes?: string;
  attendanceStatus?: string;
}

// Monthly Report types
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

export interface MonthlyReport {
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
  reports: DailyReport[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
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

export interface MonthlyReportQuery {
  month?: number;      // Optional - for backward compatibility
  year?: number;       // Optional - for backward compatibility
  startDate?: string;  // ISO date format (YYYY-MM-DD)
  endDate?: string;    // ISO date format (YYYY-MM-DD)
}

// WhatsApp types
export interface WhatsAppLinkResponse {
  whatsappUrl: string;
  message: string;
  parentWhatsapp: string;
}
