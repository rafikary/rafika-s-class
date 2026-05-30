# 📚 Rafika's Class - Admin Les Private SD

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)

**Web application modern untuk manajemen les private anak SD dengan fitur lengkap keuangan, laporan, dan integrasi WhatsApp.**

[Demo](#) • [Dokumentasi](#) • [API](#-api-endpoints)

</div>

---

## ✨ Fitur Utama

### 🎓 Manajemen Siswa
- ✅ **CRUD Data Siswa** - Kelola data siswa dengan lengkap (nama, kelas, orang tua, nomor WA, alamat, status)
- ✅ **Tarif Per Siswa** - Set tarif berbeda untuk setiap siswa
- ✅ **Status Aktif/Nonaktif** - Tracking status siswa

### 📅 Jadwal & Laporan
- ✅ **CRUD Jadwal Belajar** - Atur jadwal per hari dengan waktu mulai & selesai
- ✅ **Input Laporan Harian** - Catat materi, topik, pekerjaan rumah, catatan kemajuan
- ✅ **Rating Bintang** - Sistem rating visual dengan bintang untuk semangat, fokus, dan pemahaman (1-5 bintang)
- ✅ **Status Kehadiran** - Track kehadiran siswa (Hadir/Tidak Hadir/Izin)
- ✅ **Status Pembayaran** - Track status pembayaran per pertemuan

### 💰 Manajemen Keuangan
- ✅ **Dashboard Pendapatan** - Lihat pendapatan bulan ini otomatis dari absensi × tarif
- ✅ **Breakdown Per Siswa** - Detail pendapatan per siswa di dashboard
- ✅ **Laporan Keuangan Lengkap** - Halaman khusus financial report dengan:
  - Total pendapatan (sudah + belum diambil)
  - Pendapatan yang sudah diambil/masuk bank
  - Pendapatan belum dibayar orang tua
  - Breakdown detail per siswa
  - Bulk mark as paid untuk multiple pertemuan sekaligus
  
### 📊 Export & Integrasi
- ✅ **Export Excel** - Laporan bulanan professional dengan formatting
- ✅ **Kirim via WhatsApp** - Integrasi WhatsApp Web dengan template pesan

### 🎨 Modern UI/UX
- ✅ **Gradient Design** - Modern gradient sidebar, cards, dan buttons
- ✅ **Responsive Mobile** - Fully responsive untuk semua device
- ✅ **Animated Elements** - Smooth transitions dan hover effects
- ✅ **Professional Branding** - Logo dengan GraduationCap icon dan "Rafika's Class" branding
- ✅ **Dark Sidebar** - Elegant dark gradient sidebar dengan animated menu items

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14.2.3 (App Router)
- **Language:** TypeScript 5.4.5
- **Styling:** Tailwind CSS 3.4.3
- **UI Components:** Custom component library with modern design
- **Icons:** Lucide React 0.372.0
- **Validation:** Zod 3.23.4
- **HTTP Client:** Axios 1.6.8
- **Date Utilities:** date-fns 3.6.0

### Backend
- **Framework:** Express 4.19.2
- **Language:** TypeScript 5.4.5
- **ORM:** Prisma 5.12.0
- **Database:** SQLite (portable & lightweight)
- **Security:** Helmet, CORS
- **Logging:** Morgan
- **Validation:** Zod 3.23.4

### Export & Integration
- **Excel:** ExcelJS 4.4.0 (professional formatting)
- **WhatsApp:** WhatsApp Web API (wa.me)

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

#### 1. **students** - Data Siswa
```typescript
{
  id: string (UUID)
  name: string
  grade: string
  parentName: string
  parentWhatsapp: string
  address: string
  tarif: number          // NEW: Tarif per sesi untuk setiap siswa
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 2. **schedules** - Jadwal Belajar
```typescript
{
  id: string (UUID)
  studentId: string (FK)
  dayOfWeek: string ('Senin', 'Selasa', dll)
  startTime: string ('14:00')
  endTime: string ('16:00')
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 3. **daily_reports** - Laporan Harian
```typescript
{
  id: string (UUID)
  studentId: string (FK)
  date: DateTime
  startTime: string
  endTime: string
  subject: string
  topic: string
  enthusiasmScore: number (1-5)     // Rating bintang
  focusScore: number (1-5)          // Rating bintang
  understandingScore: number (1-5)  // Rating bintang
  homework: string
  progressNotes: string
  parentNotes: string
  attendanceStatus: 'Hadir' | 'Tidak Hadir' | 'Izin'
  paymentStatus: 'Lunas' | 'Belum Bayar'  // NEW: Track pembayaran
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Relationships:
- `students` 1:N `daily_reports`
- `students` 1:N `schedules`

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
- `GET /api/students` - List semua siswa dengan pagination & search
- `GET /api/students/:id` - Detail siswa by ID
- `POST /api/students` - Tambah siswa baru (include tarif)
- `PUT /api/students/:id` - Update data siswa
- `DELETE /api/students/:id` - Hapus siswa (soft delete)

### Daily Reports
- `GET /api/reports` - List laporan dengan filter (studentId, month, year, status)
- `GET /api/reports/:id` - Detail laporan by ID
- `POST /api/reports` - Tambah laporan harian (include attendance & payment status)
- `PUT /api/reports/:id` - Update laporan
- `DELETE /api/reports/:id` - Hapus laporan

### Monthly Reports & Export
- `GET /api/reports/monthly/:studentId?month=MM&year=YYYY` - Data laporan bulanan untuk 1 siswa
- `GET /api/reports/export/excel/:studentId?month=MM&year=YYYY` - Download laporan Excel dengan professional formatting

### Schedules
- `GET /api/schedules` - List jadwal semua siswa
- `GET /api/schedules?studentId=xxx` - List jadwal by student
- `POST /api/schedules` - Tambah jadwal baru
- `PUT /api/schedules/:id` - Update jadwal
- `DELETE /api/schedules/:id` - Hapus jadwal

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics:
  - Total students (active/inactive)
  - Total reports (all time + this month)
  - **Income this month** (auto calculated from attendance × tarif)
  - **Income breakdown per student** (sessions count + total income per student)
  
- `GET /api/dashboard/recent-reports?limit=5` - Get recent reports for dashboard

### Financial Reports (NEW)
- `GET /api/financial/report?month=MM&year=YYYY` - Comprehensive financial report:
  - Summary: totalRevenue, totalPaid, totalUnpaid
  - Breakdown per student with payment details
  
- `PUT /api/financial/payment/:reportId` - Update payment status single report

- `PUT /api/financial/payment/bulk` - Mark multiple reports as paid:
  ```json
  {
    "reportIds": ["id1", "id2", "id3"]
  }
  ```

### Health Check
- `GET /api/health` - API health status

## 🎨 Halaman UI

### 📊 Dashboard (/)
- **Statistics Cards** dengan gradient design:
  - Total siswa (aktif/tidak aktif)
  - Laporan bulan ini
  - **Pendapatan bulan ini** (auto calculated)
  - Total laporan all time
- **Quick Actions** - Shortcut untuk tambah siswa, input laporan, lihat laporan bulanan
- **Income Breakdown Table** - Detail pendapatan per siswa bulan ini (tarif, jumlah hadir, total)
- **Recent Reports** - 5 laporan terbaru dengan star ratings

### 👥 Data Siswa (/siswa)
- **List View** - Tabel siswa dengan search & filter
- **Add Student** (/siswa/tambah) - Form tambah siswa baru (include tarif field)
- **Edit Student** - Update data siswa
- **Delete Student** - Hapus siswa dengan confirmation

### 📅 Jadwal (/jadwal)
- **Schedule View** - Jadwal per hari dengan detail waktu
- **Add/Edit Schedule** - Kelola jadwal per siswa

### 📝 Laporan (/laporan)
- **List View** - Tabel laporan dengan filter (bulan, tahun, siswa, status)
- **Add Report** (/laporan/tambah) - Form input laporan harian:
  - Pilih siswa, tanggal, waktu
  - Materi & topik pelajaran
  - **Star Rating** (1-5 bintang) untuk semangat, fokus, pemahaman
  - Pekerjaan rumah & catatan kemajuan
  - Catatan untuk orang tua
  - Status kehadiran & pembayaran
- **Monthly Report** (/laporan/bulanan) - Filter & export laporan bulanan:
  - Pilih siswa, bulan, tahun
  - Preview laporan
  - Download Excel dengan professional formatting
  - Kirim ke WhatsApp orang tua

### 💰 Keuangan (/laporan/keuangan) - NEW
- **Summary Cards**:
  - Total pendapatan (all)
  - Sudah diambil/masuk bank
  - Belum dibayar orang tua
- **Breakdown Per Siswa**:
  - Tabel detail per siswa dengan tarif, jumlah pertemuan, status pembayaran
  - Checkbox untuk select multiple pertemuan
  - Bulk action: Mark as Paid untuk multiple selection
- **Filter**: Pilih bulan & tahun untuk lihat data periode tertentu

## ✅ Validasi Form

- Nama siswa: required, min 3 karakter
- Nomor WA: format Indonesia valid
- Rating (1-5): required, number
- Tanggal: required, format valid
- Materi: required, min 5 karakter

## 👨‍💻 Development Notes

### Architecture
- **Clean Separation**: Controllers → Services → Prisma ORM
- **Type Safety**: Full TypeScript dengan strict mode
- **Modern React**: Hooks, Context, Server/Client Components
- **Responsive**: Mobile-first Tailwind CSS design

### Best Practices
- ✅ TypeScript untuk type safety di frontend & backend
- ✅ Validation di frontend (Zod) dan backend (Zod)
- ✅ Error handling dengan proper HTTP status codes
- ✅ Loading states untuk better UX
- ✅ Optimistic updates untuk feel responsive
- ✅ Modern gradient UI dengan smooth animations
- ✅ Accessible components (keyboard navigation, ARIA)

### Performance Optimizations
- Server-side data fetching dengan Next.js 14
- Efficient database queries dengan Prisma
- Lazy loading untuk heavy components
- Optimized images dengan Next.js Image

### Deployment Ready
- Environment variables untuk config
- Production build optimization
- SQLite database (portable, no setup)
- CORS configured untuk production URLs

## 🚀 Future Enhancements

### Phase 2 - Authentication & Multi-User
- [ ] Login system untuk guru & orang tua
- [ ] Dashboard khusus orang tua (read-only)
- [ ] Role-based access control (RBAC)

### Phase 3 - Advanced Features
- [ ] Real-time notifications (WebSocket/Pusher)
- [ ] Upload foto kegiatan belajar (AWS S3 / Cloudinary)
- [ ] Calendar view yang lebih interaktif
- [ ] Attendance tracking dengan QR code
- [ ] Mobile app (React Native / Flutter)

### Phase 4 - Analytics & AI
- [ ] Analytics dashboard dengan charts (Recharts/Victory)
- [ ] Student performance insights & trends
- [ ] AI-powered recommendations untuk materi belajar
- [ ] Predictive analytics untuk kebutuhan siswa

### Phase 5 - Integration & Automation
- [ ] WhatsApp Business API (automated messages)
- [ ] Email notifications (SendGrid/Mailgun)
- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Google Calendar sync
- [ ] Automated monthly report generation

## 🎯 Known Issues & Limitations

### Current Limitations:
- WhatsApp integration hanya via wa.me (manual send)
- Single user (belum ada authentication)
- SQLite untuk development (consider PostgreSQL untuk production scale)
- Excel export limited to client-side generation

### Planned Fixes:
- Implement proper authentication
- Add data backup & restore feature
- Improve Excel export dengan server-side generation
- Add unit tests & integration tests

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Modern gradient dashboard dengan income tracking dan recent reports*

### Data Siswa
![Students](docs/screenshots/students.png)
*Student management dengan tarif field*

### Input Laporan
![Report Form](docs/screenshots/report-form.png)
*Laporan harian dengan star rating system*

### Laporan Keuangan
![Financial](docs/screenshots/financial.png)
*Comprehensive financial report dengan breakdown per siswa*

## 🤝 Contributing

This is a private project. For internal use only.

## 📝 Changelog

### Version 2.0.0 (Latest)
- ✨ Major UI modernization dengan gradient design
- ✨ Added tarif field per student
- ✨ Auto income calculation di dashboard
- ✨ Income breakdown per student
- ✨ Star rating system (clickable 1-5 stars)
- ✨ Financial report page dengan paid/unpaid tracking
- ✨ Bulk mark as paid functionality
- 🎨 Modern "Rafika's Class" branding dengan GraduationCap icon
- 🎨 Gradient sidebar dengan dark theme
- 🎨 Improved cards dengan shadows & hover effects
- 🎨 Gradient buttons dengan better animations

### Version 1.0.0
- ✅ Initial MVP release
- ✅ CRUD students, schedules, reports
- ✅ Excel export
- ✅ WhatsApp integration
- ✅ Basic dashboard

## 📝 License

This project is private and proprietary.  
© 2026 Rafika's Class. All rights reserved.

## 👤 Author

**Bu Rafika**  
Guru Les Private SD  
📧 Contact: [Your contact info]

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.12-2d3748.svg)

</div>
