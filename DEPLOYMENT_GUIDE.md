# 🚀 Deployment Guide - Rafika's Class

## Deploy ke Cloud (Vercel + Railway)

### 📋 Prerequisites
- Akun GitHub (sudah ada ✅)
- Akun Vercel (gratis) - daftar di https://vercel.com
- Akun Railway (gratis) - daftar di https://railway.app

---

## 🔧 Step 1: Deploy Backend ke Railway

### 1.1 Daftar Railway
1. Buka https://railway.app
2. Klik "Start a New Project"
3. Login dengan GitHub
4. Klik "Deploy from GitHub repo"
5. Pilih repository: `rafikary/rafika-s-class`

### 1.2 Setup PostgreSQL Database
1. Di Railway dashboard, klik "+ New"
2. Pilih "Database" → "PostgreSQL"
3. Database akan otomatis dibuat
4. Copy **DATABASE_URL** (akan muncul di Variables tab)

### 1.3 Configure Backend Service
1. Klik "+ New" lagi
2. Pilih "GitHub Repo" → pilih `rafika-s-class`
3. Railway akan auto-detect Node.js
4. Di **Settings**:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`

5. Di **Variables**, tambahkan:
   ```
   DATABASE_URL=<paste dari PostgreSQL database>
   NODE_ENV=production
   PORT=5000
   ```

6. Klik **Deploy**
7. Copy **Public Domain URL** (misal: `https://rafika-backend.railway.app`)

---

## 🌐 Step 2: Deploy Frontend ke Vercel

### 2.1 Daftar Vercel
1. Buka https://vercel.com
2. Klik "Sign Up" → Login dengan GitHub
3. Klik "Add New..." → "Project"
4. Import repository: `rafikary/rafika-s-class`

### 2.2 Configure Frontend
1. Framework Preset: **Next.js** (auto-detect)
2. Root Directory: `frontend`
3. Build Command: `npm run build` (default)
4. Output Directory: `.next` (default)

5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://rafika-backend.railway.app
   ```
   (Ganti dengan URL Railway backend Anda)

6. Klik **Deploy**
7. Tunggu ~2 menit
8. Copy **Domain URL** (misal: `https://rafika-class.vercel.app`)

---

## ✅ Step 3: Testing

### 3.1 Test Backend
Buka: `https://rafika-backend.railway.app/api/health`

Harus return:
```json
{
  "success": true,
  "message": "API is running"
}
```

### 3.2 Test Frontend
Buka: `https://rafika-class.vercel.app`

Harus bisa:
- ✅ Lihat dashboard
- ✅ Tambah siswa
- ✅ Input laporan
- ✅ Lihat keuangan

---

## 🔄 Update/Redeploy

### Cara Update Code:
1. Edit code di laptop
2. Commit & push ke GitHub:
   ```bash
   git add .
   git commit -m "Update: ..."
   git push
   ```
3. **Otomatis deploy!**
   - Railway: auto-redeploy backend
   - Vercel: auto-redeploy frontend

---

## 🗄️ Database Migration

### Setelah Edit Schema:
1. Update `backend/prisma/schema.prisma`
2. Commit & push
3. Railway otomatis run migration

### Manual Migration (kalau perlu):
Railway dashboard → Backend service → "Open Terminal":
```bash
npx prisma migrate deploy
```

---

## 📊 Seed Data (First Time Setup)

Setelah deploy pertama kali:

1. Railway → Backend service → Variables
2. Tambahkan script seed ke `package.json` backend
3. Railway → Open Terminal:
   ```bash
   npm run seed
   ```

---

## 🆓 Free Tier Limits

### Railway (Free):
- ✅ 500 execution hours/month (~16 jam/hari)
- ✅ PostgreSQL database included
- ✅ Otomatis sleep kalau tidak dipakai
- ✅ Wake up otomatis saat diakses

### Vercel (Free):
- ✅ Unlimited bandwidth
- ✅ Auto SSL
- ✅ Edge network global
- ✅ Unlimited deploys

---

## 🔒 Security Notes

### Environment Variables
- ❌ JANGAN commit `.env` ke GitHub
- ✅ Set semua secret di Railway/Vercel dashboard
- ✅ Gunakan `.env.example` sebagai template

### CORS
Backend sudah configured untuk accept request dari:
- Vercel domain
- localhost (development)

---

## 🐛 Troubleshooting

### Backend Error 500:
1. Check Railway logs: Dashboard → Backend → Logs
2. Biasanya: database connection issue
3. Pastikan `DATABASE_URL` correct

### Frontend API Error:
1. Check `NEXT_PUBLIC_API_URL` di Vercel
2. Pastikan tidak ada trailing slash: ❌ `.../api/` ✅ `.../`
3. Check CORS di backend

### Database Migration Failed:
1. Railway → PostgreSQL → Query
2. Check tables ada atau tidak
3. Manual run: `npx prisma migrate deploy`

---

## 📱 Access dari Device Lain

Setelah deploy:
- 📱 **HP**: Buka `https://rafika-class.vercel.app` di browser
- 💻 **Laptop**: Buka URL yang sama
- 📲 **Tablet**: Buka URL yang sama

Bookmark atau "Add to Home Screen" untuk akses cepat!

---

## 💰 Cost Estimate

**Total: Rp 0/bulan** (Free tier)

Upgrade kalau:
- Railway > 500 jam/bulan → ~$5/bulan
- Butuh custom domain → ~$10/tahun (Namecheap)

---

## 🔄 Backup Data

### Export Data (PostgreSQL):
Railway → PostgreSQL service → "Data" tab → Export to CSV

### Backup Otomatis:
Railway otomatis backup database daily (retained 7 hari)

---

## 📞 Support

Butuh bantuan? Contact:
- Railway Discord: https://discord.gg/railway
- Vercel Discord: https://discord.gg/vercel

---

**Happy Deploying! 🚀**
