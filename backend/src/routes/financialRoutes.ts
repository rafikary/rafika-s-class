import { Router } from 'express';
import financialController from '../controllers/financialController';

const router = Router();

// GET /api/financial/report - Get financial report with breakdown
router.get('/report', financialController.getFinancialReport);

// PUT /api/financial/:id/payment-status - Update payment status of a report
router.put('/:id/payment-status', financialController.updatePaymentStatus);

// POST /api/financial/mark-paid - Mark multiple reports as paid
router.post('/mark-paid', financialController.markMultipleAsPaid);

export default router;
