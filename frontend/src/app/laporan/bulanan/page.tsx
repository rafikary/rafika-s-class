'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Download, MessageCircle, FileText, Loader2 } from 'lucide-react';
import { reportsApi, studentsApi, handleApiError } from '@/lib/api';
import { Student, MonthlyReport } from '@/types';
import { MONTHS, getScoreColor, formatDateShort, getAttendanceBadgeColor, getAttendanceLabel } from '@/lib/utils';

export default function LaporanBulananPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getActive();
      setStudents(data);
    } catch (error) {
      alert('Gagal memuat data siswa: ' + handleApiError(error));
    }
  };

  const loadMonthlyReport = async () => {
    if (!selectedStudent) {
      alert('Pilih siswa terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      const data = await reportsApi.getMonthly(parseInt(selectedStudent), {
        month: selectedMonth,
        year: selectedYear,
      });
      setMonthlyReport(data);
    } catch (error) {
      alert('Gagal memuat laporan: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedStudent) return;

    try {
      setExporting(true);
      const blob = await reportsApi.exportExcel(parseInt(selectedStudent), {
        month: selectedMonth,
        year: selectedYear,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_${monthlyReport?.student.name.replace(/\s+/g, '_')}_${MONTHS[selectedMonth - 1]}_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Laporan Excel berhasil diunduh!');
    } catch (error) {
      alert('Gagal export Excel: ' + handleApiError(error));
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedStudent) return;

    try {
      setExporting(true);
      const blob = await reportsApi.exportPdf(parseInt(selectedStudent), {
        month: selectedMonth,
        year: selectedYear,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_${monthlyReport?.student.name.replace(/\s+/g, '_')}_${MONTHS[selectedMonth - 1]}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Laporan PDF berhasil diunduh!');
    } catch (error) {
      alert('Gagal export PDF: ' + handleApiError(error));
    } finally {
      setExporting(false);
    }
  };

  const handleSendToWhatsApp = async () => {
    if (!selectedStudent || !monthlyReport) return;

    if (!monthlyReport.student.parentWhatsapp) {
      alert('Nomor WhatsApp orang tua tidak tersedia. Silakan lengkapi data siswa terlebih dahulu.');
      return;
    }

    try {
      setExporting(true);
      const response = await reportsApi.getWhatsAppLink(parseInt(selectedStudent), {
        month: selectedMonth,
        year: selectedYear,
      });

      // Open WhatsApp with pre-filled message
      window.open(response.whatsappUrl, '_blank');
      
      alert('✅ WhatsApp terbuka! Tinggal klik kirim untuk mengirim laporan ke orang tua.');
    } catch (error) {
      alert('Gagal generate link WhatsApp: ' + handleApiError(error));
    } finally {
      setExporting(false);
    }
  };

  const handleGetWhatsAppLink = async () => {
    if (!selectedStudent) return;

    try {
      const response = await reportsApi.getWhatsAppLink(parseInt(selectedStudent), {
        month: selectedMonth,
        year: selectedYear,
      });

      setWhatsappMessage(response.message);
      setShowWhatsAppPreview(true);
    } catch (error) {
      alert('Gagal generate link WhatsApp: ' + handleApiError(error));
    }
  };

  const handleSendWhatsApp = async () => {
    if (!selectedStudent) return;

    try {
      const response = await reportsApi.getWhatsAppLink(parseInt(selectedStudent), {
        month: selectedMonth,
        year: selectedYear,
      });

      window.open(response.whatsappUrl, '_blank');
      setShowWhatsAppPreview(false);
    } catch (error) {
      alert('Gagal membuka WhatsApp: ' + handleApiError(error));
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Laporan Bulanan</h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Lihat dan export laporan bulanan per siswa</p>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Pilih Siswa"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              options={students.map((s) => ({ value: s.id, label: `${s.name} (${s.grade})` }))}
            />

            <Select
              label="Bulan"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
            />

            <Select
              label="Tahun"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              options={years.map((y) => ({ value: y, label: y.toString() }))}
            />

            <div className="flex items-end">
              <Button onClick={loadMonthlyReport} disabled={!selectedStudent || loading} className="w-full h-9 sm:h-10 text-sm">
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                    <span className="sm:hidden">Load...</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} className="mr-2" />
                    <span className="hidden sm:inline">Lihat Rekap</span>
                    <span className="sm:hidden">Rekap</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Report */}
      {monthlyReport && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg lg:text-xl">
                    Laporan {monthlyReport.student.name} - {monthlyReport.period.monthName} {monthlyReport.period.year}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Kelas {monthlyReport.student.grade} • Orang Tua: {monthlyReport.student.parentName}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleSendToWhatsApp}
                    disabled={exporting || !monthlyReport.student.parentWhatsapp}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-9 sm:h-10 text-xs sm:text-sm"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    {exporting ? 'Memproses...' : (
                      <>
                        <span className="hidden sm:inline">Kirim ke Wali Siswa 📱</span>
                        <span className="sm:hidden">Wali Siswa</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleExportPdf}
                    disabled={exporting}
                    variant="secondary"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  >
                    <Download size={16} className="mr-2" />
                    Backup PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Pertemuan</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                    {monthlyReport.summary.totalSessions}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Rata-rata Semangat</p>
                  <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getScoreColor(monthlyReport.summary.avgEnthusiasm)}`}>
                    {monthlyReport.summary.avgEnthusiasm.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Rata-rata Fokus</p>
                  <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getScoreColor(monthlyReport.summary.avgFocus)}`}>
                    {monthlyReport.summary.avgFocus.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Rata-rata Pemahaman</span>
                    <span className="sm:hidden">Pemahaman</span>
                  </p>
                  <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getScoreColor(monthlyReport.summary.avgUnderstanding)}`}>
                    {monthlyReport.summary.avgUnderstanding.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <div className="flex items-center">
                  <Badge variant="success" className="text-xs sm:text-sm">Hadir: {monthlyReport.summary.present}</Badge>
                </div>
                <div className="flex items-center">
                  <Badge variant="warning" className="text-xs sm:text-sm">Izin: {monthlyReport.summary.excused}</Badge>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-orange-100 text-orange-800 text-xs sm:text-sm">Sakit: {monthlyReport.summary.sick}</Badge>
                </div>
                <div className="flex items-center">
                  <Badge variant="danger" className="text-xs sm:text-sm">Batal: {monthlyReport.summary.cancelled}</Badge>
                </div>
              </div>

              <div className="mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Mata Pelajaran:</p>
                <div className="flex flex-wrap gap-2">
                  {monthlyReport.summary.subjectsCovered.map((subject) => (
                    <Badge key={subject} variant="info" className="text-xs sm:text-sm">{subject}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Detail */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Pertemuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {monthlyReport.reports.map((report, index) => (
                  <div key={report.id} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base lg:text-lg">
                          #{index + 1} - {formatDateShort(report.date)}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {report.startTime} - {report.endTime}
                        </p>
                      </div>
                      <Badge className={`${getAttendanceBadgeColor(report.attendanceStatus)} text-xs sm:text-sm`}>
                        {getAttendanceLabel(report.attendanceStatus)}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 sm:gap-4 mb-2 sm:mb-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Mata Pelajaran</p>
                        <p className="text-sm sm:text-base text-gray-900">{report.subject}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Topik</p>
                        <p className="text-sm sm:text-base text-gray-900">{report.topic}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 mb-2 sm:mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Semangat</p>
                        <p className={`text-lg sm:text-xl font-bold ${getScoreColor(report.enthusiasmScore)}`}>
                          {report.enthusiasmScore}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Fokus</p>
                        <p className={`text-lg sm:text-xl font-bold ${getScoreColor(report.focusScore)}`}>
                          {report.focusScore}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Pemahaman</p>
                        <p className={`text-lg sm:text-xl font-bold ${getScoreColor(report.understandingScore)}`}>
                          {report.understandingScore}
                        </p>
                      </div>
                    </div>

                    {report.homework && (
                      <div className="mb-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">PR/Tugas</p>
                        <p className="text-sm sm:text-base text-gray-900">{report.homework}</p>
                      </div>
                    )}

                    {report.progressNotes && (
                      <div className="mb-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Catatan Perkembangan</p>
                        <p className="text-sm sm:text-base text-gray-900">{report.progressNotes}</p>
                      </div>
                    )}

                    {report.parentNotes && (
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Catatan untuk Orang Tua</p>
                        <p className="text-sm sm:text-base text-gray-900">{report.parentNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* WhatsApp Preview Modal */}
      {showWhatsAppPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Preview Pesan WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="whitespace-pre-wrap text-sm font-mono">{whatsappMessage}</pre>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSendWhatsApp}>
                  <MessageCircle size={20} className="mr-2" />
                  Buka WhatsApp
                </Button>
                <Button variant="secondary" onClick={() => setShowWhatsAppPreview(false)}>
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
