import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';

const router = Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// GET /api/dashboard/recent-reports - Get recent reports
router.get('/recent-reports', dashboardController.getRecentReports);

// GET /api/dashboard/notifications - Get reminders/notifications
router.get('/notifications', dashboardController.getNotifications);

// GET /api/dashboard/today-schedule - Get today's schedule
router.get('/today-schedule', dashboardController.getTodaySchedule);

// GET /api/dashboard/student-health - Get student health indicators
router.get('/student-health', dashboardController.getStudentHealth);

export default router;
