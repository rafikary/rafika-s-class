'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { financialApi, handleApiError } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function LaporanKeuanganPage() {
  const [financial, setFinancial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedReports, setSelectedReports] = useState<number[]>([]);

  useEffect(() => {
    loadFinancialReport();
  }, [selectedMonth, selectedYear]);

  const loadFinancialReport = async () => {
    try {
      setLoading(true);
      const data = await financialApi.getReport({
        month: selectedMonth,
        year: selectedYear,
      });
      setFinancial(data);
    } catch (error) {
      alert('Gagal memuat laporan keuangan: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (reportId: number) => {
    try {
      await financialApi.updatePaymentStatus(reportId, 'paid');
      alert('Status pembayaran berhasil diupdate!');
      loadFinancialReport();
    } catch (error) {
      alert('Gagal update status: ' + handleApiError(error));
    }
  };

  const handleMarkMultipleAsPaid = async () => {
    if (selectedReports.length === 0) {
      alert('Pilih laporan yang ingin ditandai sebagai sudah dibayar');
      return;
    }

    try {
      await financialApi.markMultipleAsPaid(selectedReports);
      alert(`${selectedReports.length} laporan berhasil ditandai sebagai sudah dibayar!`);
      setSelectedReports([]);
      loadFinancialReport();
    } catch (error) {
      alert('Gagal update status: ' + handleApiError(error));
    }
  };

  const handleMarkStudentAsPaid = async (studentId: number) => {
    const student = financial.breakdown.find((s: any) => s.studentId === studentId);
    if (!student) return;

    const unpaidReportIds = student.reports
      .filter((r: any) => r.paymentStatus === 'unpaid')
      .map((r: any) => r.id);

    if (unpaidReportIds.length === 0) {
      alert('Semua laporan siswa ini sudah dibayar');
      return;
    }

    try {
      await financialApi.markMultipleAsPaid(unpaidReportIds);
      alert(`${unpaidReportIds.length} laporan ${student.studentName} berhasil ditandai lunas!`);
      loadFinancialReport();
    } catch (error) {
      alert('Gagal update status: ' + handleApiError(error));
    }
  };

  const toggleSelectReport = (reportId: number) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat laporan keuangan...</p>
        </div>
      </div>
    );
  }

  if (!financial) {
    return <div>Tidak ada data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Laporan Keuangan
          </h1>
          <p className="text-slate-600 mt-2 text-base sm:text-lg">Kelola pendapatan dan pembayaran dari siswa</p>
        </div>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {[2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group hover:scale-[1.02] transition-transform duration-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Sudah Diambil
            </CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              Rp {financial.summary.totalPaid.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {financial.summary.paidSessions} sesi
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Belum Dibayar
            </CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/30">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">
              Rp {financial.summary.totalUnpaid.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {financial.summary.unpaidSessions} sesi
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-transform duration-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Pendapatan
            </CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              Rp {financial.summary.totalRevenue.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {financial.summary.totalSessions} sesi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Per Siswa - 2 Column Layout */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Breakdown Per Siswa</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Detail pembayaran setiap siswa</p>
            </div>
            {selectedReports.length > 0 && (
              <Button onClick={handleMarkMultipleAsPaid}>
                <CheckCircle size={18} className="mr-2" />
                Tandai {selectedReports.length} Laporan Sebagai Lunas
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {financial.breakdown.map((student: any) => (
              <div key={student.studentId} className="border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                {/* Student Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                      {student.studentName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{student.studentName}</h3>
                      <p className="text-sm text-slate-600">{student.studentGrade}</p>
                    </div>
                  </div>
                  {student.unpaidSessions > 0 && (
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => handleMarkStudentAsPaid(student.studentId)}
                      className="text-xs"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Lunas Semua
                    </Button>
                  )}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                    <p className="text-xs text-green-700 font-medium mb-1">Sudah Dibayar</p>
                    <p className="text-lg font-bold text-green-700">
                      Rp {student.totalPaid.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-green-600">{student.paidSessions} sesi</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-xl border border-orange-200">
                    <p className="text-xs text-orange-700 font-medium mb-1">Belum Dibayar</p>
                    <p className="text-lg font-bold text-orange-700">
                      Rp {student.totalUnpaid.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-orange-600">{student.unpaidSessions} sesi</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl border border-blue-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Total Pendapatan</p>
                      <p className="text-xl font-bold text-blue-700">
                        Rp {student.totalRevenue.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600">Tarif/Sesi</p>
                      <p className="text-sm font-semibold text-slate-700">Rp {student.tarif.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>

                {/* Detail Reports - Compact */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Detail Pertemuan ({student.totalSessions}):</p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {student.reports.map((report: any) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 p-3 rounded-xl transition-colors border border-slate-200"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedReports.includes(report.id)}
                            onChange={() => toggleSelectReport(report.id)}
                            disabled={report.paymentStatus === 'paid'}
                            className="w-4 h-4 rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {formatDate(report.date)} -
                              {[
                                report.subject,
                                report.subject2,
                                report.subject3,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                            <p className="text-xs font-semibold text-blue-600">
                              Rp {report.amount.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div>
                          {report.paymentStatus === 'paid' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                              <CheckCircle size={12} />
                              Lunas
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsPaid(report.id)}
                              className="text-xs h-7"
                            >
                              Bayar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
