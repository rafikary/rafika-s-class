import prisma from '../config/database';
import { ScheduleInput, ScheduleQueryParams } from '../types';

export class ScheduleService {
  async getAllSchedules(params: ScheduleQueryParams) {
    const { studentId, dayOfWeek } = params;

    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (dayOfWeek) {
      where.dayOfWeek = dayOfWeek;
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return schedules;
  }

  async getScheduleById(id: number) {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new Error('Jadwal tidak ditemukan');
    }

    return schedule;
  }

  async createSchedule(data: ScheduleInput) {
    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new Error('Siswa tidak ditemukan');
    }

    const schedule = await prisma.schedule.create({
      data,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    return schedule;
  }

  async updateSchedule(id: number, data: Partial<ScheduleInput>) {
    // Check if schedule exists
    await this.getScheduleById(id);

    // If studentId is being updated, verify new student exists
    if (data.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: data.studentId },
      });

      if (!student) {
        throw new Error('Siswa tidak ditemukan');
      }
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    return schedule;
  }

  async deleteSchedule(id: number) {
    // Check if schedule exists
    await this.getScheduleById(id);

    await prisma.schedule.delete({
      where: { id },
    });

    return { message: 'Jadwal berhasil dihapus' };
  }
}

export default new ScheduleService();
