'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, FileText, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { NotificationsWidget } from '@/components/dashboard/NotificationsWidget';
import { dashboardApi } from '@/lib/api';
import { DailyReport } from '@/types';
import { formatDateShort, cn } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalReports: 0,
    reportsThisMonth: 0,
    incomeThisMonth: 0,
  });
  const [incomeBreakdown, setIncomeBreakdown] = useState<any[]>([]);
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

      setIncomeBreakdown(statsData.incomeBreakdown || []);

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
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base md:text-lg">Ringkasan data les private</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Total Siswa
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/30">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {stats.totalStudents}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              {stats.activeStudents} aktif
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Laporan Bulan Ini
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.reportsThisMonth}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">pertemuan</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-700">
              Pendapatan Bulan Ini
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-700 break-words">
              Rp {stats.incomeThisMonth.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] sm:text-xs text-green-600 mt-1">dari absensi hadir</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Total Laporan
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/30">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {stats.totalReports}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">sepanjang waktu</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications & Reminders - OTOMATIS! */}
      <NotificationsWidget />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/siswa/tambah"
              className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-200 hover:shadow-xl hover:shadow-blue-200/50"
            >
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Tambah Siswa</h3>
                <p className="text-xs sm:text-sm text-slate-500">Daftarkan siswa baru</p>
              </div>
            </Link>

            <Link
              href="/laporan/tambah"
              className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-200 hover:shadow-xl hover:shadow-green-200/50"
            >
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Input Laporan</h3>
                <p className="text-xs sm:text-sm text-slate-500">Catat laporan harian</p>
              </div>
            </Link>

            <Link
              href="/laporan/bulanan"
              className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-200 hover:shadow-xl hover:shadow-purple-200/50"
            >
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Laporan Bulanan</h3>
                <p className="text-xs sm:text-sm text-slate-500">Lihat & export</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Income Breakdown */}
      {incomeBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base md:text-lg">Breakdown Pendapatan Per Siswa</CardTitle>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Bulan ini dari absensi hadir</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">
                        Nama Siswa
                      </th>
                      <th className="text-center py-3 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">
                        Tarif/Sesi
                      </th>
                      <th className="text-center py-3 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">
                        Jumlah Hadir
                      </th>
                      <th className="text-right py-3 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">
                        Total Pendapatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeBreakdown.map((item, index) => (
                      <tr 
                        key={item.studentId} 
                        className={cn(
                          "border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors",
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        )}
                      >
                        <td className="py-3 px-2 sm:py-4 sm:px-4">
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {item.studentName}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-center text-slate-700 text-xs sm:text-sm">
                          <span className="hidden sm:inline">Rp </span>{item.tarif.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30">
                            {item.sessionsCount}x
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-right">
                          <span className="font-bold text-green-700 text-sm sm:text-base md:text-lg">
                            <span className="hidden sm:inline">Rp </span>{item.totalIncome.toLocaleString('id-ID')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gradient-to-r from-green-100 to-emerald-100 border-t-2 border-green-300">
                      <td colSpan={3} className="py-3 px-2 sm:py-4 sm:px-4 text-right font-bold text-slate-900 text-xs sm:text-sm md:text-base lg:text-lg">
                        Total:
                      </td>
                      <td className="py-3 px-2 sm:py-4 sm:px-4 text-right">
                        <span className="font-bold text-lg sm:text-xl md:text-2xl text-green-700">
                          <span className="hidden sm:inline">Rp </span>{stats.incomeThisMonth.toLocaleString('id-ID')}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Laporan Terbaru</CardTitle>
              <p className="text-sm text-slate-500 mt-1">5 laporan terakhir yang diinput</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Belum ada laporan</p>
              <p className="text-sm text-slate-400 mt-1">Mulai input laporan harian siswa</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="group flex items-center justify-between p-5 rounded-2xl border-2 border-slate-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-200/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
                        {report.student?.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{report.student?.name}</h4>
                        <p className="text-sm text-slate-600">{report.subject} - {report.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDateShort(report.date)}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{report.startTime}</span>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1.5 font-medium">Semangat</p>
                      <StarRating rating={report.enthusiasmScore} readOnly size={18} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1.5 font-medium">Fokus</p>
                      <StarRating rating={report.focusScore} readOnly size={18} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1.5 font-medium">Paham</p>
                      <StarRating rating={report.understandingScore} readOnly size={18} />
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
