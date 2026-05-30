# 🏗️ Technical Design Document

## Database Schema

### 1. Table: students
Menyimpan data siswa les private.

```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  grade VARCHAR(20) NOT NULL,  -- Kelas: 1 SD, 2 SD, dst
  parent_name VARCHAR(100) NOT NULL,
  parent_whatsapp VARCHAR(20),  -- Format: 6281234567890
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',  -- active | inactive
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_name ON students(name);
```

### 2. Table: schedules
Menyimpan jadwal belajar siswa.

```sql
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,  -- Senin, Selasa, dst
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_student ON schedules(student_id);
CREATE INDEX idx_schedules_day ON schedules(day_of_week);
```

### 3. Table: daily_reports
Menyimpan laporan harian belajar siswa.

```sql
CREATE TABLE daily_reports (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject VARCHAR(100) NOT NULL,  -- Matematika, IPA, Bahasa Indonesia, dst
  topic TEXT NOT NULL,  -- Detail materi yang dipelajari
  enthusiasm_score INTEGER CHECK (enthusiasm_score BETWEEN 1 AND 5),
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 5),
  understanding_score INTEGER CHECK (understanding_score BETWEEN 1 AND 5),
  homework TEXT,
  progress_notes TEXT,
  parent_notes TEXT,
  attendance_status VARCHAR(20) DEFAULT 'present',  -- present | excused | sick | cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_student ON daily_reports(student_id);
CREATE INDEX idx_reports_date ON daily_reports(date);
CREATE INDEX idx_reports_student_date ON daily_reports(student_id, date);
```

### 4. Table: monthly_summaries (Optional - untuk cache)
Menyimpan ringkasan bulanan untuk performa query.

```sql
CREATE TABLE monthly_summaries (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,  -- 1-12
  total_sessions INTEGER DEFAULT 0,
  avg_enthusiasm DECIMAL(3,2),
  avg_focus DECIMAL(3,2),
  avg_understanding DECIMAL(3,2),
  subjects_covered TEXT[],
  summary_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, year, month)
);

CREATE INDEX idx_summaries_student_period ON monthly_summaries(student_id, year, month);
```

## Entity Relationship Diagram

```
┌─────────────────┐
│    students     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ grade           │
│ parent_name     │
│ parent_whatsapp │
│ address         │
│ status          │
│ created_at      │
│ updated_at      │
└─────────────────┘
        │ 1
        │
        │ N
        ├──────────────────┬─────────────────┐
        │                  │                 │
        ▼                  ▼                 ▼
┌─────────────────┐ ┌──────────────────┐ ┌────────────────────┐
│   schedules     │ │  daily_reports   │ │ monthly_summaries  │
├─────────────────┤ ├──────────────────┤ ├────────────────────┤
│ id (PK)         │ │ id (PK)          │ │ id (PK)            │
│ student_id (FK) │ │ student_id (FK)  │ │ student_id (FK)    │
│ day_of_week     │ │ date             │ │ year               │
│ start_time      │ │ start_time       │ │ month              │
│ end_time        │ │ end_time         │ │ total_sessions     │
│ is_active       │ │ subject          │ │ avg_enthusiasm     │
│ created_at      │ │ topic            │ │ avg_focus          │
│ updated_at      │ │ enthusiasm_score │ │ avg_understanding  │
└─────────────────┘ │ focus_score      │ │ subjects_covered   │
                    │ understanding    │ │ summary_notes      │
                    │ homework         │ │ created_at         │
                    │ progress_notes   │ │ updated_at         │
                    │ parent_notes     │ └────────────────────┘
                    │ attendance       │
                    │ created_at       │
                    │ updated_at       │
                    └──────────────────┘
```

## API Specification

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication
```
// Future: JWT Bearer Token
Authorization: Bearer <token>
```

---

### Students Endpoints

#### GET /api/students
Retrieve list of students with optional filters.

