'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import Link from 'next/link';
import { reportsApi, studentsApi, handleApiError } from '@/lib/api';
import { Student, DailyReport } from '@/types';
import { SUBJECTS, ATTENDANCE_STATUS } from '@/lib/utils';

export default function EditLaporanPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState([
    { subject: '', customSubject: '', useCustom: false, topic: '' },
    { subject: '', customSubject: '', useCustom: false, topic: '' },
    { subject: '', customSubject: '', useCustom: false, topic: '' },
  ]);
  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    startTime: '',
    endTime: '',
    enthusiasmScore: 3,
    focusScore: 3,
    understandingScore: 3,
    homework: '',
    progressNotes: '',
    parentNotes: '',
    attendanceStatus: 'present',
  });

  useEffect(() => {
    loadStudents();
    loadReport();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getActive();
      setStudents(data);
    } catch (error) {
      alert('Gagal memuat data siswa: ' + handleApiError(error));
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const report = await reportsApi.getById(reportId);
      
      // Check if subject is custom (not in SUBJECTS list)
      const isCustomSubject = !SUBJECTS.includes(report.subject);
      
      setFormData({
        studentId: report.studentId.toString(),
        date: new Date(report.date).toISOString().split('T')[0],
        startTime: report.startTime,
        endTime: report.endTime,
        enthusiasmScore: report.enthusiasmScore,
        focusScore: report.focusScore,
        understandingScore: report.understandingScore,
        homework: report.homework || '',
        progressNotes: report.progressNotes || '',
        parentNotes: report.parentNotes || '',
        attendanceStatus: report.attendanceStatus,
      });

      setLessons([
        {
          subject: isCustomSubject ? '' : report.subject,
          customSubject: isCustomSubject ? report.subject : '',
          useCustom: isCustomSubject,
          topic: report.topic,
        },
        { subject: '', customSubject: '', useCustom: false, topic: '' },
        { subject: '', customSubject: '', useCustom: false, topic: '' },
      ]);
    } catch (error) {
      alert('Gagal memuat laporan: ' + handleApiError(error));
      router.push('/laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId) {
      alert('Pilih siswa terlebih dahulu');
      return;
    }

    const preparedLessons = lessons
      .map((lesson, index) => {
        const finalSubject = lesson.useCustom ? lesson.customSubject.trim() : lesson.subject.trim();
        const finalTopic = lesson.topic.trim();

        if (index === 0) {
          if (!finalSubject) {
            throw new Error('Pelajaran 1: pilih mata pelajaran atau isi mata pelajaran lainnya');
          }
          if (!finalTopic) {
            throw new Error('Pelajaran 1: isi topik/materi yang dipelajari');
          }
          return { subject: finalSubject, topic: finalTopic };
        }

        if (!finalSubject && !finalTopic) {
          return null;
        }

        if (!finalSubject || !finalTopic) {
          throw new Error(`Pelajaran ${index + 1}: lengkapi mata pelajaran dan topik atau kosongkan keduanya`);
        }

        return { subject: finalSubject, topic: finalTopic };
      })
      .filter((lesson): lesson is { subject: string; topic: string } => lesson !== null);

    try {
      setSaving(true);
      await reportsApi.update(reportId, {
        ...formData,
        subject: preparedLessons[0].subject,
        topic: preparedLessons[0].topic,
        studentId: parseInt(formData.studentId),
      });

      if (preparedLessons.length > 1) {
        await Promise.all(
          preparedLessons.slice(1).map((lesson) =>
            reportsApi.create({
              ...formData,
              subject: lesson.subject,
              topic: lesson.topic,
              studentId: parseInt(formData.studentId),
            })
          )
        );
      }

      alert(`Laporan berhasil diupdate! (${preparedLessons.length} pelajaran)`);
      router.push('/laporan');
    } catch (error) {
      const message = error instanceof Error ? error.message : handleApiError(error);
      alert('Gagal mengupdate laporan: ' + message);
    } finally {
      setSaving(false);
    }
  };

  const updateLesson = (index: number, data: Partial<typeof lessons[0]>) => {
    setLessons((prev) => prev.map((lesson, i) => (i === index ? { ...lesson, ...data } : lesson)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/laporan">
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-10 sm:w-10 p-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Laporan Harian</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Update data laporan belajar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Informasi Pertemuan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Select
              label="Pilih Siswa"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              options={students.map((s) => ({ value: s.id, label: `${s.name} (${s.grade})` }))}
            />

            <Input
              type="date"
              label="Tanggal Belajar"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Input
                type="time"
                label="Jam Mulai"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
              <Input
                type="time"
                label="Jam Selesai"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>

            <Select
              label="Kehadiran"
              required
              value={formData.attendanceStatus}
              onChange={(e) => setFormData({ ...formData, attendanceStatus: e.target.value })}
              options={ATTENDANCE_STATUS}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Materi Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {lessons.map((lesson, index) => (
              <div key={`lesson-${index}`} className="rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">
                    Pelajaran {index + 1}{index === 0 ? ' (wajib)' : ' (opsional)'}
                  </p>
                </div>

                <Select
                  label="Mata Pelajaran"
                  required={index === 0}
                  value={lesson.useCustom ? 'Lainnya' : lesson.subject}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'Lainnya') {
                      updateLesson(index, { useCustom: true, subject: '' });
                    } else {
                      updateLesson(index, { useCustom: false, customSubject: '', subject: value });
                    }
                  }}
                  options={SUBJECTS.map((s) => ({ value: s, label: s }))}
                />

                {lesson.useCustom && (
                  <Input
                    label="Mata Pelajaran Lainnya"
                    required={index === 0}
                    value={lesson.customSubject}
                    onChange={(e) => updateLesson(index, { customSubject: e.target.value })}
                    placeholder="Contoh: Komputer, Menggambar, dll"
                  />
                )}

                <Textarea
                  label="Topik/Materi yang Dipelajari"
                  required={index === 0}
                  value={lesson.topic}
                  onChange={(e) => updateLesson(index, { topic: e.target.value })}
                  placeholder="Contoh: Perkalian dan Pembagian Bilangan"
                  rows={3}
                />
              </div>
            ))}

            <Textarea
              label="PR/Tugas"
              value={formData.homework}
              onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
              placeholder="Contoh: Latihan soal halaman 25-27"
              rows={2}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Penilaian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semangat Belajar
              </label>
              <StarRating
                rating={formData.enthusiasmScore}
                onChange={(rating) => setFormData({ ...formData, enthusiasmScore: rating })}
                size={28}
              />
              <p className="text-xs text-gray-500 mt-1">
                Klik bintang untuk memberi nilai
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fokus/Konsentrasi
              </label>
              <StarRating
                rating={formData.focusScore}
                onChange={(rating) => setFormData({ ...formData, focusScore: rating })}
                size={28}
              />
              <p className="text-xs text-gray-500 mt-1">
                Klik bintang untuk memberi nilai
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pemahaman Materi
              </label>
              <StarRating
                rating={formData.understandingScore}
                onChange={(rating) => setFormData({ ...formData, understandingScore: rating })}
                size={28}
              />
              <p className="text-xs text-gray-500 mt-1">
                Klik bintang untuk memberi nilai
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Catatan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Textarea
              label="Catatan Perkembangan"
              value={formData.progressNotes}
              onChange={(e) => setFormData({ ...formData, progressNotes: e.target.value })}
              placeholder="Contoh: Budi mulai paham konsep perkalian dasar"
              rows={3}
            />

            <Textarea
              label="Catatan untuk Orang Tua"
              value={formData.parentNotes}
              onChange={(e) => setFormData({ ...formData, parentNotes: e.target.value })}
              placeholder="Contoh: Perlu latihan lebih banyak di rumah"
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Update Laporan'
            )}
          </Button>
          <Link href="/laporan" className="w-full sm:w-auto">
            <Button type="button" variant="secondary" className="w-full">
              Batal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
