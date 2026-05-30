'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function TodayAgenda() {
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await dashboardApi.getTodaySchedule();
      setSchedule(data);
    } catch (error) {
      console.error('Failed to load today schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Calendar className="h-5 w-5" />
            Agenda Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-500">
            Memuat jadwal...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!schedule || schedule.totalSessions === 0) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Calendar className="h-5 w-5" />
            Agenda Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-green-700 font-semibold">Tidak Ada Jadwal Hari Ini</p>
            <p className="text-green-600 text-sm mt-1">
              Hari {schedule?.today || ''} - Waktu istirahat! 🎉
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { today, totalSessions, completedSessions, upcomingSessions, sessions } = schedule;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Calendar className="h-5 w-5" />
            Agenda Hari Ini - {today}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
              {completedSessions} selesai
            </span>
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
              {upcomingSessions} mendatang
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session: any, index: number) => (
            <div
              key={session.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200',
                session.status === 'completed'
                  ? 'border-green-200 bg-green-50/50 opacity-75'
                  : 'border-blue-200 bg-white hover:shadow-md'
              )}
            >
              <div className="flex-shrink-0">
                {session.status === 'completed' ? (
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {session.student.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {session.student.grade}
                  </span>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {session.startTime} - {session.endTime}
                </div>
              </div>

              {session.status === 'upcoming' && (
                <Link href="/laporan/tambah">
                  <Button size="sm" className="text-xs">
                    Mulai Sesi
                  </Button>
                </Link>
              )}

              {session.status === 'completed' && (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Selesai
                </span>
              )}
            </div>
          ))}
        </div>

        {upcomingSessions > 0 && (
          <div className="mt-4 p-4 bg-blue-100/50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">
                  {upcomingSessions} sesi menunggu!
                </p>
                <p className="text-blue-700 mt-1">
                  Jangan lupa input laporan setelah selesai mengajar
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
