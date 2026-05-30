import prisma from '../config/database';
import { StudentInput, StudentQueryParams } from '../types';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

export class StudentService {
  async getAllStudents(params: StudentQueryParams) {
    const { status, search, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { dailyReports: true },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data: students.map((student) => ({
        ...student,
        totalReports: student._count.dailyReports,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStudentById(id: number) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            dailyReports: true,
            schedules: true,
          },
        },
      },
    });

    if (!student) {
      throw new Error('Siswa tidak ditemukan');
    }

    return student;
  }

  async createStudent(data: StudentInput) {
    // Normalize WhatsApp number if provided
    const normalizedData = {
      ...data,
      parentWhatsapp: data.parentWhatsapp
        ? normalizeWhatsAppNumber(data.parentWhatsapp)
        : null,
    };

    const student = await prisma.student.create({
      data: normalizedData,
    });

    return student;
  }

  async updateStudent(id: number, data: Partial<StudentInput>) {
    // Check if student exists
    await this.getStudentById(id);

    // Normalize WhatsApp number if provided
    const normalizedData = {
      ...data,
      parentWhatsapp: data.parentWhatsapp
        ? normalizeWhatsAppNumber(data.parentWhatsapp)
        : undefined,
    };

    const student = await prisma.student.update({
      where: { id },
      data: normalizedData,
    });

    return student;
  }

  async deleteStudent(id: number) {
    // Check if student exists
    await this.getStudentById(id);

    await prisma.student.delete({
      where: { id },
    });

    return { message: 'Siswa berhasil dihapus' };
  }

  async getActiveStudentsForDropdown() {
    const students = await prisma.student.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        grade: true,
      },
      orderBy: { name: 'asc' },
    });

    return students;
  }
}

export default new StudentService();
