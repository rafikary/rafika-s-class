import { Request, Response } from 'express';
import financialService from '../services/financialService';
import { successResponse } from '../utils/response';
import { asyncHandler } from '../utils/errorHandler';

export class FinancialController {
  getFinancialReport = asyncHandler(async (req: Request, res: Response) => {
    const { month, year } = req.query;

    const report = await financialService.getFinancialReport(
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    );

    return successResponse(res, report);
  });

  updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const reportId = parseInt(req.params.id);
    const { paymentStatus } = req.body;

    if (!['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid payment status' },
      });
    }

    const report = await financialService.updatePaymentStatus(reportId, paymentStatus);
    return successResponse(res, report);
  });

  markMultipleAsPaid = asyncHandler(async (req: Request, res: Response) => {
    const { reportIds } = req.body;

    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'reportIds must be a non-empty array' },
      });
    }

    const result = await financialService.markMultipleAsPaid(reportIds);
    return successResponse(res, result);
  });
}

export default new FinancialController();
