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
          <p className="mt-4 text-gray-600">Memuat laporan keuangan...</p>
        </div>
      </div>
    );
  }

  if (!financial) {
    return <div>Tidak ada data</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
        <p className="text-gray-600 mt-1">Kelola pendapatan dan pembayaran dari siswa</p>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Sudah Diambil
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
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

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Belum Dibayar
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
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

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Pendapatan
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
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

      {/* Breakdown Per Siswa */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Breakdown Per Siswa</CardTitle>
            {selectedReports.length > 0 && (
              <Button onClick={handleMarkMultipleAsPaid}>
                Tandai {selectedReports.length} Laporan Sebagai Sudah Dibayar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {financial.breakdown.map((student: any) => (
              <div key={student.studentId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{student.studentName}</h3>
                    <p className="text-sm text-gray-600">{student.studentGrade} • Tarif: Rp {student.tarif.toLocaleString('id-ID')}/sesi</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-700">
                      Rp {student.totalRevenue.toLocaleString('id-ID')}
                    </div>
                    <p className="text-xs text-gray-600">{student.totalSessions} sesi</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-700 font-medium">Sudah Dibayar</p>
                    <p className="text-lg font-bold text-green-700">
                      Rp {student.totalPaid.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-green-600">{student.paidSessions} sesi</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-700 font-medium">Belum Dibayar</p>
                    <p className="text-lg font-bold text-orange-700">
                      Rp {student.totalUnpaid.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-orange-600">{student.unpaidSessions} sesi</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-700 font-medium">Total Sesi</p>
                    <p className="text-lg font-bold text-gray-700">{student.totalSessions}</p>
                    <p className="text-xs text-gray-600">pertemuan</p>
                  </div>
                </div>

                {/* Detail Reports */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Detail Pertemuan:</p>
                  {student.reports.map((report: any) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report.id)}
                          onChange={() => toggleSelectReport(report.id)}
                          disabled={report.paymentStatus === 'paid'}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(report.date)} - {report.subject}
                          </p>
                          <p className="text-xs text-gray-600">
                            Rp {report.amount.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div>
                        {report.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle size={14} />
                            Sudah Dibayar
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsPaid(report.id)}
                          >
                            Tandai Dibayar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
