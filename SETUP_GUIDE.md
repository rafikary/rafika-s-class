# 🚀 Panduan Setup & Menjalankan Project

## Prerequisites

Pastikan sudah terinstall:
- **Node.js** v18 atau lebih baru ([Download](https://nodejs.org/))
- **npm** atau **yarn** (biasanya sudah include dengan Node.js)
- **Git** (optional, untuk version control)

**Catatan:** SQLite otomatis tersedia, tidak perlu install database terpisah!

---

## 📦 Instalasi

### 1. Clone atau Extract Project

Jika menggunakan Git:
```bash
git clone <repository-url>
cd "RAFIKA'S CLASS"
```

Atau extract ZIP file ke folder `RAFIKA'S CLASS`.

---

### 2. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# File .env sudah siap pakai, tidak perlu diedit!
# SQLite akan otomatis membuat file database
```

Setup database:
npx prisma generate

# Jalankan migrasi database (buat tabel)
npx prisma migrate dev --name init

# Isi data dummy
npx prisma db seed

# Jalankan backend server
npm run dev
```

Backend akan berjalan di: **http://localhost:5000**

Tes backend dengan buka browser ke: http://localhost:5000/api/health

**Database SQLite** akan otomatis dibuat di: `backend/prisma/les_private.db`

---

### 3. Setup Frontend

Buka terminal/command prompt **BARU** (jangan tutup terminal backend):

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Copy environment variables
copy .env.local.example .env.local

# Edit file .env.local (isinya sudah benar, tidak perlu diubah)
```

Isi file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
# Jalankan frontend development server
npm run dev
```

Frontend akan berjalan di: **http://localhost:3000**

---

## ✅ Verifikasi

### Cek Backend:
1. Buka browser ke: http://localhost:5000/api/health
2. Harus muncul response JSON: `{"success": true, "message": "API is running"}`

### Cek Frontend:
1. Buka browser ke: http://localhost:3000
2. Akan redirect ke halaman Dashboard
3. Harus terlihat data dummy siswa dan statistik

### Cek Database:
```bash
cd backend
npx prisma studio
```
- Akan terbuka UI database di browser
- Periksa tabel: students, daily_reports, schedules

---

## 📝 Cara Menggunakan Aplikasi

### 1. Dashboard
- Melihat ringkasan statistik
- Akses cepat ke fitur utama

### 2. Data Siswa
- Tambah siswa baru: Klik "Tambah Siswa"
- Edit siswa: Klik icon pensil
- Hapus siswa: Klik icon trash (akan menghapus semua laporan terkait)
- Hubungi via WhatsApp: Klik nomor WhatsApp

### 3. Laporan Harian
- Tambah laporan: Klik "Tambah Laporan"
- Pilih siswa dari dropdown
- Isi semua data pertemuan
- Gunakan slider untuk rating (1-5)

### 4. Laporan Bulanan
- Pilih siswa, bulan, dan tahun
- Klik "Lihat Rekap"
- **Export Excel**: Klik "Export Excel" untuk download file
- **Kirim WhatsApp**: Klik "Kirim ke WhatsApp Ortu"
  - Preview pesan akan muncul
  - Klik "Buka WhatsApp" untuk mengirim

### 5. Jadwal
- Lihat jadwal mingguan semua siswa
- Filter berdasarkan hari

---

## 🔧 Troubleshooting

### Backend tidak bisa start:

**Error: "Port 5000 already in use"**
```bash
# Ganti PORT di .env menjadi 5001 atau port lain
PORT=5001

# Jangan lupa update frontend .env.local juga:
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### Frontend tidak bisa start:

**Error: "Cannot connect to backend"**
- Pastikan backend sudah running di http://localhost:5000
- Cek file `.env.local` di folder frontend
- Pastikan `NEXT_PUBLIC_API_URL` sesuai dengan port backend

**Error: "Port 3000 already in use"**
```bash
# Next.js akan otomatis menawarkan port lain (3001, 3002, dst)
# Ketik Y untuk accept
```

### Database Error:

**Error: "Prisma Client not generated"**
```bash
cd backend
npx prisma generate
```

**Error: "Migration failed"**
```bash
# Hapus database dan buat ulang
# Hapus file: backend/prisma/les_private.db
# Lalu jalankan migrate ulang:
npx prisma migrate dev
npx prisma db seed
```

**Error: "Database locked"**
- Tutup Prisma Studio jika sedang buka
- Restart terminal backend

---

## 🛑 Cara Menghentikan Server

### Stop Backend:
- Di terminal backend, tekan `Ctrl + C`

### Stop Frontend:
- Di terminal frontend, tekan `Ctrl + C`

---

## 🔄 Cara Menjalankan Ulang

Setiap kali ingin menggunakan aplikasi:

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Buka browser: http://localhost:3000

---

## 📊 Data Dummy yang Tersedia

Setelah seed, Anda akan memiliki:
- **5 siswa** (4 aktif, 1 nonaktif)
  - Budi Santoso (3 SD)
  - Ani Wijaya (4 SD)
  - Cahaya Putri (2 SD)
  - Dimas Prasetyo (5 SD)
  - Eka Permata (3 SD) - nonaktif

- **6 jadwal belajar**

- **15 laporan harian** untuk bulan Mei 2026

---

## 🎨 Fitur WhatsApp

### Cara Kerja:
1. Pastikan siswa punya nomor WhatsApp orang tua
2. Nomor otomatis dinormalisasi ke format internasional (628xxx)
3. Di halaman Laporan Bulanan, klik "Kirim ke WhatsApp Ortu"
4. Preview pesan akan muncul
5. Klik "Buka WhatsApp" - browser akan membuka WhatsApp Web/App
6. Tinggal klik Send

### Format Nomor yang Diterima:
- `081234567890` ✅
- `+6281234567890` ✅
- `6281234567890` ✅
- `08123456789` ✅

---

## 📦 Build untuk Production

### Backend:
```bash
cd backend
npm run build
npm start
```

### Frontend:
```bash
cd frontend
npm run build
npm start
```

---

## 📚 Struktur File

```
RAFIKA'S CLASS/
├── backend/               # Express API
│   ├── src/
│   │   ├── config/       # Database & env config
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── utils/        # Helper functions (WhatsApp, etc)
│   │   └── validators/   # Input validation
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.ts       # Dummy data
│   └── package.json
│
├── frontend/             # Next.js App
│   ├── src/
│   │   ├── app/         # Pages (dashboard, siswa, laporan)
│   │   ├── components/  # Reusable UI components
│   │   ├── lib/         # API client & utilities
│   │   └── types/       # TypeScript types
│   └── package.json
│
├── README.md
├── TECHNICAL_DESIGN.md
└── SETUP_GUIDE.md       # File ini
```

---

## 🆘 Bantuan Lebih Lanjut

Jika masih ada masalah:
1. Cek log error di terminal backend dan frontend
2. Periksa file `.env` dan `.env.local`
3. Cek port tidak dipakai aplikasi lain
4. Pastikan Node.js minimal versi 18

---

## ✨ Tips

- Gunakan Chrome/Edge untuk pengalaman terbaik
- Fitur WhatsApp butuh WhatsApp Web/Desktop terinstall
- Export Excel otomatis download ke folder Downloads
- Data dummy cocok untuk testing semua fitur

---

**Selamat Menggunakan! 🎉**
