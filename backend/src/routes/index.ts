import { Router } from 'express';
import studentRoutes from './studentRoutes';
import scheduleRoutes from './scheduleRoutes';
import reportRoutes from './reportRoutes';
import dashboardRoutes from './dashboardRoutes';
import financialRoutes from './financialRoutes';
import salaryRoutes from './salaryRoutes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/students', studentRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/financial', financialRoutes);
router.use('/salaries', salaryRoutes);

export default router;
