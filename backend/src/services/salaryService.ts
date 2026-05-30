import prisma from '../lib/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface SalaryPeriod {
  studentId: number;
  studentName: string;
  periodType: 'per_10_meetings' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
  meetingCount: number;
  totalAmount: number;
  isPaid: boolean;
}

export class SalaryService {
  /**
   * Generate salary record tiap 10x pertemuan (otomatis dipanggil pas meetingCount % 10 === 0)
   */
  async generateTenMeetingSalary(studentId: number): Promise<void> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        dailyReports: {
          where: { attendanceStatus: 'present' },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!student || !student.tarif || student.dailyReports.length < 10) {
      return;
    }

    const recentReports = student.dailyReports.slice(0, 10);
    const periodStart = recentReports[9].date; // Pertemuan pertama dari 10x
    const periodEnd = recentReports[0].date; // Pertemuan terakhir

    const totalAmount = student.tarif * 10;

    // Create salary record
    await prisma.salaryRecord.create({
      data: {
        studentId,
        periodType: 'per_10_meetings',
        periodStart,
        periodEnd,
        meetingCount: 10,
        totalAmount,
        isPaid: false,
      },
    });
  }

  /**
   * Generate monthly salary untuk semua siswa aktif
   */
  async generateMonthlySalaries(month: Date): Promise<SalaryPeriod[]> {
    const periodStart = startOfMonth(month);
    const periodEnd = endOfMonth(month);

    const students = await prisma.student.findMany({
      where: { status: 'active' },
      include: {
        dailyReports: {
          where: {
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
            attendanceStatus: 'present',
          },
        },
      },
    });

    const salaryPeriods: SalaryPeriod[] = [];

    for (const student of students) {
      if (!student.tarif || student.dailyReports.length === 0) {
        continue;
      }

      const meetingCount = student.dailyReports.length;
      const totalAmount = student.tarif * meetingCount;

      // Check if already exists
      const existing = await prisma.salaryRecord.findFirst({
        where: {
          studentId: student.id,
          periodType: 'monthly',
          periodStart,
          periodEnd,
        },
      });

      if (!existing) {
        await prisma.salaryRecord.create({
          data: {
            studentId: student.id,
            periodType: 'monthly',
            periodStart,
            periodEnd,
            meetingCount,
            totalAmount,
            isPaid: false,
          },
        });
      }

      salaryPeriods.push({
        studentId: student.id,
        studentName: student.name,
        periodType: 'monthly',
        periodStart,
        periodEnd,
        meetingCount,
        totalAmount,
        isPaid: existing?.isPaid || false,
      });
    }

    return salaryPeriods;
  }

  /**
   * Get all salary records (filter by period, paid status)
   */
  async getSalaryRecords(filters?: {
    periodType?: 'per_10_meetings' | 'monthly';
    isPaid?: boolean;
    studentId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.periodType) {
      where.periodType = filters.periodType;
    }

    if (filters?.isPaid !== undefined) {
      where.isPaid = filters.isPaid;
    }

    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.periodStart = {};
      if (filters.startDate) {
        where.periodStart.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.periodStart.lte = filters.endDate;
      }
    }

    return await prisma.salaryRecord.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            tarif: true,
          },
        },
      },
      orderBy: {
        periodEnd: 'desc',
      },
    });
  }

  /**
   * Mark salary as paid
   */
  async markAsPaid(salaryRecordId: number): Promise<void> {
    await prisma.salaryRecord.update({
      where: { id: salaryRecordId },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });
  }

  /**
   * Get total unpaid salary
   */
  async getTotalUnpaid() {
    const unpaidRecords = await prisma.salaryRecord.findMany({
      where: { isPaid: false },
    });

    const totalUnpaid = unpaidRecords.reduce((sum, record) => sum + record.totalAmount, 0);
    const totalRecords = unpaidRecords.length;

    return {
      totalUnpaid,
      totalRecords,
      records: unpaidRecords,
    };
  }

  /**
   * Get salary summary (total paid, unpaid, by month)
   */
  async getSalarySummary(year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const records = await prisma.salaryRecord.findMany({
      where: {
        periodStart: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: {
          select: {
            name: true,
            grade: true,
          },
        },
      },
    });

    const totalPaid = records
      .filter((r) => r.isPaid)
      .reduce((sum, r) => sum + r.totalAmount, 0);

    const totalUnpaid = records
      .filter((r) => !r.isPaid)
      .reduce((sum, r) => sum + r.totalAmount, 0);

    const total = totalPaid + totalUnpaid;

    return {
      year: currentYear,
      total,
      totalPaid,
      totalUnpaid,
      recordCount: records.length,
      records,
    };
  }
}

export default new SalaryService();
