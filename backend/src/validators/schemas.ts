import { z } from 'zod';

// Student validation
export const createStudentSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  grade: z.string().min(1, 'Kelas harus diisi'),
  parentName: z.string().min(3, 'Nama orang tua minimal 3 karakter').max(100),
  parentWhatsapp: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+?62|0)8\d{8,11}$/.test(val),
      'Format nomor WhatsApp tidak valid'
    ),
  address: z.string().optional(),
  tarif: z.number().int().positive('Tarif harus angka positif').optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

// Schedule validation
export const createScheduleSchema = z.object({
  studentId: z.number().int().positive('Student ID harus valid'),
  dayOfWeek: z.enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid (HH:MM)'),
  isActive: z.boolean().optional(),
});

export const updateScheduleSchema = createScheduleSchema.partial();

// Daily Report validation
export const createDailyReportSchema = z.object({
  studentId: z.number().int().positive('Student ID harus valid'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Format tanggal tidak valid'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid'),
  subject: z.string().min(3, 'Mata pelajaran minimal 3 karakter'),
  topic: z.string().min(5, 'Topik minimal 5 karakter'),
  enthusiasmScore: z.number().int().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5'),
  focusScore: z.number().int().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5'),
  understandingScore: z.number().int().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5'),
  homework: z.string().optional(),
  progressNotes: z.string().optional(),
  parentNotes: z.string().optional(),
  attendanceStatus: z.enum(['present', 'excused', 'sick', 'cancelled']).optional(),
});

export const updateDailyReportSchema = createDailyReportSchema.partial();

// Query validation
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

export const monthlyReportQuerySchema = z.object({
  month: z.string().transform(Number).pipe(z.number().int().min(1).max(12)),
  year: z.string().transform(Number).pipe(z.number().int().min(2020).max(2100)),
});
