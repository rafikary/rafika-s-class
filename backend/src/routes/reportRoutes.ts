import { Router } from 'express';
import reportController from '../controllers/reportController';

const router = Router();

// GET /api/reports - Get all daily reports
router.get('/', reportController.getAllReports);

// GET /api/reports/monthly/:studentId - Get monthly report
router.get('/monthly/:studentId', reportController.getMonthlyReport);

// GET /api/reports/export/excel/:studentId - Export to Excel
router.get('/export/excel/:studentId', reportController.exportMonthlyExcel);

// GET /api/reports/export/pdf/:studentId - Export to PDF (NEW!)
router.get('/export/pdf/:studentId', reportController.exportMonthlyPdf);

// GET /api/reports/whatsapp/:studentId - Get WhatsApp link with message
router.get('/whatsapp/:studentId', reportController.getWhatsAppLink);

// GET /api/reports/:id - Get report by ID
router.get('/:id', reportController.getReportById);

// POST /api/reports - Create new report
router.post('/', reportController.createReport);

// PUT /api/reports/:id - Update report
router.put('/:id', reportController.updateReport);

// DELETE /api/reports/:id - Delete report
router.delete('/:id', reportController.deleteReport);

export default router;
