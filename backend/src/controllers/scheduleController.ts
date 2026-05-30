import { Request, Response } from 'express';
import scheduleService from '../services/scheduleService';
import { successResponse, errorResponse, createError } from '../utils/response';
import { asyncHandler } from '../utils/errorHandler';
import {
  createScheduleSchema,
  updateScheduleSchema,
} from '../validators/schemas';

export class ScheduleController {
  getAllSchedules = asyncHandler(async (req: Request, res: Response) => {
    const { studentId, dayOfWeek } = req.query;

    const params = {
      studentId: studentId ? parseInt(studentId as string) : undefined,
      dayOfWeek: dayOfWeek as string,
    };

    const schedules = await scheduleService.getAllSchedules(params);
    return successResponse(res, schedules);
  });

  getScheduleById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, createError('INVALID_ID', 'ID tidak valid'), 400);
    }

    try {
      const schedule = await scheduleService.getScheduleById(id);
      return successResponse(res, schedule);
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });

  createSchedule = asyncHandler(async (req: Request, res: Response) => {
    const validation = createScheduleSchema.safeParse(req.body);

    if (!validation.success) {
      return errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Data tidak valid', validation.error.errors),
        400
      );
    }

    try {
      const schedule = await scheduleService.createSchedule(validation.data);
      return successResponse(res, schedule, 'Jadwal berhasil ditambahkan', 201);
    } catch (error: any) {
      return errorResponse(res, createError('ERROR', error.message), 400);
    }
  });

  updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, createError('INVALID_ID', 'ID tidak valid'), 400);
    }

    const validation = updateScheduleSchema.safeParse(req.body);

    if (!validation.success) {
      return errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Data tidak valid', validation.error.errors),
        400
      );
    }

    try {
      const schedule = await scheduleService.updateSchedule(id, validation.data);
      return successResponse(res, schedule, 'Jadwal berhasil diupdate');
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });

  deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, createError('INVALID_ID', 'ID tidak valid'), 400);
    }

    try {
      const result = await scheduleService.deleteSchedule(id);
      return successResponse(res, null, result.message);
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });
}

export default new ScheduleController();