**Query Parameters:**
- `status` (optional): `active` | `inactive`
- `search` (optional): Search by name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "grade": "3 SD",
      "parent_name": "Ibu Siti",
      "parent_whatsapp": "6281234567890",
      "address": "Jl. Merdeka No. 10",
      "status": "active",
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "total_pages": 5
  }
}
```

#### GET /api/students/:id
Get single student detail.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "grade": "3 SD",
    "parent_name": "Ibu Siti",
    "parent_whatsapp": "6281234567890",
    "address": "Jl. Merdeka No. 10",
    "status": "active",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

#### POST /api/students
Create new student.

**Request Body:**
```json
{
  "name": "Budi Santoso",
  "grade": "3 SD",
  "parent_name": "Ibu Siti",
  "parent_whatsapp": "081234567890",
  "address": "Jl. Merdeka No. 10",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Siswa berhasil ditambahkan",
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    ...
  }
}
```

#### PUT /api/students/:id
Update student data.

**Request Body:** Same as POST

**Response:** Same as POST

#### DELETE /api/students/:id
Delete student (and cascade to reports).

**Response:**
```json
{
  "success": true,
  "message": "Siswa berhasil dihapus"
}
```

---

### Daily Reports Endpoints

#### GET /api/reports
List daily reports with filters.

**Query Parameters:**
- `student_id` (optional): Filter by student
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year
- `subject` (optional): Filter by subject
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student": {
        "id": 1,
        "name": "Budi Santoso",
        "grade": "3 SD"
      },
      "date": "2026-05-15",
      "start_time": "15:00:00",
      "end_time": "16:30:00",
      "subject": "Matematika",
      "topic": "Perkalian dan Pembagian",
      "enthusiasm_score": 4,
      "focus_score": 4,
      "understanding_score": 3,
      "homework": "Latihan soal hal 25-27",
      "progress_notes": "Mulai paham konsep dasar",
      "parent_notes": "Perlu latihan lebih banyak di rumah",
      "attendance_status": "present",
      "created_at": "2026-05-15T17:00:00Z"
    }
  ],
  "meta": {...}
}
```

#### POST /api/reports
Create new daily report.

**Request Body:**
```json
{
  "student_id": 1,
  "date": "2026-05-15",
  "start_time": "15:00",
  "end_time": "16:30",
  "subject": "Matematika",
  "topic": "Perkalian dan Pembagian",
  "enthusiasm_score": 4,
  "focus_score": 4,
  "understanding_score": 3,
  "homework": "Latihan soal hal 25-27",
  "progress_notes": "Mulai paham konsep dasar",
  "parent_notes": "Perlu latihan lebih banyak",
  "attendance_status": "present"
}
```

#### PUT /api/reports/:id
Update daily report.

#### DELETE /api/reports/:id
Delete daily report.

---

### Monthly Report Endpoints

#### GET /api/reports/monthly/:studentId
Get monthly report summary.

