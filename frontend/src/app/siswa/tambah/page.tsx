'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { studentsApi, handleApiError } from '@/lib/api';
import { GRADES } from '@/lib/utils';

export default function TambahSiswaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    parentName: '',
    parentWhatsapp: '',
    address: '',
    tarif: undefined as number | undefined,
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name || formData.name.length < 3) {
      setErrors({ name: 'Nama minimal 3 karakter' });
      return;
    }

    if (!formData.grade) {
      setErrors({ grade: 'Kelas harus diisi' });
      return;
    }

    if (!formData.parentName || formData.parentName.length < 3) {
      setErrors({ parentName: 'Nama orang tua minimal 3 karakter' });
      return;
    }

    try {
      setLoading(true);
      await studentsApi.create(formData);
      alert('Siswa berhasil ditambahkan!');
      router.push('/siswa');
    } catch (error) {
      alert('Gagal menambahkan siswa: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/siswa">
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-10 sm:w-10 p-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tambah Siswa Baru</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Daftarkan siswa les privat baru</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Siswa"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="Contoh: Budi Santoso"
            />

            <Select
              label="Kelas"
              required
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              error={errors.grade}
              options={GRADES.map((g) => ({ value: g, label: g }))}
            />

            <Input
              label="Nama Orang Tua"
              required
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              error={errors.parentName}
              placeholder="Contoh: Ibu Siti"
            />

            <Input
              label="Nomor WhatsApp Orang Tua"
              type="tel"
              value={formData.parentWhatsapp}
              onChange={(e) => setFormData({ ...formData, parentWhatsapp: e.target.value })}
              error={errors.parentWhatsapp}
              placeholder="Contoh: 081234567890"
            />

            <Textarea
              label="Alamat"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat lengkap siswa"
              rows={3}
            />

            <Input
              label="Tarif Per Pertemuan (Rp)"
              type="number"
              value={formData.tarif || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tarif: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="Contoh: 150000"
            />

            <Select
              label="Status"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Nonaktif' },
              ]}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Siswa'}
              </Button>
              <Link href="/siswa">
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
