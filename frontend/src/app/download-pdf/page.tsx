'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Download, Loader2, FileText } from 'lucide-react';
import { reportsApi, studentsApi, handleApiError } from '@/lib/api';
import { Student } from '@/types';
import { MONTHS } from '@/lib/utils';

function DownloadPdfContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadStudents();
    
    // Pre-fill from query params if available
    const studentId = searchParams.get('student');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    if (studentId) setSelectedStudent(studentId);
    if (month) setSelectedMonth(parseInt(month));
    if (year) setSelectedYear(parseInt(year));
  }, [searchParams]);

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (error) {
      alert('Gagal memuat data siswa: ' + handleApiError(error));
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedStudent) {
      alert('Pilih siswa terlebih dahulu');
      return;
    }

    try {
      setDownloading(true);
      const blob = await reportsApi.exportPdf(parseInt(selectedStudent), {
        month: selectedMonth,
        year: selectedYear,
      });

      const student = students.find((s) => s.id === parseInt(selectedStudent));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_${student?.name.replace(/\s+/g, '_')}_${MONTHS[selectedMonth - 1]}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('✅ Laporan PDF berhasil diunduh!');
    } catch (error) {
      alert('❌ Gagal download PDF: ' + handleApiError(error));
    } finally {
      setDownloading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl mb-4">
              <FileText className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
              Laporan Belajar Siswa
            </h1>
            <p className="text-sm text-gray-500">
              Belajar with Miss Fika
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Siswa <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                options={students.map((s) => ({ value: s.id, label: `${s.name} (${s.grade})` }))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  options={years.map((y) => ({ value: y, label: y.toString() }))}
                  className="w-full"
                />
              </div>
            </div>

            <Button
              onClick={handleDownloadPdf}
              disabled={downloading || !selectedStudent}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-xl transition-colors"
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mengunduh Laporan...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Laporan PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Informasi Laporan</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Laporan berisi ringkasan belajar siswa selama satu bulan, termasuk:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Total pertemuan & kehadiran
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Rata-rata nilai semangat, fokus & pemahaman
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Daftar materi yang dipelajari
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Catatan perkembangan per pertemuan
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <p>Belajar • Berkembang • Berprestasi</p>
        </div>
      </div>
    </div>
  );
}

export default function DownloadPdfPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-lg mx-auto text-center mt-20">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-sm text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <DownloadPdfContent />
    </Suspense>
  );
}
