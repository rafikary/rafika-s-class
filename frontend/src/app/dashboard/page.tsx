'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { NotificationsWidget } from '@/components/dashboard/NotificationsWidget';
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#C4A5D8]/10 to-[#D4A5C3]/10 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#8B7A99] via-[#C4A5D8] to-[#D4A5C3] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-[#6B5B73] mt-2 text-sm sm:text-base md:text-lg">Ringkasan data les private</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#6B5B73]">
              Total Siswa
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-[#9EB6C7] to-[#C4A5D8] rounded-xl shadow-lg shadow-[#9EB6C7]/30">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#9EB6C7] to-[#C4A5D8] bg-clip-text text-transparent">
              {stats.totalStudents}
            </div>
            <p className="text-[10px] sm:text-xs text-[#8B7A99] mt-1">
              {stats.activeStudents} aktif
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#6B5B73]">
              Laporan Bulan Ini
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-[#C4A5D8] to-[#D4A5C3] rounded-xl shadow-lg shadow-[#C4A5D8]/30">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#C4A5D8] to-[#D4A5C3] bg-clip-text text-transparent">
              {stats.reportsThisMonth}
            </div>
            <p className="text-[10px] sm:text-xs text-[#8B7A99] mt-1">pertemuan</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200 bg-gradient-to-br from-[#E8F5E6] via-[#F0F9EF] to-[#E8F5E6] border-[#A8D5A3]/30 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#5A8557]">
              Pendapatan Bulan Ini
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-[#7FB77A] to-[#A8D5A3] rounded-xl shadow-lg shadow-[#7FB77A]/30">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#5A8557] break-words">
              Rp {stats.incomeThisMonth.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] sm:text-xs text-[#7FB77A] mt-1">dari absensi hadir</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#6B5B73]">
              Total Laporan
            </CardTitle>
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-[#E5B8A0] to-[#D4A088] rounded-xl shadow-lg shadow-[#E5B8A0]/30">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#E5B8A0] to-[#D4A088] bg-clip-text text-transparent">
              {stats.totalReports}
            </div>
            <p className="text-[10px] sm:text-xs text-[#8B7A99] mt-1">sepanjang waktu</p>
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
              className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-[#C4A5D8]/20 hover:border-[#9EB6C7] hover:bg-gradient-to-br hover:from-[#F5F1F8] hover:to-[#FAF8FC] transition-all duration-200 hover:shadow-xl hover:shadow-[#9EB6C7]/20"
            >
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-[#9EB6C7] to-[#C4A5D8] shadow-lg shadow-[#9EB6C7]/30 group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#6B5B73] text-sm sm:text-base">Tambah Siswa</h3>
                <p className="text-xs sm:text-sm text-[#8B7A99]">Daftarkan siswa baru</p>
              </div>
            </Link>

            <Link
              href="/laporan/tambah"
              className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-[#A8D5A3]/20 hover:border-[#7FB77A] hover:bg-gradient-to-br hover:from-[#E8F5E6] hover:to-[#F0F9EF] transition-all duration-200 hover:shadow-xl hover:shadow-[#7FB77A]/20"
            >
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-[#7FB77A] to-[#A8D5A3] shadow-lg shadow-[#7FB77A]/30 group-hover:scale-110 transition-transform">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#6B5B73] text-sm sm:text-base">Input Laporan</h3>
                <p className="text-xs sm:text-sm text-[#8B7A99]">Catat laporan harian</p>
              </div>
            </Link>

            <Link
              href="/laporan/bulanan"
              className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-[#D4A5C3]/20 hover:border-[#C4A5D8] hover:bg-gradient-to-br hover:from-[#F5F1F8] hover:to-[#FAF8FC] transition-all duration-200 hover:shadow-xl hover:shadow-[#C4A5D8]/20"
            >
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-[#C4A5D8] to-[#D4A5C3] shadow-lg shadow-[#C4A5D8]/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#6B5B73] text-sm sm:text-base">Laporan Bulanan</h3>
                <p className="text-xs sm:text-sm text-[#8B7A99]">Lihat & export</p>
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
              <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-[#7FB77A] to-[#A8D5A3] rounded-xl shadow-lg shadow-[#7FB77A]/30">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base md:text-lg">Breakdown Pendapatan Per Siswa</CardTitle>
                <p className="text-xs sm:text-sm text-[#8B7A99] mt-1">Bulan ini dari absensi hadir</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b-2 border-[#C4A5D8]/30">
                      <th className="text-left py-3 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm font-semibold text-[#6B5B73]">
                        Nama Siswa
                      </th>
                      <th className="text-center py-3 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm font-semibold text-[#6B5B73]">
                        Tarif/Sesi
                      </th>
                      <th className="text-center py-3 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm font-semibold text-[#6B5B73]">
                        Jumlah Hadir
                      </th>
                      <th className="text-right py-3 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm font-semibold text-[#6B5B73]">
                        Total Pendapatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeBreakdown.map((item, index) => (
                      <tr 
                        key={item.studentId} 
                        className={cn(
                          "border-b border-[#C4A5D8]/10 hover:bg-gradient-to-r hover:from-[#F5F1F8] hover:to-[#FAF8FC] transition-colors",
                          index % 2 === 0 ? "bg-white" : "bg-[#FAF8FC]"
                        )}
                      >
                        <td className="py-3 px-2 sm:py-4 sm:px-4">
                          <span className="font-semibold text-[#6B5B73] text-xs sm:text-sm">
                            {item.studentName}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-center text-[#8B7A99] text-xs sm:text-sm">
                          <span className="hidden sm:inline">Rp </span>{item.tarif.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#9EB6C7] to-[#C4A5D8] text-white shadow-lg shadow-[#9EB6C7]/30">
                            {item.sessionsCount}x
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-right">
                          <span className="font-bold text-[#5A8557] text-sm sm:text-base md:text-lg">
                            <span className="hidden sm:inline">Rp </span>{item.totalIncome.toLocaleString('id-ID')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gradient-to-r from-[#E8F5E6] to-[#F0F9EF] border-t-2 border-[#A8D5A3]">
                      <td colSpan={3} className="py-3 px-2 sm:py-4 sm:px-4 text-right font-bold text-[#6B5B73] text-xs sm:text-sm md:text-base lg:text-lg">
                        Total:
                      </td>
                      <td className="py-3 px-2 sm:py-4 sm:px-4 text-right">
                        <span className="font-bold text-lg sm:text-xl md:text-2xl text-[#5A8557]">
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
