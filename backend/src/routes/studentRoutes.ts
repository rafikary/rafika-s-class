import { Router } from 'express';
import studentController from '../controllers/studentController';

const router = Router();

// GET /api/students - Get all students
router.get('/', studentController.getAllStudents);

// GET /api/students/active - Get active students for dropdown
router.get('/active', studentController.getActiveStudents);

// GET /api/students/:id - Get student by ID
router.get('/:id', studentController.getStudentById);

// POST /api/students - Create new student
router.post('/', studentController.createStudent);

// PUT /api/students/:id - Update student
router.put('/:id', studentController.updateStudent);

// DELETE /api/students/:id - Delete student
router.delete('/:id', studentController.deleteStudent);

export default router;
