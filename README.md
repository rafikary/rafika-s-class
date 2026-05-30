# 📚 Web App Admin Les Private SD

Web application untuk manajemen laporan belajar siswa les private dengan fitur export laporan bulanan dan integrasi WhatsApp untuk orang tua.

## 🎯 Fitur Utama

### MVP Features
- ✅ CRUD Data Siswa (nama, kelas, orang tua, nomor WA, status)
- ✅ CRUD Jadwal Belajar
- ✅ Input Laporan Harian (materi, topik, rating, catatan)
- ✅ Filter & Pencarian Laporan
- ✅ Export Laporan Bulanan ke Excel
- ✅ Export Laporan Bulanan ke PDF
- ✅ Kirim Laporan via WhatsApp ke Orang Tua
- ✅ Dashboard Admin dengan statistik
- ✅ Mobile Responsive

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Hook Form + Zod Validation

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite (lightweight & portable)
- CORS & Security Middleware

### Export & Integration
- ExcelJS (Excel export)
- jsPDF + html2canvas (PDF export)
- WhatsApp Web API (wa.me)

## 📁 Struktur Project

```
les-private-admin/
├── backend/                 # Express API Server
│   ├── src/
│   │   ├── config/         # Database & app config
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   ├── validators/     # Request validation
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Dummy data
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Next.js App
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── dashboard/
│   │   │   ├── siswa/
│   │   │   ├── laporan/
│   │   │   └── layout.tsx
│   │   ├── components/    # Reusable components
│   │   │   ├── ui/       # Base UI components
│   │   │   ├── forms/    # Form components
│   │   │   └── tables/   # Table components
│   │   ├── lib/          # Utilities & API client
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Helper functions
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🗄️ Database Schema

### Tables:
1. **students** - Data siswa
2. **schedules** - Jadwal belajar
3. **daily_reports** - Laporan harian
4. **monthly_summaries** - Ringkasan bulanan (optional)

### Relationships:
- students 1:N daily_reports
- students 1:N schedules

## 🚀 Cara Menjalankan Project

### Prerequisites
- Node.js 18+
- npm atau yarn
- (Tidak perlu install database - SQLite otomatis)

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan database credentials

# Run migrations
npx prisma migrate dev
npx prisma generate

# Seed dummy data
npx prisma db seed

# Start server
npm run dev
# Backend running on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local dengan backend URL

# Start development server
npm run dev
# Frontend running on http://localhost:3000
```

## 📱 Fitur WhatsApp

### Format Nomor
- Input: `081234567890` atau `+6281234567890`
- Output dinormalisasi: `6281234567890`

### Template Pesan
```
Halo Bapak/Ibu [Nama Ortu],

Berikut laporan belajar [Nama Siswa] periode [Bulan Tahun].

Ringkasan:
- Total pertemuan: [X kali]
- Materi: [ringkas]
- Perkembangan: [ringkas]

Terima kasih.
```

### Cara Kerja
1. User klik tombol "Kirim ke WhatsApp"
2. Sistem generate template pesan
3. Browser membuka wa.me dengan pesan pre-filled
4. User tinggal klik Send di WhatsApp

## 📊 API Endpoints

### Students
- `GET /api/students` - List semua siswa
- `GET /api/students/:id` - Detail siswa
- `POST /api/students` - Tambah siswa baru
- `PUT /api/students/:id` - Update siswa
- `DELETE /api/students/:id` - Hapus siswa

### Daily Reports
- `GET /api/reports` - List laporan (dengan filter)
- `GET /api/reports/:id` - Detail laporan
- `POST /api/reports` - Tambah laporan
- `PUT /api/reports/:id` - Update laporan
- `DELETE /api/reports/:id` - Hapus laporan

### Monthly Reports
- `GET /api/reports/monthly/:studentId?month=MM&year=YYYY` - Data laporan bulanan
- `GET /api/reports/export/excel/:studentId?month=MM&year=YYYY` - Download Excel
- `GET /api/reports/export/pdf/:studentId?month=MM&year=YYYY` - Download PDF

### Schedules
- `GET /api/schedules` - List jadwal
- `POST /api/schedules` - Tambah jadwal
- `PUT /api/schedules/:id` - Update jadwal
- `DELETE /api/schedules/:id` - Hapus jadwal

## 🎨 Halaman UI

1. **Login** - Autentikasi guru
2. **Dashboard** - Overview statistik & quick actions
3. **Data Siswa** - Tabel & CRUD siswa
4. **Jadwal** - Calendar view jadwal
5. **Laporan Harian** - Tabel & form input
6. **Laporan Bulanan** - Filter & export options
7. **Form Laporan** - Input laporan dengan validation

## ✅ Validasi Form

- Nama siswa: required, min 3 karakter
- Nomor WA: format Indonesia valid
- Rating (1-5): required, number
- Tanggal: required, format valid
- Materi: required, min 5 karakter

## 👨‍💻 Development Notes

### Best Practices
- Gunakan TypeScript untuk type safety
- Validasi input di frontend dan backend
- Error handling yang proper
- Loading states untuk UX
- Mobile-first responsive design

### Future Enhancements (Next Phase)
- Multi-user authentication (guru & orang tua)
- Dashboard untuk orang tua
- Real-time notifications
- Upload foto kegiatan belajar
- Payment tracking
- Attendance QR code
- Analytics & insights

## 📝 License
Private project for personal use.

## 👤 Author
Guru Les Private SD
