import prisma from '../config/database';
import { DailyReportInput, ReportQueryParams, MonthlyReportQuery } from '../types';

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
    const { studentId, month, year } = query;

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

    // Get reports for the month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const reports = await prisma.dailyReport.findMany({
      where: {
        studentId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
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

    const subjectsCovered = [...new Set(reports.map((r) => r.subject))];

    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    return {
      student,
      period: {
        month,
        year,
        monthName: monthNames[month - 1],
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
