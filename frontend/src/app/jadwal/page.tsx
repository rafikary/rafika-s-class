'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { schedulesApi, handleApiError } from '@/lib/api';
import { Schedule } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/utils';

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    loadSchedules();
  }, [selectedDay]);

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
        <Button>
          <Plus size={20} className="mr-2" />
          Tambah Jadwal
        </Button>
      </div>

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
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{schedule.student?.name}</p>
                            <p className="text-sm text-gray-600">
                              {schedule.student?.grade}
                            </p>
                          </div>
                          <div className="text-right">
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
