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

  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const notifications = await dashboardService.getNotifications();
    return successResponse(res, notifications);
  });

  getTodaySchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await dashboardService.getTodaySchedule();
    return successResponse(res, schedule);
  });

  getStudentHealth = asyncHandler(async (req: Request, res: Response) => {
    const healthIndicators = await dashboardService.getStudentHealthIndicators();
    return successResponse(res, healthIndicators);
  });
}

export default new DashboardController();
