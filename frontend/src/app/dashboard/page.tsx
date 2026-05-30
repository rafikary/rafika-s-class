'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, FileText, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { DailyReport } from '@/types';
import { formatDateShort } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalReports: 0,
    reportsThisMonth: 0,
    incomeThisMonth: 0,
  });
  const [recentReports, setRecentReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load dashboard stats from new API
      const statsData = await dashboardApi.getStats();
      const recent = await dashboardApi.getRecentReports(5);

      setStats({
        totalStudents: statsData.totalStudents,
        activeStudents: statsData.activeStudents,
        totalReports: statsData.totalReports,
        reportsThisMonth: statsData.reportsThisMonth,
        incomeThisMonth: statsData.incomeThisMonth,
      });

      setRecentReports(recent);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Ringkasan data les private</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Siswa
            </CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeStudents} aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Laporan Bulan Ini
            </CardTitle>
            <FileText className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.reportsThisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">pertemuan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Pendapatan Bulan Ini
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              Rp {stats.incomeThisMonth.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-green-600 mt-1">dari absensi hadir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Laporan
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-gray-500 mt-1">sepanjang waktu</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/siswa/tambah"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Tambah Siswa</h3>
                <p className="text-sm text-gray-500">Daftarkan siswa baru</p>
              </div>
            </Link>

            <Link
              href="/laporan/tambah"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-green-100">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Input Laporan</h3>
                <p className="text-sm text-gray-500">Catat laporan harian</p>
              </div>
            </Link>

            <Link
              href="/laporan/bulanan"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Laporan Bulanan</h3>
                <p className="text-sm text-gray-500">Lihat & export</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada laporan</p>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{report.student?.name}</h4>
                    <p className="text-sm text-gray-600">{report.subject} - {report.topic}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateShort(report.date)} • {report.startTime}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Semangat</p>
                      <p className="text-lg font-bold text-blue-600">{report.enthusiasmScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Fokus</p>
                      <p className="text-lg font-bold text-green-600">{report.focusScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Paham</p>
                      <p className="text-lg font-bold text-purple-600">{report.understandingScore}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