**Query Parameters:**
- `month` (required): 1-12
- `year` (required): YYYY

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 1,
      "name": "Budi Santoso",
      "grade": "3 SD",
      "parent_name": "Ibu Siti",
      "parent_whatsapp": "6281234567890"
    },
    "period": {
      "month": 5,
      "year": 2026,
      "month_name": "Mei"
    },
    "summary": {
      "total_sessions": 12,
      "present": 10,
      "excused": 1,
      "sick": 1,
      "cancelled": 0,
      "avg_enthusiasm": 4.2,
      "avg_focus": 3.8,
      "avg_understanding": 3.5,
      "subjects_covered": ["Matematika", "IPA", "Bahasa Indonesia"]
    },
    "reports": [
      {
        "date": "2026-05-01",
        "subject": "Matematika",
        "topic": "Perkalian",
        "scores": {
          "enthusiasm": 4,
          "focus": 4,
          "understanding": 3
        },
        "homework": "Latihan hal 25",
        "notes": "Mulai paham"
      }
    ],
    "overall_notes": "Budi menunjukkan perkembangan baik..."
  }
}
```

#### GET /api/reports/export/excel/:studentId
Download Excel file.

**Query Parameters:**
- `month` (required)
- `year` (required)

**Response:** File download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

#### GET /api/reports/export/pdf/:studentId
Download PDF file.

**Query Parameters:**
- `month` (required)
- `year` (required)

**Response:** File download (application/pdf)

---

### Schedules Endpoints

#### GET /api/schedules
List schedules.

**Query Parameters:**
- `student_id` (optional)
- `day_of_week` (optional)

#### POST /api/schedules
Create schedule.

**Request Body:**
```json
{
  "student_id": 1,
  "day_of_week": "Senin",
  "start_time": "15:00",
  "end_time": "16:30",
  "is_active": true
}
```

#### PUT /api/schedules/:id
Update schedule.

#### DELETE /api/schedules/:id
Delete schedule.

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data tidak valid",
    "details": [
      {
        "field": "parent_whatsapp",
        "message": "Format nomor WhatsApp tidak valid"
      }
    ]
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Duplicate data
- `SERVER_ERROR`: Internal server error
- `UNAUTHORIZED`: Authentication required

---

## WhatsApp Integration

### Function: normalizeWhatsAppNumber()

**Input Examples:**
- `081234567890` → `6281234567890`
- `+6281234567890` → `6281234567890`
- `6281234567890` → `6281234567890`
- `08123456789` → `628123456789`

**Validation:**
- Must be 10-13 digits after normalization
- Must start with 62 after normalization
- Remove all non-numeric characters except leading +

### Function: generateMonthlyReportWhatsAppMessage()

**Parameters:**
- `studentName`: string
- `parentName`: string
- `teacherName`: string
- `month`: string (e.g., "Mei")
- `year`: number
- `totalSessions`: number
- `subjectsSummary`: string
- `progressSummary`: string

**Output:**
```
Halo Bapak/Ibu [Parent Name],

Berikut saya kirimkan laporan belajar [Student Name] untuk periode [Month Year].

Ringkasan:
- Total pertemuan: [X kali]
- Materi yang dipelajari: [subjects]
- Perkembangan: [progress]

File laporan lengkap akan dikirim melalui email/dapat diunduh di link berikut.

