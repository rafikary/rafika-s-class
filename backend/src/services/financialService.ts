import prisma from '../config/database';

export class FinancialService {
  async getFinancialReport(month?: number, year?: number) {
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    // Get all reports for the month with payment status
    const allReports = await prisma.dailyReport.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        attendanceStatus: 'present', // Only count present sessions
      },
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
        date: 'asc',
      },
    });

    // Calculate totals
    const totalRevenue = allReports.reduce((sum, report) => {
      return sum + (report.student.tarif || 0);
    }, 0);

    const paidReports = allReports.filter((r) => r.paymentStatus === 'paid');
    const unpaidReports = allReports.filter((r) => r.paymentStatus === 'unpaid');

    const totalPaid = paidReports.reduce((sum, report) => {
      return sum + (report.student.tarif || 0);
    }, 0);

    const totalUnpaid = unpaidReports.reduce((sum, report) => {
      return sum + (report.student.tarif || 0);
    }, 0);

    // Breakdown by student
    const studentBreakdown: Record<number, {
      studentId: number;
      studentName: string;
      studentGrade: string;
      tarif: number;
      totalSessions: number;
      paidSessions: number;
      unpaidSessions: number;
      totalRevenue: number;
      totalPaid: number;
      totalUnpaid: number;
      reports: any[];
    }> = {};

    allReports.forEach((report) => {
      const studentId = report.student.id;
      if (!studentBreakdown[studentId]) {
        studentBreakdown[studentId] = {
          studentId: report.student.id,
          studentName: report.student.name,
          studentGrade: report.student.grade,
          tarif: report.student.tarif || 0,
          totalSessions: 0,
          paidSessions: 0,
          unpaidSessions: 0,
          totalRevenue: 0,
          totalPaid: 0,
          totalUnpaid: 0,
          reports: [],
        };
      }

      studentBreakdown[studentId].totalSessions += 1;
      studentBreakdown[studentId].totalRevenue += report.student.tarif || 0;
      
      if (report.paymentStatus === 'paid') {
        studentBreakdown[studentId].paidSessions += 1;
        studentBreakdown[studentId].totalPaid += report.student.tarif || 0;
      } else {
        studentBreakdown[studentId].unpaidSessions += 1;
        studentBreakdown[studentId].totalUnpaid += report.student.tarif || 0;
      }

      studentBreakdown[studentId].reports.push({
        id: report.id,
        date: report.date,
        subject: report.subject,
        paymentStatus: report.paymentStatus,
        amount: report.student.tarif || 0,
      });
    });

    const breakdown = Object.values(studentBreakdown).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    return {
      period: {
        month: currentMonth,
        year: currentYear,
      },
      summary: {
        totalRevenue,
        totalPaid,
        totalUnpaid,
        totalSessions: allReports.length,
        paidSessions: paidReports.length,
        unpaidSessions: unpaidReports.length,
      },
      breakdown,
    };
  }

  async updatePaymentStatus(reportId: number, paymentStatus: 'paid' | 'unpaid') {
    const report = await prisma.dailyReport.update({
      where: { id: reportId },
      data: { paymentStatus },
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

  async markMultipleAsPaid(reportIds: number[]) {
    await prisma.dailyReport.updateMany({
      where: {
        id: { in: reportIds },
      },
      data: {
        paymentStatus: 'paid',
      },
    });

    return { success: true, count: reportIds.length };
  }
}

export default new FinancialService();
