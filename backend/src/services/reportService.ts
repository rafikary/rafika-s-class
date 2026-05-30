import prisma from '../config/database';
import { DailyReportInput, ReportQueryParams, MonthlyReportQuery } from '../types';
import salaryService from './salaryService';

export class ReportService {
  async getAllReports(params: ReportQueryParams) {
    const {
      studentId,
      startDate,
      endDate,
      month,
      year,
      subject,
      page = 1,
      limit = 10,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    if (subject) {
      where.subject = { contains: subject, mode: 'insensitive' };
    }

    const [reports, total] = await Promise.all([
      prisma.dailyReport.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              grade: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.dailyReport.count({ where }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReportById(id: number) {
    const report = await prisma.dailyReport.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            parentName: true,
            parentWhatsapp: true,
          },
        },
      },
    });

    if (!report) {
      throw new Error('Laporan tidak ditemukan');
    }

    return report;
  }

  async createReport(data: DailyReportInput) {
    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new Error('Siswa tidak ditemukan');
    }

    const report = await prisma.dailyReport.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    // AUTO INCREMENT MEETING COUNT jika hadir
    if (data.attendanceStatus === 'present') {
      const updatedStudent = await prisma.student.update({
        where: { id: data.studentId },
        data: {
          meetingCount: { increment: 1 },
        },
      });

      // AUTO GENERATE SALARY tiap 10x pertemuan
      if (updatedStudent.meetingCount % 10 === 0) {
        await salaryService.generateTenMeetingSalary(data.studentId);
      }
    }

    return report;
  }

  async updateReport(id: number, data: Partial<DailyReportInput>) {
    // Check if report exists
    await this.getReportById(id);

    // If studentId is being updated, verify new student exists
    if (data.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: data.studentId },
      });

      if (!student) {
        throw new Error('Siswa tidak ditemukan');
      }
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const report = await prisma.dailyReport.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    return report;
  }

  async deleteReport(id: number) {
    // Check if report exists
    await this.getReportById(id);

    await prisma.dailyReport.delete({
      where: { id },
    });

    return { message: 'Laporan berhasil dihapus' };
  }

  async getMonthlyReport(query: MonthlyReportQuery) {
    const { studentId, month, year, startDate, endDate } = query;

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        grade: true,
        parentName: true,
        parentWhatsapp: true,
      },
    });

    if (!student) {
      throw new Error('Siswa tidak ditemukan');
    }

    // Determine date range
    let periodStart: Date;
    let periodEnd: Date;
    let periodLabel: string;
    
    if (startDate && endDate) {
      // Use custom date range
      periodStart = new Date(startDate);
      periodEnd = new Date(endDate);
      
      // Format as "6 May - 5 June 2026"
      const startFormatted = periodStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const endFormatted = periodEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      periodLabel = `${startFormatted} - ${endFormatted}`;
    } else if (month && year) {
      // Use month/year (backward compatibility)
      periodStart = new Date(year, month - 1, 1);
      periodEnd = new Date(year, month, 0);
      
      // Format as "May 2026"
      periodLabel = periodStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    } else {
      throw new Error('Either (month + year) or (startDate + endDate) must be provided');
    }

    // Get reports for the period
    const reports = await prisma.dailyReport.findMany({
      where: {
        studentId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate summary
    const totalSessions = reports.length;
    const present = reports.filter((r) => r.attendanceStatus === 'present').length;
    const excused = reports.filter((r) => r.attendanceStatus === 'excused').length;
    const sick = reports.filter((r) => r.attendanceStatus === 'sick').length;
    const cancelled = reports.filter((r) => r.attendanceStatus === 'cancelled').length;

    const avgEnthusiasm =
      totalSessions > 0
        ? reports.reduce((sum, r) => sum + r.enthusiasmScore, 0) / totalSessions
        : 0;

    const avgFocus =
      totalSessions > 0
        ? reports.reduce((sum, r) => sum + r.focusScore, 0) / totalSessions
        : 0;

    const avgUnderstanding =
      totalSessions > 0
        ? reports.reduce((sum, r) => sum + r.understandingScore, 0) / totalSessions
        : 0;

    // Get unique subjects (deduplicated) and sort alphabetically
    const subjectsCovered = [...new Set(reports.map((r) => r.subject))].sort();

    return {
      student,
      period: {
        label: periodLabel,  // "6 May - 5 June 2026" or "May 2026"
        startDate: periodStart.toISOString().split('T')[0],
        endDate: periodEnd.toISOString().split('T')[0],
      },
      summary: {
        totalSessions,
        present,
        excused,
        sick,
        cancelled,
        avgEnthusiasm: Math.round(avgEnthusiasm * 100) / 100,
        avgFocus: Math.round(avgFocus * 100) / 100,
        avgUnderstanding: Math.round(avgUnderstanding * 100) / 100,
        subjectsCovered,
      },
      reports,
    };
  }
}

export default new ReportService();
