'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Filter, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { reportsApi, studentsApi, handleApiError } from '@/lib/api';
import { DailyReport, Student } from '@/types';
import { formatDateShort, getScoreColor, getAttendanceBadgeColor, getAttendanceLabel } from '@/lib/utils';

interface GroupedReports {
  student: Student;
  reports: DailyReport[];
  expanded: boolean;
}

export default function LaporanPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groupedReports, setGroupedReports] = useState<GroupedReports[]>([]);
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

  useEffect(() => {
    // Group reports by student
    groupReportsByStudent();
  }, [reports, students]);

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
        limit: 100,
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

  const groupReportsByStudent = () => {
    // Create a map of student ID to reports
    const studentReportsMap = new Map<number, DailyReport[]>();
    
    reports.forEach(report => {
      const studentId = report.studentId;
      if (!studentReportsMap.has(studentId)) {
        studentReportsMap.set(studentId, []);
      }
      studentReportsMap.get(studentId)!.push(report);
    });

    // Convert to GroupedReports array
    const grouped: GroupedReports[] = [];
    studentReportsMap.forEach((studentReports, studentId) => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        grouped.push({
          student,
          reports: studentReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          expanded: false,
        });
      }
    });

    // Sort by student name
    grouped.sort((a, b) => a.student.name.localeCompare(b.student.name));
    
    setGroupedReports(grouped);
  };

  const toggleExpand = (studentId: number) => {
    setGroupedReports(prev =>
      prev.map(group =>
        group.student.id === studentId
          ? { ...group, expanded: !group.expanded }
          : group
      )
    );
  };

  const handleFilter = () => {
    loadReports();
  };

  const handleDelete = async (id: number, studentName: string) => {
    if (!confirm(`Hapus laporan ${studentName}?`)) return;

    try {
      await reportsApi.delete(id);
      alert('Laporan berhasil dihapus!');
      loadReports();
    } catch (error) {
      alert('Gagal menghapus laporan: ' + handleApiError(error));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Laporan Harian</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Daftar laporan belajar siswa</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link href="/laporan/bulanan" className="flex-1 sm:flex-none">
            <Button variant="secondary" className="w-full sm:w-auto text-sm">
              Laporan Bulanan
            </Button>
          </Link>
          <Link href="/laporan/tambah" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto text-sm">
              <Plus size={18} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tambah Laporan</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <select
              className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
            >
              {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <Button onClick={handleFilter} className="text-sm">
              <Filter size={18} className="mr-2" />
              Terapkan Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Daftar Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-sm">Memuat data...</p>
            </div>
          ) : groupedReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm sm:text-base">Belum ada laporan</p>
              <Link href="/laporan/tambah">
                <Button className="mt-4 text-sm">Tambah Laporan Pertama</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {groupedReports.map((group) => (
                <div key={group.student.id} className="border rounded-lg overflow-hidden">
                  {/* Student Header - Clickable */}
                  <button
                    onClick={() => toggleExpand(group.student.id)}
                    className="w-full bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors p-3 sm:p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-base">
                        {group.student.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">{group.student.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {group.student.grade} • {group.reports.length} laporan
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {group.reports.length}
                      </Badge>
                      {group.expanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Reports */}
                  {group.expanded && (
                    <div className="bg-white border-t">
                      {group.reports.map((report) => (
                        <div
                          key={report.id}
                          className="border-b last:border-b-0 p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0 mb-3">
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                                {formatDateShort(report.date)} • {report.startTime} - {report.endTime}
                              </p>
                              <div className="text-sm sm:text-base font-semibold text-gray-900 mt-1 space-y-0.5">
                                {[
                                  [report.subject, report.topic],
                                  [report.subject2, report.topic2],
                                  [report.subject3, report.topic3],
                                ]
                                  .filter(([subject, topic]) => subject && topic)
                                  .map(([subject, topic], idx) => (
                                    <div key={`lesson-${report.id}-${idx}`}>
                                      {subject} - {topic}
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getAttendanceBadgeColor(report.attendanceStatus)}>
                                {getAttendanceLabel(report.attendanceStatus)}
                              </Badge>
                              <Link href={`/laporan/edit/${report.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Edit size={14} />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(report.id, group.student.name)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>

                          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
                            <div className="text-center">
                              <p className="text-gray-500">Semangat</p>
                              <p className={`text-base sm:text-lg font-bold ${getScoreColor(report.enthusiasmScore)}`}>
                                {report.enthusiasmScore}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-500">Fokus</p>
                              <p className={`text-base sm:text-lg font-bold ${getScoreColor(report.focusScore)}`}>
                                {report.focusScore}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-500">Pemahaman</p>
                              <p className={`text-base sm:text-lg font-bold ${getScoreColor(report.understandingScore)}`}>
                                {report.understandingScore}
                              </p>
                            </div>
                          </div>

                          {report.progressNotes && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs sm:text-sm font-medium text-gray-700">Catatan</p>
                              <p className="text-gray-900 text-xs sm:text-sm mt-1">{report.progressNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
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
