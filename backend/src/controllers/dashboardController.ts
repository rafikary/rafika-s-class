import { Request, Response } from 'express';
import dashboardService from '../services/dashboardService';
import { successResponse } from '../utils/response';
import { asyncHandler } from '../utils/errorHandler';

export class DashboardController {
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const { month, year } = req.query;

    const stats = await dashboardService.getDashboardStats(
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    );

    return successResponse(res, stats);
  });

  getRecentReports = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const reports = await dashboardService.getRecentReports(
      limit ? parseInt(limit as string) : 5
    );

    return successResponse(res, reports);
  });
}

export default new DashboardController();
