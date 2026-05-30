'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Filter } from 'lucide-react';
import { reportsApi, studentsApi, handleApiError } from '@/lib/api';
import { DailyReport, Student } from '@/types';
import { formatDateShort, getScoreColor, getAttendanceBadgeColor, getAttendanceLabel } from '@/lib/utils';

export default function LaporanPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    studentId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    loadStudents();
    loadReports();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getActive();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = {
        month: filters.month,
        year: filters.year,
        limit: 50,
      };

      if (filters.studentId) {
        params.studentId = parseInt(filters.studentId);
      }

      const data = await reportsApi.getAll(params);
      setReports(data);
    } catch (error) {
      alert('Gagal memuat laporan: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadReports();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Harian</h1>
          <p className="text-gray-600 mt-1">Daftar laporan belajar siswa</p>
        </div>
        <div className="flex gap-3">
          <Link href="/laporan/bulanan">
            <Button variant="secondary">
              Laporan Bulanan
            </Button>
          </Link>
          <Link href="/laporan/tambah">
            <Button>
              <Plus size={20} className="mr-2" />
              Tambah Laporan
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={filters.studentId}
              onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
            >
              <option value="">Semua Siswa</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade})
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2020, month - 1).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
            >
              {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <Button onClick={handleFilter}>
              <Filter size={20} className="mr-2" />
              Terapkan Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada laporan</p>
              <Link href="/laporan/tambah">
                <Button className="mt-4">Tambah Laporan Pertama</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{report.student?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDateShort(report.date)} • {report.startTime} - {report.endTime}
                      </p>
                    </div>
                    <Badge className={getAttendanceBadgeColor(report.attendanceStatus)}>
                      {getAttendanceLabel(report.attendanceStatus)}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Mata Pelajaran</p>
                      <p className="text-gray-900">{report.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Topik</p>
                      <p className="text-gray-900">{report.topic}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Semangat</p>
                      <p className={`text-xl font-bold ${getScoreColor(report.enthusiasmScore)}`}>
                        {report.enthusiasmScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Fokus</p>
                      <p className={`text-xl font-bold ${getScoreColor(report.focusScore)}`}>
                        {report.focusScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Pemahaman</p>
                      <p className={`text-xl font-bold ${getScoreColor(report.understandingScore)}`}>
                        {report.understandingScore}
                      </p>
                    </div>
                  </div>

                  {report.progressNotes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-700">Catatan</p>
                      <p className="text-gray-900 text-sm">{report.progressNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
