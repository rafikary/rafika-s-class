import prisma from '../config/database';
import { differenceInDays } from 'date-fns';

export class DashboardService {
  async getDashboardStats(month?: number, year?: number) {
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();

    // Get date range for the month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    // Count total students and active students
    const [totalStudents, activeStudents] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'active' } }),
    ]);

    // Get reports this month
    const reportsThisMonth = await prisma.dailyReport.findMany({
      where: {
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
            tarif: true,
          },
        },
      },
    });

    // Count total reports
    const totalReports = await prisma.dailyReport.count();

    // Calculate income from present attendance
    const presentReports = reportsThisMonth.filter(
      (report) => report.attendanceStatus === 'present'
    );

    const totalIncome = presentReports.reduce((sum, report) => {
      return sum + (report.student.tarif || 0);
    }, 0);

    // Breakdown income per student
    const incomeByStudent: Record<number, {
      studentId: number;
      studentName: string;
      tarif: number;
      sessionsCount: number;
      totalIncome: number;
    }> = {};

    presentReports.forEach((report) => {
      const studentId = report.student.id;
      if (!incomeByStudent[studentId]) {
        incomeByStudent[studentId] = {
          studentId: report.student.id,
          studentName: report.student.name,
          tarif: report.student.tarif || 0,
          sessionsCount: 0,
          totalIncome: 0,
        };
      }
      incomeByStudent[studentId].sessionsCount += 1;
      incomeByStudent[studentId].totalIncome += report.student.tarif || 0;
    });

    // Convert to array and sort by total income descending
    const incomeBreakdown = Object.values(incomeByStudent).sort(
      (a, b) => b.totalIncome - a.totalIncome
    );

    // Count attendance by status this month
    const attendanceStats = {
      present: reportsThisMonth.filter((r) => r.attendanceStatus === 'present').length,
      excused: reportsThisMonth.filter((r) => r.attendanceStatus === 'excused').length,
      sick: reportsThisMonth.filter((r) => r.attendanceStatus === 'sick').length,
      cancelled: reportsThisMonth.filter((r) => r.attendanceStatus === 'cancelled').length,
    };

    return {
      totalStudents,
      activeStudents,
      totalReports,
      reportsThisMonth: reportsThisMonth.length,
      totalIncome,
      incomeThisMonth: totalIncome,
      incomeBreakdown,
      attendanceStats,
      period: {
        month: currentMonth,
        year: currentYear,
      },
    };
  }

  async getRecentReports(limit: number = 5) {
    const reports = await prisma.dailyReport.findMany({
      take: limit,
      orderBy: { date: 'desc' },
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

    return reports;
  }

  /**
   * Get notifications/reminders untuk dashboard
   * - Siswa yang sudah 10x pertemuan (perlu kirim laporan)
   * - Siswa yang sudah 30 hari belum kirim laporan bulanan
   */
  async getNotifications() {
    const now = new Date();
    const notifications: Array<{
      type: 'ten_meetings' | 'monthly_report' | 'unpaid_salary';
      studentId: number;
      studentName: string;
      message: string;
      priority: 'high' | 'medium' | 'low';
      data?: any;
    }> = [];

    // Check students dengan meetingCount kelipatan 10 (perlu kirim laporan)
    const studentsWithTenMeetings = await prisma.student.findMany({
      where: {
        status: 'active',
        meetingCount: {
          gte: 10,
        },
      },
      select: {
        id: true,
        name: true,
        meetingCount: true,
        lastReportSentAt: true,
        parentWhatsapp: true,
      },
    });

    for (const student of studentsWithTenMeetings) {
      // Check if meetingCount is multiple of 10
      if (student.meetingCount % 10 === 0) {
        // Check if report already sent for this milestone
        const lastMilestone = Math.floor(student.meetingCount / 10);
        
        notifications.push({
          type: 'ten_meetings',
          studentId: student.id,
          studentName: student.name,
          message: `${student.name} sudah ${student.meetingCount}x pertemuan! Kirim laporan ke orang tua?`,
          priority: 'high',
          data: {
            meetingCount: student.meetingCount,
            milestone: lastMilestone,
            hasWhatsapp: !!student.parentWhatsapp,
          },
        });
      }
    }

    // Check students yang sudah 30+ hari belum kirim laporan bulanan
    const studentsNeedMonthlyReport = await prisma.student.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        lastMonthlySentAt: true,
        parentWhatsapp: true,
      },
    });

    for (const student of studentsNeedMonthlyReport) {
      const daysSinceLastReport = student.lastMonthlySentAt
        ? differenceInDays(now, student.lastMonthlySentAt)
        : 999; // Belum pernah kirim

      if (daysSinceLastReport >= 30) {
        notifications.push({
          type: 'monthly_report',
          studentId: student.id,
          studentName: student.name,
          message: `Sudah ${daysSinceLastReport} hari belum kirim laporan bulanan untuk ${student.name}`,
          priority: daysSinceLastReport >= 40 ? 'high' : 'medium',
          data: {
            daysSinceLastReport,
            hasWhatsapp: !!student.parentWhatsapp,
          },
        });
      }
    }

    // Check unpaid salaries
    const unpaidSalaries = await prisma.salaryRecord.findMany({
      where: { isPaid: false },
      include: {
        student: {
          select: {
            name: true,
          },
        },
      },
      take: 5, // Limit to top 5
      orderBy: { periodEnd: 'desc' },
    });

    for (const salary of unpaidSalaries) {
      notifications.push({
        type: 'unpaid_salary',
        studentId: salary.studentId,
        studentName: salary.student.name,
        message: `Gaji belum dicatat: ${salary.student.name} - ${salary.periodType === 'per_10_meetings' ? '10x pertemuan' : 'Bulanan'} (Rp ${salary.totalAmount.toLocaleString('id-ID')})`,
        priority: 'medium',
        data: {
          salaryRecordId: salary.id,
          amount: salary.totalAmount,
          periodType: salary.periodType,
        },
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return notifications;
  }
}

export default new DashboardService();
