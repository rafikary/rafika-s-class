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
const baseDailyReportSchema = z.object({
  studentId: z.number().int().positive('Student ID harus valid'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Format tanggal tidak valid'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid'),
  subject: z.string().min(3, 'Mata pelajaran minimal 3 karakter'),
  topic: z.string().min(5, 'Topik minimal 5 karakter'),
  subject2: z.string().min(3, 'Mata pelajaran minimal 3 karakter').optional(),
  topic2: z.string().min(5, 'Topik minimal 5 karakter').optional(),
  subject3: z.string().min(3, 'Mata pelajaran minimal 3 karakter').optional(),
  topic3: z.string().min(5, 'Topik minimal 5 karakter').optional(),
  enthusiasmScore: z.number().int().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5'),
  focusScore: z.number().int().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5'),
  understandingScore: z.number().int().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5'),
  homework: z.string().optional(),
  progressNotes: z.string().optional(),
  parentNotes: z.string().optional(),
  attendanceStatus: z.enum(['present', 'excused', 'sick', 'cancelled']).optional(),
});

export const createDailyReportSchema = baseDailyReportSchema.superRefine((data, ctx) => {
  if ((data.subject2 && !data.topic2) || (!data.subject2 && data.topic2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Pelajaran 2 harus diisi lengkap (mata pelajaran dan topik)',
      path: ['subject2'],
    });
  }

  if ((data.subject3 && !data.topic3) || (!data.subject3 && data.topic3)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Pelajaran 3 harus diisi lengkap (mata pelajaran dan topik)',
      path: ['subject3'],
    });
  }
});

export const updateDailyReportSchema = baseDailyReportSchema
  .partial()
  .superRefine((data, ctx) => {
    if ((data.subject2 && !data.topic2) || (!data.subject2 && data.topic2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pelajaran 2 harus diisi lengkap (mata pelajaran dan topik)',
        path: ['subject2'],
      });
    }

    if ((data.subject3 && !data.topic3) || (!data.subject3 && data.topic3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pelajaran 3 harus diisi lengkap (mata pelajaran dan topik)',
        path: ['subject3'],
      });
    }
  });

// Query validation
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

export const monthlyReportQuerySchema = z.object({
  month: z.string().transform(Number).pipe(z.number().int().min(1).max(12)).optional(),
  year: z.string().transform(Number).pipe(z.number().int().min(2020).max(2100)).optional(),
  startDate: z.string().optional(),  // ISO date format (YYYY-MM-DD)
  endDate: z.string().optional(),    // ISO date format (YYYY-MM-DD)
}).refine(
  (data) => (data.month && data.year) || (data.startDate && data.endDate),
  {
    message: "Either (month + year) or (startDate + endDate) must be provided",
    path: ["query"],
  }
);
