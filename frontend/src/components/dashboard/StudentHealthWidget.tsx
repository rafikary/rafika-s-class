'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function StudentHealthWidget() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentHealth();
  }, []);

  const loadStudentHealth = async () => {
    try {
      const data = await dashboardApi.getStudentHealth();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load student health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status Kesehatan Siswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-500">
            Menganalisis data siswa...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'attention':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'risk':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return '🟢';
      case 'attention':
        return '🟡';
      case 'risk':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getHealthLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Sangat Baik';
      case 'good':
        return 'Baik';
      case 'attention':
        return 'Perlu Perhatian';
      case 'risk':
        return 'Berisiko';
      default:
        return 'Unknown';
    }
  };

  // Sort: worst first (need attention)
  const sortedStudents = [...students].sort((a, b) => a.score - b.score);

  // Show top 5 or all if less than 5
  const displayStudents = sortedStudents.slice(0, 5);

  const excellentCount = students.filter(s => s.status === 'excellent').length;
  const goodCount = students.filter(s => s.status === 'good').length;
  const attentionCount = students.filter(s => s.status === 'attention').length;
  const riskCount = students.filter(s => s.status === 'risk').length;

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Users className="h-5 w-5" />
            Status Kesehatan Siswa
          </CardTitle>
          <div className="flex gap-2 text-xs">
            {riskCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                🔴 {riskCount}
              </span>
            )}
            {attentionCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                🟡 {attentionCount}
              </span>
            )}
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
              🟢 {excellentCount + goodCount}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>Belum ada data siswa</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayStudents.map((student) => (
                <Link
                  key={student.studentId}
                  href={`/siswa/${student.studentId}`}
                  className="block"
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                      getHealthColor(student.status)
                    )}
                  >
                    <div className="text-2xl flex-shrink-0">
                      {getHealthIcon(student.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {student.studentName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {student.grade}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                        <span>{student.attendanceRate}% hadir</span>
                        <span>⭐ {student.avgRating}</span>
                        {student.unpaidCount > 0 && (
                          <span className="text-orange-600 font-medium">
                            {student.unpaidCount} belum bayar
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white">
                        {student.score}/100
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {students.length > 5 && (
              <Link href="/siswa">
                <button className="w-full mt-4 py-2 text-sm text-purple-700 hover:text-purple-900 font-medium transition-colors">
                  Lihat Semua Siswa ({students.length}) →
                </button>
              </Link>
            )}

            {(riskCount > 0 || attentionCount > 0) && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-orange-900">
                      {riskCount + attentionCount} siswa perlu perhatian khusus
                    </p>
                    <p className="text-orange-700 mt-1">
                      Cek kehadiran, pembayaran, dan performa mereka
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
