'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { schedulesApi, studentsApi, handleApiError } from '@/lib/api';
import { Schedule, ScheduleFormData, Student } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/utils';

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    studentId: 0,
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isActive: true,
  });

  useEffect(() => {
    loadSchedules();
  }, [selectedDay]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const params = selectedDay ? { dayOfWeek: selectedDay } : {};
      const data = await schedulesApi.getAll(params);
      setSchedules(data);
    } catch (error) {
      alert('Gagal memuat jadwal: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getActive();
      setStudents(data);
    } catch (error) {
      alert('Gagal memuat siswa: ' + handleApiError(error));
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: 0,
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      isActive: true,
    });
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      alert('Mohon lengkapi siswa, hari, dan jam.');
      return;
    }

    try {
      setSaving(true);
      if (editId) {
        await schedulesApi.update(editId, formData);
      } else {
        await schedulesApi.create(formData);
      }
      await loadSchedules();
      resetForm();
    } catch (error) {
      alert('Gagal menyimpan jadwal: ' + handleApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setShowForm(true);
    setEditId(schedule.id);
    setFormData({
      studentId: schedule.studentId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isActive: schedule.isActive,
    });
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Hapus jadwal ini?')) {
      return;
    }

    try {
      await schedulesApi.delete(scheduleId);
      await loadSchedules();
    } catch (error) {
      alert('Gagal menghapus jadwal: ' + handleApiError(error));
    }
  };

  const groupedSchedules = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.dayOfWeek === day);
    return acc;
  }, {} as Record<string, Schedule[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jadwal Belajar</h1>
          <p className="text-gray-600 mt-1">Jadwal les private mingguan</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus size={20} className="mr-2" />
          {showForm ? 'Tutup Form' : 'Tambah Jadwal'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editId ? 'Edit Jadwal' : 'Tambah Jadwal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Siswa"
                required
                options={students.map((student) => ({
                  value: student.id,
                  label: `${student.name} (${student.grade})`,
                }))}
                value={formData.studentId || ''}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    studentId: Number(event.target.value),
                  }))
                }
              />
              <Select
                label="Hari"
                required
                options={DAYS_OF_WEEK.map((day) => ({ value: day, label: day }))}
                value={formData.dayOfWeek}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    dayOfWeek: event.target.value,
                  }))
                }
              />
              <Input
                label="Jam Mulai"
                type="time"
                required
                value={formData.startTime}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: event.target.value,
                  }))
                }
              />
              <Input
                label="Jam Selesai"
                type="time"
                required
                value={formData.endTime}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    endTime: event.target.value,
                  }))
                }
              />
              <Select
                label="Status"
                options={[
                  { value: 'true', label: 'Aktif' },
                  { value: 'false', label: 'Nonaktif' },
                ]}
                value={formData.isActive ? 'true' : 'false'}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: event.target.value === 'true',
                  }))
                }
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Jadwal'}
              </Button>
              {editId && (
                <Button variant="secondary" onClick={resetForm}>
                  Batal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedDay === '' ? 'primary' : 'secondary'}
              onClick={() => setSelectedDay('')}
            >
              Semua Hari
            </Button>
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day}
                size="sm"
                variant={selectedDay === day ? 'primary' : 'secondary'}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat jadwal...</p>
          </CardContent>
        </Card>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Belum ada jadwal</p>
            <Button className="mt-4">Tambah Jadwal Pertama</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(groupedSchedules).map(
            ([day, daySchedules]) =>
              daySchedules.length > 0 && (
                <Card key={day}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={20} className="text-blue-600" />
                      <CardTitle>{day}</CardTitle>
                      <Badge variant="info">{daySchedules.length} slot</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex flex-col gap-3 p-3 border rounded-lg hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium">{schedule.student?.name}</p>
                            <p className="text-sm text-gray-600">
                              {schedule.student?.grade}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 sm:justify-end">
                            <div className="text-left sm:text-right">
                              <p className="font-semibold text-blue-600">
                                {schedule.startTime} - {schedule.endTime}
                              </p>
                              <Badge
                                variant={schedule.isActive ? 'success' : 'default'}
                                className="mt-1"
                              >
                                {schedule.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="secondary" onClick={() => handleEdit(schedule)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => handleDelete(schedule.id)}>
                                Hapus
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
          )}
        </div>
      )}
    </div>
  );
}
