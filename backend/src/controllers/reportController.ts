import { Request, Response } from 'express';
import reportService from '../services/reportService';
import exportExcelService from '../services/exportExcelService';
import pdfService from '../services/pdfService';
import { successResponse, errorResponse, createError } from '../utils/response';
import { asyncHandler } from '../utils/errorHandler';
import {
  createDailyReportSchema,
  updateDailyReportSchema,
  monthlyReportQuerySchema,
} from '../validators/schemas';
import {
  generateMonthlyReportWhatsAppMessage,
  generateWhatsAppUrl,
  isValidWhatsAppNumber,
} from '../utils/whatsapp';
import { config } from '../config/env';

export class ReportController {
  getAllReports = asyncHandler(async (req: Request, res: Response) => {
    const {
      studentId,
      startDate,
      endDate,
      month,
      year,
      subject,
      page,
      limit,
    } = req.query;

    const params = {
      studentId: studentId ? parseInt(studentId as string) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      month: month ? parseInt(month as string) : undefined,
      year: year ? parseInt(year as string) : undefined,
      subject: subject as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    };

    const result = await reportService.getAllReports(params);
    return successResponse(res, result.data);
  });

  getReportById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, createError('INVALID_ID', 'ID tidak valid'), 400);
    }

    try {
      const report = await reportService.getReportById(id);
      return successResponse(res, report);
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });

  createReport = asyncHandler(async (req: Request, res: Response) => {
    const validation = createDailyReportSchema.safeParse(req.body);

    if (!validation.success) {
      return errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Data tidak valid', validation.error.errors),
        400
      );
    }

    try {
      const report = await reportService.createReport(validation.data);
      return successResponse(res, report, 'Laporan berhasil ditambahkan', 201);
    } catch (error: any) {
      return errorResponse(res, createError('ERROR', error.message), 400);
    }
  });

  updateReport = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, createError('INVALID_ID', 'ID tidak valid'), 400);
    }

    const validation = updateDailyReportSchema.safeParse(req.body);

    if (!validation.success) {
      return errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Data tidak valid', validation.error.errors),
        400
      );
    }

    try {
      const report = await reportService.updateReport(id, validation.data);
      return successResponse(res, report, 'Laporan berhasil diupdate');
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });

  deleteReport = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, createError('INVALID_ID', 'ID tidak valid'), 400);
    }

    try {
      const result = await reportService.deleteReport(id);
      return successResponse(res, null, result.message);
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });

  getMonthlyReport = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);

    if (isNaN(studentId)) {
      return errorResponse(res, createError('INVALID_ID', 'Student ID tidak valid'), 400);
    }

    const validation = monthlyReportQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Parameter tidak valid', validation.error.errors),
        400
      );
    }

    try {
      const monthlyReport = await reportService.getMonthlyReport({
        studentId,
        ...validation.data,  // Pass all validated data (month/year or startDate/endDate)
      });

      return successResponse(res, monthlyReport);
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });

  exportMonthlyExcel = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);

    if (isNaN(studentId)) {
      return errorResponse(res, createError('INVALID_ID', 'Student ID tidak valid'), 400);
    }

    const validation = monthlyReportQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Parameter tidak valid', validation.error.errors),
        400
      );
    }

    try {
      const monthlyReport = await reportService.getMonthlyReport({
        studentId,
        ...validation.data,  // Pass all validated data (month/year or startDate/endDate)
      });

      const buffer = await exportExcelService.generateMonthlyReportExcel(monthlyReport);

      const safeLabel = monthlyReport.period.label.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
      const filename = `Learning_Report_${monthlyReport.student.name.replace(
        /\s+/g,
        '_'
      )}_${safeLabel}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.send(buffer);
    } catch (error: any) {
      return errorResponse(res, createError('ERROR', error.message), 500);
    }
  });

  getWhatsAppLink = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);

    if (isNaN(studentId)) {
      return errorResponse(res, createError('INVALID_ID', 'Student ID tidak valid'), 400);
    }

    const validation = monthlyReportQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Parameter tidak valid', validation.error.errors),
        400
      );
    }

    try {
      const monthlyReport = await reportService.getMonthlyReport({
        studentId,
        ...validation.data,  // Pass all validated data (month/year or startDate/endDate)
      });

      // Check if parent WhatsApp is available
      if (!monthlyReport.student.parentWhatsapp) {
        return errorResponse(
          res,
          createError('NO_WHATSAPP', 'Nomor WhatsApp orang tua tidak tersedia'),
          400
        );
      }

      // Validate WhatsApp number
      if (!isValidWhatsAppNumber(monthlyReport.student.parentWhatsapp)) {
        return errorResponse(
          res,
          createError('INVALID_WHATSAPP', 'Format nomor WhatsApp tidak valid'),
          400
        );
      }

      // Generate message
      const subjectsSummary =
        monthlyReport.summary.subjectsCovered.length > 0
          ? monthlyReport.summary.subjectsCovered.join(', ')
          : 'Berbagai mata pelajaran';

      const avgScore = (
        (monthlyReport.summary.avgEnthusiasm +
          monthlyReport.summary.avgFocus +
          monthlyReport.summary.avgUnderstanding) /
        3
      ).toFixed(1);

      const progressSummary = `Rata-rata pencapaian ${avgScore}/5 dengan ${monthlyReport.summary.present} pertemuan hadir dari ${monthlyReport.summary.totalSessions} total pertemuan`;

      // Generate download URL - link to frontend download page with locked student & dates
      const frontendUrl = config.frontendUrl || 'https://rafika-s-class.vercel.app';
      
      // Build query string for frontend download page
      const queryParams = new URLSearchParams();
      queryParams.append('student', studentId.toString());
      
      if (validation.data.startDate && validation.data.endDate) {
        queryParams.append('start', validation.data.startDate);
        queryParams.append('end', validation.data.endDate);
      } else if (validation.data.month && validation.data.year) {
        // Convert month/year to date range
        const startOfMonth = new Date(validation.data.year, validation.data.month - 1, 1);
        const endOfMonth = new Date(validation.data.year, validation.data.month, 0);
        queryParams.append('start', startOfMonth.toISOString().split('T')[0]);
        queryParams.append('end', endOfMonth.toISOString().split('T')[0]);
      }
      
      const downloadUrl = `${frontendUrl}/download-pdf?${queryParams.toString()}`;

      const message = generateMonthlyReportWhatsAppMessage({
        studentName: monthlyReport.student.name,
        parentName: monthlyReport.student.parentName,
        period: monthlyReport.period.label,  // Use the formatted label
        totalSessions: monthlyReport.summary.totalSessions,
        subjectsSummary,
        progressSummary,
        downloadUrl,
      });

      const whatsappUrl = generateWhatsAppUrl(
        monthlyReport.student.parentWhatsapp,
        message
      );

      return successResponse(res, {
        whatsappUrl,
        message,
        parentWhatsapp: monthlyReport.student.parentWhatsapp,
      });
    } catch (error: any) {
      return errorResponse(res, createError('ERROR', error.message), 500);
    }
  });

  /**
   * Export monthly report as professional PDF
   */
  exportMonthlyPdf = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);

    if (isNaN(studentId)) {
      errorResponse(res, createError('INVALID_ID', 'Student ID tidak valid'), 400);
      return;
    }

    const validation = monthlyReportQuerySchema.safeParse(req.query);

    if (!validation.success) {
      errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Parameter tidak valid', validation.error.errors),
        400
      );
      return;
    }

    try {
      const monthlyReport = await reportService.getMonthlyReport({
        studentId,
        ...validation.data,  // Pass all validated data (month/year or startDate/endDate)
      });

      // Format data for PDF
      const pdfData = {
        student: {
          name: monthlyReport.student.name,
          grade: monthlyReport.student.grade,
          parentName: monthlyReport.student.parentName,
        },
        period: {
          label: monthlyReport.period.label,  // Use the formatted label
        },
        summary: {
          totalSessions: monthlyReport.summary.totalSessions,
          presentCount: monthlyReport.summary.present,
          avgEnthusiasm: monthlyReport.summary.avgEnthusiasm,
          avgFocus: monthlyReport.summary.avgFocus,
          avgUnderstanding: monthlyReport.summary.avgUnderstanding,
        },
        subjects: monthlyReport.summary.subjectsCovered,
        reports: monthlyReport.reports.map((r: any) => ({
          date: new Date(r.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          subject: r.subject,
          topic: r.topic,
          subject2: r.subject2,
          topic2: r.topic2,
          subject3: r.subject3,
          topic3: r.topic3,
          enthusiasmScore: r.enthusiasmScore,
          focusScore: r.focusScore,
          understandingScore: r.understandingScore,
          homework: r.homework,
          progressNotes: r.progressNotes,
          parentNotes: r.parentNotes,
        })),
      };

      await pdfService.generateMonthlyReport(pdfData, res);
    } catch (error: any) {
      errorResponse(res, createError('ERROR', error.message), 500);
    }
  });
}

export default new ReportController();
