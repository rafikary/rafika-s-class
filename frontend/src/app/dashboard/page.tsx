'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { cn } from '@/lib/utils';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load dashboard stats from new API
      const statsData = await dashboardApi.getStats();

      setStats({
        totalStudents: statsData.totalStudents,
        activeStudents: statsData.activeStudents,
        totalReports: statsData.totalReports,
        reportsThisMonth: statsData.reportsThisMonth,
        incomeThisMonth: statsData.incomeThisMonth,
      });

      setIncomeBreakdown(statsData.incomeBreakdown || []);
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base md:text-lg">Ringkasan data les private</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-700 flex-1 truncate">
              Total Siswa
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {stats.totalStudents}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              {stats.activeStudents} aktif
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-700 flex-1 truncate">
              Laporan Bulan Ini
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {stats.reportsThisMonth}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">pertemuan</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 border-emerald-200/60 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700 flex-1 truncate">
              Pendapatan Bulan Ini
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30 flex-shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-emerald-700 break-words">
              Rp {stats.incomeThisMonth.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-600 mt-1">dari absensi hadir</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-700 flex-1 truncate">
              Total Laporan
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30 flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {stats.totalReports}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">sepanjang waktu</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/siswa/tambah"
              className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 hover:shadow-xl hover:shadow-blue-200/50"
            >
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Tambah Siswa</h3>
                <p className="text-xs sm:text-sm text-slate-500">Daftarkan siswa baru</p>
              </div>
            </Link>

            <Link
              href="/laporan/tambah"
              className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-200/50"
            >
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Input Laporan</h3>
                <p className="text-xs sm:text-sm text-slate-500">Catat laporan harian</p>
              </div>
            </Link>

            <Link
              href="/laporan/bulanan"
              className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200/50"
            >
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Laporan Bulanan</h3>
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
              <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30">
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
                          "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        )}
                      >
                        <td className="py-3 px-2 sm:py-4 sm:px-4">
                          <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                            {item.studentName}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-center text-slate-600 text-xs sm:text-sm">
                          <span className="hidden sm:inline">Rp </span>{item.tarif.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                            {item.sessionsCount}x
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-right">
                          <span className="font-bold text-emerald-700 text-sm sm:text-base md:text-lg">
                            <span className="hidden sm:inline">Rp </span>{item.totalIncome.toLocaleString('id-ID')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gradient-to-r from-emerald-50 to-green-50 border-t-2 border-emerald-200">
                      <td colSpan={3} className="py-3 px-2 sm:py-4 sm:px-4 text-right font-bold text-slate-700 text-xs sm:text-sm md:text-base lg:text-lg">
                        Total:
                      </td>
                      <td className="py-3 px-2 sm:py-4 sm:px-4 text-right">
                        <span className="font-bold text-lg sm:text-xl md:text-2xl text-emerald-700">
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
    </div>
  );
}
