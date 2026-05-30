'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Phone } from 'lucide-react';
import { studentsApi, handleApiError } from '@/lib/api';
import { Student } from '@/types';
import { getStatusBadgeColor } from '@/lib/utils';

export default function SiswaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsApi.getAll({ search });
      setStudents(data);
    } catch (error) {
      alert('Gagal memuat data siswa: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Yakin ingin menghapus siswa ${name}? Semua laporan terkait juga akan terhapus.`)) {
      return;
    }

    try {
      await studentsApi.delete(id);
      alert('Siswa berhasil dihapus');
      loadStudents();
    } catch (error) {
      alert('Gagal menghapus siswa: ' + handleApiError(error));
    }
  };

  const openWhatsApp = (phone: string | null) => {
    if (!phone) {
      alert('Nomor WhatsApp tidak tersedia');
      return;
    }
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Kelola data siswa les privat</p>
        </div>
        <Link href="/siswa/tambah" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus size={18} className="mr-2" />
            Tambah Siswa
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Siswa</CardTitle>
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadStudents()}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada data siswa</p>
              <Link href="/siswa/tambah">
                <Button className="mt-4">Tambah Siswa Pertama</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Orang Tua</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Tarif</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Laporan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>{student.parentName}</TableCell>
                      <TableCell>
                        {student.parentWhatsapp ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openWhatsApp(student.parentWhatsapp)}
                          >
                            <Phone size={16} className="mr-1" />
                            {student.parentWhatsapp}
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.tarif ? (
                          <span className="font-medium text-green-700">
                            Rp {student.tarif.toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(student.status)}>
                          {student.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.totalReports || 0} laporan</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/siswa/${student.id}/edit`}>
                            <Button size="sm" variant="ghost">
                              <Edit size={16} />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(student.id, student.name)}
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
