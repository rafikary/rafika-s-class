'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Download, Loader2, FileText } from 'lucide-react';
import { reportsApi, studentsApi, handleApiError } from '@/lib/api';
import { Student } from '@/types';

function DownloadPdfContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  
  // Date range mode
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const studentId = searchParams.get('student');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    
    if (studentId) {
      setSelectedStudent(studentId);
      setIsLocked(true);
      loadSingleStudent(parseInt(studentId));
    } else {
      loadStudents();
    }
    
    if (start) setStartDate(start);
    if (end) setEndDate(end);
    
    // Set default date range (last 30 days)
    if (!start && !end) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  }, [searchParams]);

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (error) {
      alert('Failed to load students: ' + handleApiError(error));
    }
  };

  const loadSingleStudent = async (studentId: number) => {
    try {
      const data = await studentsApi.getById(studentId);
      setStudentInfo(data);
    } catch (error) {
      alert('Failed to load student: ' + handleApiError(error));
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }
    
    if (!startDate || !endDate) {
      alert('Please select date range');
      return;
    }

    try {
      setDownloading(true);
      const blob = await reportsApi.exportPdf(parseInt(selectedStudent), {
        startDate,
        endDate,
      });

      const studentName = isLocked && studentInfo ? studentInfo.name : students.find((s) => s.id === parseInt(selectedStudent))?.name;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Learning_Report_${studentName?.replace(/\s+/g, '_')}_${startDate}_${endDate}.pdf`;
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
  
  const handleQuickPeriod = (days: number) => {
    const today = new Date();
    const startPeriod = new Date();
    startPeriod.setDate(today.getDate() - days);
    
    setStartDate(startPeriod.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-white pt-2 pb-4 sm:pt-3 sm:pb-6 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="mb-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-2">
              <FileText className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1.5">
              Student Learning Report
            </h1>
            <p className="text-sm text-gray-500">
              Study with Miss Fika
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-6 mb-5">
          <div className="space-y-4">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name <span className="text-red-500">*</span>
              </label>
              {isLocked && studentInfo ? (
                <div className="px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {studentInfo.name} ({studentInfo.grade})
                  </p>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    🔒 Locked to this student
                  </p>
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

            {/* Quick Period Buttons - Only show for Admin */}
            {!isLocked && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Select Period
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleQuickPeriod(7)}
                    className="text-xs border border-gray-300 hover:bg-gray-50"
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleQuickPeriod(14)}
                    className="text-xs border border-gray-300 hover:bg-gray-50"
                  >
                    Last 14 Days
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleQuickPeriod(30)}
                    className="text-xs border border-gray-300 hover:bg-gray-50"
                  >
                    Last 30 Days
                  </Button>
                </div>
              </div>
            )}

            {/* Date Range */}
            <div>
              {isLocked && (
                <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-[11px] text-amber-800">
                    📅 Report period selected by teacher
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isLocked}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      isLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isLocked}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      isLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownloadPdf}
              disabled={downloading || !selectedStudent || !startDate || !endDate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
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
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Report Information</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The report contains a summary of student learning for the selected period, including:
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
        <div className="text-center mt-5 text-xs text-gray-400">
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
          <p className="mt-4 text-sm text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <DownloadPdfContent />
    </Suspense>
  );
}
