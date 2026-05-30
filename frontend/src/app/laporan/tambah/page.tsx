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
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:30',
    subject: '',
    topic: '',
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

    try {
      setLoading(true);
      await reportsApi.create({
        ...formData,
        studentId: parseInt(formData.studentId),
      });
      alert('Laporan berhasil ditambahkan!');
      router.push('/laporan');
    } catch (error) {
      alert('Gagal menambahkan laporan: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/laporan">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Laporan Harian</h1>
          <p className="text-gray-600 mt-1">Catat kegiatan belajar siswa hari ini</p>
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
            <Select
              label="Mata Pelajaran"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              options={SUBJECTS.map((s) => ({ value: s, label: s }))}
            />

            <Textarea
              label="Topik/Materi yang Dipelajari"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Contoh: Perkalian dan Pembagian Bilangan"
              rows={3}
            />

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
