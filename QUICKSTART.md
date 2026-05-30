# 📋 Quick Start Commands

Panduan singkat untuk menjalankan project.

## 🏃‍♂️ Langkah Cepat

### 1. Setup Backend
```bash
cd backend
npm install
copy .env.example .env
# Tidak perlu edit .env - SQLite langsung jalan!

npx prisma generate
npx prisma migrate dev
npx prisma db seed

npm run dev
```

Backend running di: http://localhost:5000

### 3. Setup Frontend (Terminal Baru)
```bash
cd frontend
npm install
copy .env.local.example .env.local

npm run dev
```

Frontend running di: http://localhost:3000

## ✅ Tes Aplikasi

1. Buka http://localhost:3000
2. Dashboard akan menampilkan data dummy
3. Coba tambah siswa baru
4. Coba input laporan harian
5. Coba export laporan bulanan
6. Coba kirim ke WhatsApp

## 🔑 Login (Future Feature)

Saat ini aplikasi tidak ada autentikasi.
Langsung akses semua fitur admin.

## 📝 Fitur Utama

✅ CRUD Siswa
✅ CRUD Laporan Harian  
✅ Filter & Search
✅ Laporan Bulanan dengan Rekap
✅ Export ke Excel
✅ Kirim via WhatsApp
✅ Mobile Responsive

## 🚫 Stop Server

Backend: `Ctrl + C` di terminal backend
Frontend: `Ctrl + C` di terminal frontend

## 🔄 Run Lagi Besok

Tinggal jalankan 2 command ini (di 2 terminal berbeda):

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

## 🎯 URL Penting

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Prisma Studio: `npx prisma studio` (dari folder backend)

## 📞 Kontak Support

Jika ada error, cek:
1. PostgreSQL service running
2. File `.env` sudah benar
3. Port 5000 dan 3000 tidak dipakai aplikasi lain
4. Node.js minimal versi 18

---

**Happy Coding! 🚀**
