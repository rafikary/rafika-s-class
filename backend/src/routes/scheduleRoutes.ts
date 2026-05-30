import { Router } from 'express';
import scheduleController from '../controllers/scheduleController';

const router = Router();

// GET /api/schedules - Get all schedules
router.get('/', scheduleController.getAllSchedules);

// GET /api/schedules/:id - Get schedule by ID
router.get('/:id', scheduleController.getScheduleById);

// POST /api/schedules - Create new schedule
router.post('/', scheduleController.createSchedule);

// PUT /api/schedules/:id - Update schedule
router.put('/:id', scheduleController.updateSchedule);

// DELETE /api/schedules/:id - Delete schedule
router.delete('/:id', scheduleController.deleteSchedule);

export default router;
