import prisma from '../config/database';

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
}

export default new DashboardService();
