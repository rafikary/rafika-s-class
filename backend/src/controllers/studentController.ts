import { Request, Response } from 'express';
import studentService from '../services/studentService';
import { successResponse, errorResponse, createError } from '../utils/response';
import { asyncHandler } from '../utils/errorHandler';
import {
  createStudentSchema,
  updateStudentSchema,
} from '../validators/schemas';

export class StudentController {
  getAllStudents = asyncHandler(async (req: Request, res: Response) => {
    const { status, search, page, limit } = req.query;

    const params = {
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    };

    const result = await studentService.getAllStudents(params);
    return successResponse(res, result.data, undefined, 200);
  });

  getStudentById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, createError('INVALID_ID', 'ID tidak valid'), 400);
    }

    try {
      const student = await studentService.getStudentById(id);
      return successResponse(res, student);
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });

  createStudent = asyncHandler(async (req: Request, res: Response) => {
    const validation = createStudentSchema.safeParse(req.body);

    if (!validation.success) {
      return errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Data tidak valid', validation.error.errors),
        400
      );
    }

    const student = await studentService.createStudent(validation.data);
    return successResponse(res, student, 'Siswa berhasil ditambahkan', 201);
  });

  updateStudent = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, createError('INVALID_ID', 'ID tidak valid'), 400);
    }

    const validation = updateStudentSchema.safeParse(req.body);

    if (!validation.success) {
      return errorResponse(
        res,
        createError('VALIDATION_ERROR', 'Data tidak valid', validation.error.errors),
        400
      );
    }

    try {
      const student = await studentService.updateStudent(id, validation.data);
      return successResponse(res, student, 'Siswa berhasil diupdate');
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });

  deleteStudent = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, createError('INVALID_ID', 'ID tidak valid'), 400);
    }

    try {
      const result = await studentService.deleteStudent(id);
      return successResponse(res, null, result.message);
    } catch (error: any) {
      return errorResponse(res, createError('NOT_FOUND', error.message), 404);
    }
  });

  getActiveStudents = asyncHandler(async (_req: Request, res: Response) => {
    const students = await studentService.getActiveStudentsForDropdown();
    return successResponse(res, students);
  });
}

export default new StudentController();
