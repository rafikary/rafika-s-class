import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import salaryService from '../services/salaryService';
import { startOfMonth, subMonths } from 'date-fns';

export class SalaryController {
  /**
   * GET /api/salaries/records
   * Get all salary records with filters
   */
  getRecords = asyncHandler(async (req: Request, res: Response) => {
    const { periodType, isPaid, studentId, startDate, endDate } = req.query;

    const filters: any = {};

    if (periodType) {
      filters.periodType = periodType as string;
    }

    if (isPaid !== undefined) {
      filters.isPaid = isPaid === 'true';
    }

    if (studentId) {
      filters.studentId = parseInt(studentId as string);
    }

    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }

    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }

    const records = await salaryService.getSalaryRecords(filters);

    res.json({
      success: true,
      data: records,
    });
  });

  /**
   * POST /api/salaries/generate-monthly
   * Generate monthly salaries untuk bulan tertentu
   */
  generateMonthly = asyncHandler(async (req: Request, res: Response) => {
    const { month } = req.body; // Format: YYYY-MM

    let targetMonth: Date;
    if (month) {
      targetMonth = new Date(month + '-01');
    } else {
      // Default: bulan kemarin
      targetMonth = subMonths(startOfMonth(new Date()), 1);
    }

    const salaries = await salaryService.generateMonthlySalaries(targetMonth);

    res.json({
      success: true,
      message: `Berhasil generate ${salaries.length} salary record`,
      data: salaries,
    });
  });

  /**
   * PATCH /api/salaries/:id/mark-paid
   * Mark salary as paid
   */
  markAsPaid = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await salaryService.markAsPaid(parseInt(id));

    res.json({
      success: true,
      message: 'Salary marked as paid',
    });
  });

  /**
   * GET /api/salaries/unpaid
   * Get total unpaid salary
   */
  getUnpaid = asyncHandler(async (req: Request, res: Response) => {
    const result = await salaryService.getTotalUnpaid();

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * GET /api/salaries/summary
   * Get salary summary (total, paid, unpaid)
   */
  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const { year } = req.query;

    const yearNum = year ? parseInt(year as string) : undefined;

    const summary = await salaryService.getSalarySummary(yearNum);

    res.json({
      success: true,
      data: summary,
    });
  });
}

export default new SalaryController();
