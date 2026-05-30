import axios, { AxiosError } from 'axios';
import {
  Student,
  StudentFormData,
  Schedule,
  ScheduleFormData,
  DailyReport,
  DailyReportFormData,
  MonthlyReport,
  ApiResponse,
  StudentQueryParams,
  ReportQueryParams,
  MonthlyReportQuery,
  WhatsAppLinkResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error.message;
    }
    return axiosError.message;
  }
  return 'Terjadi kesalahan yang tidak diketahui';
};

// Students API
export const studentsApi = {
  getAll: async (params?: StudentQueryParams): Promise<Student[]> => {
    const { data } = await api.get<ApiResponse<Student[]>>('/students', { params });
    return data.data || [];
  },

  getById: async (id: number): Promise<Student> => {
    const { data } = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return data.data!;
  },

  getActive: async (): Promise<Student[]> => {
    const { data } = await api.get<ApiResponse<Student[]>>('/students/active');
    return data.data || [];
  },

  create: async (formData: StudentFormData): Promise<Student> => {
    const { data } = await api.post<ApiResponse<Student>>('/students', formData);
    return data.data!;
  },

  update: async (id: number, formData: Partial<StudentFormData>): Promise<Student> => {
    const { data } = await api.put<ApiResponse<Student>>(`/students/${id}`, formData);
    return data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/students/${id}`);
  },
};

// Schedules API
export const schedulesApi = {
  getAll: async (params?: { studentId?: number; dayOfWeek?: string }): Promise<Schedule[]> => {
    const { data } = await api.get<ApiResponse<Schedule[]>>('/schedules', { params });
    return data.data || [];
  },

  getById: async (id: number): Promise<Schedule> => {
    const { data } = await api.get<ApiResponse<Schedule>>(`/schedules/${id}`);
    return data.data!;
  },

  create: async (formData: ScheduleFormData): Promise<Schedule> => {
    const { data } = await api.post<ApiResponse<Schedule>>('/schedules', formData);
    return data.data!;
  },

  update: async (id: number, formData: Partial<ScheduleFormData>): Promise<Schedule> => {
    const { data } = await api.put<ApiResponse<Schedule>>(`/schedules/${id}`, formData);
    return data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },
};

// Reports API
export const reportsApi = {
  getAll: async (params?: ReportQueryParams): Promise<DailyReport[]> => {
    const { data } = await api.get<ApiResponse<DailyReport[]>>('/reports', { params });
    return data.data || [];
  },

  getById: async (id: number): Promise<DailyReport> => {
    const { data } = await api.get<ApiResponse<DailyReport>>(`/reports/${id}`);
    return data.data!;
  },

  create: async (formData: DailyReportFormData): Promise<DailyReport> => {
    const { data } = await api.post<ApiResponse<DailyReport>>('/reports', formData);
    return data.data!;
  },

  update: async (id: number, formData: Partial<DailyReportFormData>): Promise<DailyReport> => {
    const { data } = await api.put<ApiResponse<DailyReport>>(`/reports/${id}`, formData);
    return data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },

  getMonthly: async (studentId: number, query: MonthlyReportQuery): Promise<MonthlyReport> => {
    const { data } = await api.get<ApiResponse<MonthlyReport>>(
      `/reports/monthly/${studentId}`,
      { params: query }
    );
    return data.data!;
  },

  exportExcel: async (studentId: number, query: MonthlyReportQuery): Promise<Blob> => {
    const response = await api.get(`/reports/export/excel/${studentId}`, {
      params: query,
      responseType: 'blob',
    });
    return response.data;
  },

  getWhatsAppLink: async (
    studentId: number,
    query: MonthlyReportQuery
  ): Promise<WhatsAppLinkResponse> => {
    const { data } = await api.get<ApiResponse<WhatsAppLinkResponse>>(
      `/reports/whatsapp/${studentId}`,
      { params: query }
    );
    return data.data!;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (params?: { month?: number; year?: number }): Promise<any> => {
    const { data } = await api.get<ApiResponse<any>>('/dashboard/stats', { params });
    return data.data!;
  },

  getRecentReports: async (limit?: number): Promise<DailyReport[]> => {
    const { data } = await api.get<ApiResponse<DailyReport[]>>('/dashboard/recent-reports', {
      params: { limit },
    });
    return data.data || [];
  },
};

export default api;