Terima kasih.
[Teacher Name]
```

### WhatsApp Link Format

```
https://wa.me/6281234567890?text=Halo%20Bapak%2FIbu...
```

URL encoding dilakukan otomatis dengan `encodeURIComponent()`.

---

## Folder Structure

```
les-private-admin/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts         # Prisma client setup
│   │   │   └── env.ts              # Environment variables
│   │   │
│   │   ├── controllers/
│   │   │   ├── studentController.ts
│   │   │   ├── reportController.ts
│   │   │   ├── scheduleController.ts
│   │   │   └── exportController.ts
│   │   │
│   │   ├── services/
│   │   │   ├── studentService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── scheduleService.ts
│   │   │   ├── exportExcelService.ts
│   │   │   └── exportPdfService.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── index.ts            # Main router
│   │   │   ├── studentRoutes.ts
│   │   │   ├── reportRoutes.ts
│   │   │   ├── scheduleRoutes.ts
│   │   │   └── exportRoutes.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── whatsapp.ts         # WA utilities
│   │   │   ├── validators.ts       # Custom validators
│   │   │   ├── errorHandler.ts     # Error handling
│   │   │   └── response.ts         # Response formatter
│   │   │
│   │   ├── validators/
│   │   │   ├── studentValidator.ts
│   │   │   └── reportValidator.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript types
│   │   │
│   │   └── index.ts                # Express app entry
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── siswa/
│   │   │   │   ├── page.tsx        # List siswa
│   │   │   │   ├── tambah/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── jadwal/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── laporan/
│   │   │   │   ├── page.tsx        # List laporan
│   │   │   │   ├── tambah/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── bulanan/
│   │   │   │   │   └── page.tsx    # Laporan bulanan
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── layout.tsx          # Main layout
│   │   │   └── page.tsx            # Home redirect
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── StudentForm.tsx
│   │   │   │   ├── ReportForm.tsx
│   │   │   │   └── ScheduleForm.tsx
│   │   │   │
│   │   │   ├── tables/
│   │   │   │   ├── StudentTable.tsx
│   │   │   │   ├── ReportTable.tsx
│   │   │   │   └── DataTable.tsx   # Generic
│   │   │   │
│   │   │   └── modals/
│   │   │       ├── ConfirmDialog.tsx
│   │   │       └── WhatsAppPreview.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts              # API client (axios)
│   │   │   ├── utils.ts            # Helper functions
│   │   │   └── constants.ts        # Constants
│   │   │
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript types
│   │   │
│   │   └── utils/
│   │       ├── whatsapp.ts         # WA utilities
│   │       ├── export.ts           # Export helpers
│   │       └── formatters.ts       # Date, number formatters
│   │
│   ├── public/
│   │   ├── logo.png
│   │   └── ...
│   │
│   ├── .env.local.example
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── TECHNICAL_DESIGN.md
```

---

## Implementation Roadmap

### Phase 1: MVP Core (Week 1-2)
1. ✅ Setup project structure
2. ✅ Database schema & migrations
3. ✅ Backend API (CRUD students, reports)
4. ✅ Frontend basic pages
5. ✅ Form validation
6. ✅ Responsive design

### Phase 2: Export & WhatsApp (Week 3)
1. ✅ Excel export functionality
2. ✅ PDF export functionality
3. ✅ WhatsApp integration
4. ✅ Seed dummy data
5. ✅ Testing & bug fixes

### Phase 3: Polish & Deploy (Week 4)
1. Error handling improvements
2. Loading states & UX polish
3. Documentation
4. Deployment setup
5. User acceptance testing

### Future Enhancements
- Authentication & authorization
- Parent dashboard (read-only access)
- Photo upload for activities
- Payment tracking
- Push notifications
- Mobile app (React Native)

---

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Use ESLint + Prettier
- Follow Airbnb style guide
- Use meaningful variable names
- Add comments only for complex logic

### Git Workflow
```
main
 ├── develop
 │    ├── feature/student-crud
 │    ├── feature/report-crud
 │    └── feature/export-excel
 └── hotfix/*
```

### Testing Strategy
- Unit tests for utilities & services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual testing for UI/UX

---

## Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate on both frontend & backend
- Use parameterized queries (Prisma handles this)

### Data Protection
- No sensitive data in logs
- Secure environment variables
- HTTPS in production
- CORS whitelist

### Future: Authentication
- JWT with refresh tokens
- Password hashing (bcrypt)
- Rate limiting
- Session management

---

## Performance Optimization

### Database
- Proper indexing on foreign keys & filters
- Pagination for large datasets
- Caching for monthly summaries

### Frontend
- Next.js image optimization
- Code splitting & lazy loading
- Debounced search inputs
- Optimistic UI updates

### Backend
- Response compression (gzip)
- Query optimization
- Connection pooling
- Caching layer (Redis - future)

---

## Monitoring & Logging

### Development
- Console logs
- Error stack traces
- API request/response logging

### Production (Future)
- Application logs (Winston)
- Error tracking (Sentry)
- Performance monitoring
- Database query monitoring

---

## Deployment

### Backend
- Platform: Railway / Render / Fly.io
- Database: Supabase / Railway PostgreSQL
- Environment: Node.js 18+

### Frontend
- Platform: Vercel / Netlify
- Environment: Next.js production build
- CDN for static assets

### CI/CD (Future)
- GitHub Actions
- Automated tests
- Automated deployment on merge to main

---

## Support & Maintenance

### Documentation
- Keep README updated
- API documentation (Swagger - future)
- User manual for non-technical users

### Backup Strategy
- Daily database backups
- Backup retention: 30 days
- Restore testing monthly

### Update Schedule
- Security patches: immediate
- Dependency updates: monthly
- Feature releases: bi-weekly

