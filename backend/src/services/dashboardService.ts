import prisma from '../config/database';
import { differenceInDays, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths } from 'date-fns';

export class DashboardService {
  /**
   * Calculate student health status based on attendance, ratings, and payment
   */
  private calculateStudentHealth(student: any, reports: any[], unpaidCount: number) {
    const totalReports = reports.length;
    if (totalReports === 0) return { status: 'unknown', score: 0 };

    // Calculate attendance rate
    const presentCount = reports.filter(r => r.attendanceStatus === 'present').length;
    const attendanceRate = (presentCount / totalReports) * 100;

    // Calculate average rating
    const totalRating = reports.reduce((sum, r) => {
      return sum + ((r.enthusiasmScore + r.focusScore + r.understandingScore) / 3);
    }, 0);
    const avgRating = totalRating / totalReports;

    // Calculate health score (0-100)
    let healthScore = 0;
    healthScore += attendanceRate * 0.4; // 40% weight
    healthScore += (avgRating / 5) * 100 * 0.4; // 40% weight
    healthScore += unpaidCount === 0 ? 20 : Math.max(0, 20 - (unpaidCount * 5)); // 20% weight

    // Determine status
    let status: 'excellent' | 'good' | 'attention' | 'risk';
    if (healthScore >= 85) status = 'excellent';
    else if (healthScore >= 70) status = 'good';
    else if (healthScore >= 50) status = 'attention';
    else status = 'risk';

    return {
      status,
      score: Math.round(healthScore),
      attendanceRate: Math.round(attendanceRate),
      avgRating: Math.round(avgRating * 10) / 10,
      unpaidCount,
    };
  }

  async getDashboardStats(month?: number, year?: number) {
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();

    // Get date range for current and last month
    const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth, 0);
    const startOfLastMonth = startOfMonth(subMonths(startOfCurrentMonth, 1));
    const endOfLastMonth = endOfMonth(subMonths(startOfCurrentMonth, 1));

    // Count total students and active students
    const [totalStudents, activeStudents] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'active' } }),
    ]);

    // Get reports this month and last month for comparison
    const [reportsThisMonth, reportsLastMonth] = await Promise.all([
      prisma.dailyReport.findMany({
        where: {
          date: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
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
      }),
      prisma.dailyReport.findMany({
        where: {
          date: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        include: {
          student: {
            select: {
              tarif: true,
            },
          },
        },
      }),
    ]);

    // Count total reports
    const totalReports = await prisma.dailyReport.count();

    // Calculate income from present attendance
    const presentReportsThisMonth = reportsThisMonth.filter(
      (report) => report.attendanceStatus === 'present'
    );
    const presentReportsLastMonth = reportsLastMonth.filter(
      (report) => report.attendanceStatus === 'present'
    );

    const incomeThisMonth = presentReportsThisMonth.reduce((sum, report) => {
      return sum + (report.student.tarif || 0);
    }, 0);

    const incomeLastMonth = presentReportsLastMonth.reduce((sum, report) => {
      return sum + (report.student.tarif || 0);
    }, 0);

    // Calculate growth percentage
    const incomeGrowth = incomeLastMonth > 0 
      ? Math.round(((incomeThisMonth - incomeLastMonth) / incomeLastMonth) * 100)
      : 0;

    const sessionsGrowth = reportsLastMonth.length > 0
      ? Math.round(((reportsThisMonth.length - reportsLastMonth.length) / reportsLastMonth.length) * 100)
      : 0;

    // Breakdown income per student
    const incomeByStudent: Record<number, {
      studentId: number;
      studentName: string;
      tarif: number;
      sessionsCount: number;
      totalIncome: number;
    }> = {};

    presentReportsThisMonth.forEach((report) => {
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
      reportsLastMonth: reportsLastMonth.length,
      totalIncome,
      incomeThisMonth,
      incomeLastMonth,
      incomeGrowth, // NEW: Growth percentage
      sessionsGrowth, // NEW: Sessions growth
      incomeBreakdown,
      attendanceStats,
      period: {
        month: currentMonth,
        year: currentYear,
      },
    };
  }

  /**
   * Get today's schedule and upcoming sessions
   */
  async getTodaySchedule() {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(now);

    // Get today's completed reports
    const todayReports = await prisma.dailyReport.findMany({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday,
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
      orderBy: {
        startTime: 'asc',
      },
    });

    // Get today's day name
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayDayName = dayNames[now.getDay()];

    // Get scheduled sessions for today
    const scheduledSessions = await prisma.schedule.findMany({
      where: {
        dayOfWeek: todayDayName,
        isActive: true,
        student: {
          status: 'active',
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
      orderBy: {
        startTime: 'asc',
      },
    });

    // Mark which sessions are completed
    const sessionsWithStatus = scheduledSessions.map(schedule => {
      const isCompleted = todayReports.some(
        report => report.studentId === schedule.studentId
      );
      return {
        ...schedule,
        isCompleted,
        status: isCompleted ? 'completed' : 'upcoming',
      };
    });

    return {
      today: todayDayName,
      totalSessions: scheduledSessions.length,
      completedSessions: todayReports.length,
      upcomingSessions: scheduledSessions.length - todayReports.length,
      sessions: sessionsWithStatus,
    };
  }

  /**
   * Get student health indicators for all active students
   */
  async getStudentHealthIndicators() {
    const students = await prisma.student.findMany({
      where: { status: 'active' },
      include: {
        dailyReports: {
          orderBy: { date: 'desc' },
          take: 20, // Last 20 sessions for calculation
        },
      },
    });

    const healthIndicators = await Promise.all(
      students.map(async (student) => {
        // Get unpaid reports count
        const unpaidCount = await prisma.dailyReport.count({
          where: {
            studentId: student.id,
            paymentStatus: 'unpaid',
            attendanceStatus: 'present',
          },
        });

        const health = this.calculateStudentHealth(
          student,
          student.dailyReports,
          unpaidCount
        );

        return {
          studentId: student.id,
          studentName: student.name,
          grade: student.grade,
          meetingCount: student.meetingCount,
          ...health,
        };
      })
    );

    // Sort by health score (worst first for attention)
    return healthIndicators.sort((a, b) => a.score - b.score);
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
