import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  return time;
}

export function getScoreLabel(score: number): string {
  if (score === 5) return 'Excellent';
  if (score === 4) return 'Sangat Baik';
  if (score === 3) return 'Baik';
  if (score === 2) return 'Cukup';
  return 'Kurang';
}

export function getScoreColor(score: number): string {
  if (score >= 4) return 'text-green-600';
  if (score === 3) return 'text-blue-600';
  if (score === 2) return 'text-yellow-600';
  return 'text-red-600';
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getAttendanceBadgeColor(status: string): string {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800';
    case 'excused':
      return 'bg-yellow-100 text-yellow-800';
    case 'sick':
      return 'bg-orange-100 text-orange-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getAttendanceLabel(status: string): string {
  const labels: Record<string, string> = {
    present: 'Hadir',
    excused: 'Izin',
    sick: 'Sakit',
    cancelled: 'Batal',
  };
  return labels[status] || status;
}

export const DAYS_OF_WEEK = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

export const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const SUBJECTS = [
  'Matematika',
  'Math',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Reading',
  'IPA',
  'IPAS',
  'Science',
  'IPS',
  'PKn',
  'Seni & Budaya',
  'Olahraga',
  'Agama',
  'Mengaji',
  'Hafalan',
  'Lainnya',
];

export const ATTENDANCE_STATUS = [
  { value: 'present', label: 'Hadir' },
  { value: 'excused', label: 'Izin' },
  { value: 'sick', label: 'Sakit' },
  { value: 'cancelled', label: 'Batal' },
];

export const GRADES = [
  '1 SD',
  '2 SD',
  '3 SD',
  '4 SD',
  '5 SD',
  '6 SD',
];
