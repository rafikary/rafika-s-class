'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import Link from 'next/link';
import { reportsApi, studentsApi, handleApiError } from '@/lib/api';
import { Student } from '@/types';
import { SUBJECTS, ATTENDANCE_STATUS } from '@/lib/utils';

export default function TambahLaporanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState([
    { subject: '', customSubject: '', useCustom: false, topic: '' },
    { subject: '', customSubject: '', useCustom: false, topic: '' },
    { subject: '', customSubject: '', useCustom: false, topic: '' },
  ]);
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:30',
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
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getActive();
      setStudents(data);
    } catch (error) {
      alert('Gagal memuat data siswa: ' + handleApiError(error));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId) {
      alert('Pilih siswa terlebih dahulu');
      return;
    }

    const normalizedLessons = lessons.map((lesson, index) => {
      const finalSubject = lesson.useCustom ? lesson.customSubject.trim() : lesson.subject.trim();
      const finalTopic = lesson.topic.trim();

      if (index === 0) {
        if (!finalSubject) {
          throw new Error('Pelajaran 1: pilih mata pelajaran atau isi mata pelajaran lainnya');
        }
        if (!finalTopic) {
          throw new Error('Pelajaran 1: isi topik/materi yang dipelajari');
        }
      } else {
        if ((!finalSubject && finalTopic) || (finalSubject && !finalTopic)) {
          throw new Error(`Pelajaran ${index + 1}: lengkapi mata pelajaran dan topik atau kosongkan keduanya`);
        }
      }

      return { subject: finalSubject, topic: finalTopic };
    });

    try {
      setLoading(true);
      await reportsApi.create({
        ...formData,
        subject: normalizedLessons[0].subject,
        topic: normalizedLessons[0].topic,
        subject2: normalizedLessons[1].subject || undefined,
        topic2: normalizedLessons[1].topic || undefined,
        subject3: normalizedLessons[2].subject || undefined,
        topic3: normalizedLessons[2].topic || undefined,
        studentId: parseInt(formData.studentId),
      });
      alert('Laporan berhasil ditambahkan!');
      router.push('/laporan');
    } catch (error) {
      const message = error instanceof Error ? error.message : handleApiError(error);
      alert('Gagal menambahkan laporan: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const updateLesson = (index: number, data: Partial<typeof lessons[0]>) => {
    setLessons((prev) => prev.map((lesson, i) => (i === index ? { ...lesson, ...data } : lesson)));
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/laporan">
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-10 sm:w-10 p-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tambah Laporan Harian</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Buat laporan belajar baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pertemuan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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
            <CardTitle>Materi Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <CardTitle>Penilaian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semangat Belajar
              </label>
              <StarRating
                rating={formData.enthusiasmScore}
                onChange={(rating) => setFormData({ ...formData, enthusiasmScore: rating })}
                size={32}
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
                size={32}
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
                size={32}
              />
              <p className="text-xs text-gray-500 mt-1">
                Klik bintang untuk memberi nilai
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Laporan'}
          </Button>
          <Link href="/laporan">
            <Button type="button" variant="secondary">
              Batal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
