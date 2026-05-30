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
  const [isLocked, setIsLocked] = useState(false); // Lock mode for parents
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);

  useEffect(() => {
    // Pre-fill from query params if available
    const studentId = searchParams.get('student');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    if (studentId) {
      setSelectedStudent(studentId);
      setIsLocked(true); // Lock when coming from shared link
      loadSingleStudent(parseInt(studentId));
    } else {
      loadStudents();
    }
    
    if (month) setSelectedMonth(parseInt(month));
    if (year) setSelectedYear(parseInt(year));
  }, [searchParams]);

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (error) {
      alert('Failed to load student data: ' + handleApiError(error));
    }
  };

  const loadSingleStudent = async (studentId: number) => {
    try {
      const data = await studentsApi.getById(studentId);
      setStudentInfo(data);
    } catch (error) {
      alert('Failed to load student data: ' + handleApiError(error));
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedStudent) {
      alert('Please select a student first');
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

      alert('✅ PDF report downloaded successfully!');
    } catch (error) {
      alert('❌ Failed to download PDF: ' + handleApiError(error));
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
              Student Learning Report
            </h1>
            <p className="text-sm text-gray-500">
              Study with Miss Fika
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name <span className="text-red-500">*</span>
              </label>
              {isLocked && studentInfo ? (
                <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {studentInfo.name} ({studentInfo.grade})
                  </p>
                  {studentInfo.salaryScheduleType === 'monthly' && studentInfo.monthlyPaymentDate && (
                    <p className="text-xs text-gray-600 mt-1">
                      Payment: Monthly on the {studentInfo.monthlyPaymentDate}th
                    </p>
                  )}
                  {studentInfo.salaryScheduleType === 'per_10_meetings' && (
                    <p className="text-xs text-gray-600 mt-1">
                      Payment: Every 10 meetings
                    </p>
                  )}
                </div>
              ) : (
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  options={students.map((s) => ({ value: s.id, label: `${s.name} (${s.grade})` }))}
                  className="w-full"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month <span className="text-red-500">*</span>
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
                  Year <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  options={years.map((y) => ({ value: y, label: y.toString() }))}
                  className="w-full"
                />
              </div>
            </div>

            {isLocked && studentInfo?.salaryScheduleType === 'monthly' && studentInfo.monthlyPaymentDate && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> For monthly payment on the {studentInfo.monthlyPaymentDate}th, 
                  the report covers from the {studentInfo.monthlyPaymentDate === 1 ? '1st' : `${studentInfo.monthlyPaymentDate + 1}th`} of the previous month 
                  to the {studentInfo.monthlyPaymentDate}th of the selected month.
                </p>
              </div>
            )}

            <Button
              onClick={handleDownloadPdf}
              disabled={downloading || !selectedStudent}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-xl transition-colors"
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Downloading Report...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF Report
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
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Report Information</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The report contains a summary of the student's learning for one month, including:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Total meetings & attendance
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Average enthusiasm, focus & understanding scores
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  List of subjects studied
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Progress notes per meeting
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <p>Learn • Grow • Achieve</p>
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
          <p className="mt-4 text-sm text-gray-600">Loading page...</p>
        </div>
      </div>
    }>
      <DownloadPdfContent />
    </Suspense>
  );
}
