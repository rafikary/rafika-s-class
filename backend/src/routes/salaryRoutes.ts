import { Router } from 'express';
import salaryController from '../controllers/salaryController';

const router = Router();

// Get all salary records with filters
router.get('/records', salaryController.getRecords);

// Generate monthly salaries
router.post('/generate-monthly', salaryController.generateMonthly);

// Mark salary as paid
router.patch('/:id/mark-paid', salaryController.markAsPaid);

// Get total unpaid salary
router.get('/unpaid', salaryController.getUnpaid);

// Get salary summary
router.get('/summary', salaryController.getSummary);

export default router;
