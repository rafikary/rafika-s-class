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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-3 sm:mb-4">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Download Laporan Belajar
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            Miss Rafika's Learning Center
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Pilih Laporan yang Ingin Diunduh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Select
              label="Nama Siswa"
              required
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              options={students.map((s) => ({ value: s.id, label: `${s.name} (${s.grade})` }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Bulan"
                required
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
              />

              <Select
                label="Tahun"
                required
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                options={years.map((y) => ({ value: y, label: y.toString() }))}
              />
            </div>

            <Button
              onClick={handleDownloadPdf}
              disabled={downloading || !selectedStudent}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base sm:text-lg py-4 sm:py-6"
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mengunduh...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Laporan PDF 📄
                </>
              )}
            </Button>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>ℹ️ Informasi:</strong><br />
                Laporan berisi ringkasan belajar siswa selama satu bulan, termasuk:
              </p>
              <ul className="text-xs sm:text-sm text-blue-700 mt-2 ml-4 list-disc">
                <li>Total pertemuan & kehadiran</li>
                <li>Rata-rata nilai semangat, fokus & pemahaman</li>
                <li>Daftar materi yang dipelajari</li>
                <li>Catatan perkembangan per pertemuan</li>
              </ul>
            </div>

            <div className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
              <p>Laporan dibuat dengan 💜 oleh Miss Rafika</p>
              <p className="mt-1">Belajar • Berkembang • Berprestasi</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DownloadPdfPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center mt-20">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600" />
          <p className="mt-4 text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <DownloadPdfContent />
    </Suspense>
  );
}
