'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, Download } from 'lucide-react';
import { salaryApi } from '@/lib/api';
import { formatDateShort, cn } from '@/lib/utils';

export default function GajianPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [unpaid, setUnpaid] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState<'all' | 'per_10_meetings' | 'monthly'>('all');

  useEffect(() => {
    loadData();
  }, [selectedYear, filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [summaryData, unpaidData, recordsData] = await Promise.all([
        salaryApi.getSummary(selectedYear),
        salaryApi.getUnpaid(),
        salaryApi.getRecords({
          periodType: filter === 'all' ? undefined : filter,
        }),
      ]);

      setSummary(summaryData);
      setUnpaid(unpaidData);
      setRecords(recordsData);
    } catch (error) {
      console.error('Failed to load salary data:', error);
      alert('Gagal memuat data gaji');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (salaryRecordId: number) => {
    if (!confirm('Tandai gaji ini sebagai sudah diterima?')) return;

    try {
      await salaryApi.markAsPaid(salaryRecordId);
      alert('Berhasil! Gaji ditandai sudah diterima');
      loadData();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      alert('Gagal menandai gaji');
    }
  };

  const handleGenerateMonthly = async () => {
    if (!confirm('Generate salary record untuk bulan kemarin?')) return;

    try {
      setLoading(true);
      await salaryApi.generateMonthly();
      alert('Berhasil generate monthly salary!');
      loadData();
    } catch (error) {
      console.error('Failed to generate monthly salary:', error);
      alert('Gagal generate salary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data gaji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              💰 Gajian
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Tracking gaji per 10x pertemuan & bulanan
            </p>
          </div>
          <Button onClick={handleGenerateMonthly} variant="secondary">
            <Calendar className="h-4 w-4 mr-2" />
            Generate Gaji Bulan Lalu
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Total Gaji {selectedYear}
            </CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              Rp {summary?.total?.toLocaleString('id-ID') || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {summary?.recordCount || 0} record
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Sudah Diterima
            </CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              Rp {summary?.totalPaid?.toLocaleString('id-ID') || 0}
            </div>
            <p className="text-xs text-blue-600 mt-1">gaji terbayar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Belum Diterima
            </CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <XCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">
              Rp {summary?.totalUnpaid?.toLocaleString('id-ID') || 0}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {unpaid?.totalRecords || 0} record menunggu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Riwayat Gaji</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('per_10_meetings')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filter === 'per_10_meetings'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                10x Pertemuan
              </button>
              <button
                onClick={() => setFilter('monthly')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filter === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Bulanan
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Belum ada riwayat gaji</p>
              <p className="text-sm mt-1">Gaji otomatis di-generate tiap 10x pertemuan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                      Siswa
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">
                      Periode
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">
                      Tanggal
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">
                      Pertemuan
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">
                      Jumlah
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={record.id}
                      className={cn(
                        'border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors',
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      )}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-semibold text-slate-900">
                            {record.student.name}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            {record.student.grade}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={cn(
                            'inline-flex px-3 py-1 rounded-full text-xs font-semibold',
                            record.periodType === 'per_10_meetings'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          )}
                        >
                          {record.periodType === 'per_10_meetings'
                            ? '10x Pertemuan'
                            : 'Bulanan'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-slate-700">
                        {formatDateShort(new Date(record.periodStart))} -{' '}
                        {formatDateShort(new Date(record.periodEnd))}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                          {record.meetingCount}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-green-700">
                          Rp {record.totalAmount.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {record.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <CheckCircle className="h-3 w-3" />
                            Sudah Diterima
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                            <XCircle className="h-3 w-3" />
                            Belum Diterima
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {!record.isPaid && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(record.id)}
                            className="text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Tandai Lunas
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
