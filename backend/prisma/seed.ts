import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.dailyReport.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.student.deleteMany();

  // Create students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: 'Budi Santoso',
        grade: '3 SD',
        parentName: 'Ibu Siti Rahayu',
        parentWhatsapp: '081234567890',
        address: 'Jl. Merdeka No. 10, Jakarta',
        tarif: 150000,
        status: 'active',
      },
    }),
    prisma.student.create({
      data: {
        name: 'Ani Wijaya',
        grade: '4 SD',
        parentName: 'Bapak Ahmad Wijaya',
        parentWhatsapp: '082345678901',
        address: 'Jl. Sudirman No. 25, Jakarta',
        tarif: 125000,
        status: 'active',
      },
    }),
    prisma.student.create({
      data: {
        name: 'Cahaya Putri',
        grade: '2 SD',
        parentName: 'Ibu Dewi Lestari',
        parentWhatsapp: '083456789012',
        address: 'Jl. Gatot Subroto No. 5, Jakarta',
        tarif: 175000,
        status: 'active',
      },
    }),
    prisma.student.create({
      data: {
        name: 'Dimas Prasetyo',
        grade: '5 SD',
        parentName: 'Bapak Hendra Prasetyo',
        parentWhatsapp: '084567890123',
        address: 'Jl. Thamrin No. 15, Jakarta',
        tarif: 100000,
        status: 'active',
      },
    }),
    prisma.student.create({
      data: {
        name: 'Eka Permata',
        grade: '3 SD',
        parentName: 'Ibu Linda Permata',
        parentWhatsapp: '085678901234',
        address: 'Jl. Diponegoro No. 30, Jakarta',
        tarif: 150000,
        status: 'inactive',
      },
    }),
  ]);

  console.log(`✅ Created ${students.length} students`);

  // Create schedules
  const schedules = await Promise.all([
    prisma.schedule.create({
      data: {
        studentId: students[0].id, // Budi
        dayOfWeek: 'Senin',
        startTime: '15:00',
        endTime: '16:30',
        isActive: true,
      },
    }),
    prisma.schedule.create({
      data: {
        studentId: students[0].id, // Budi
        dayOfWeek: 'Rabu',
        startTime: '15:00',
        endTime: '16:30',
        isActive: true,
      },
    }),
    prisma.schedule.create({
      data: {
        studentId: students[1].id, // Ani
        dayOfWeek: 'Selasa',
        startTime: '16:00',
        endTime: '17:30',
        isActive: true,
      },
    }),
    prisma.schedule.create({
      data: {
        studentId: students[1].id, // Ani
        dayOfWeek: 'Kamis',
        startTime: '16:00',
        endTime: '17:30',
        isActive: true,
      },
    }),
    prisma.schedule.create({
      data: {
        studentId: students[2].id, // Cahaya
        dayOfWeek: 'Senin',
        startTime: '13:00',
        endTime: '14:30',
        isActive: true,
      },
    }),
    prisma.schedule.create({
      data: {
        studentId: students[3].id, // Dimas
        dayOfWeek: 'Jumat',
        startTime: '15:00',
        endTime: '16:30',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${schedules.length} schedules`);

  // Create daily reports for May 2026
  const reports = await Promise.all([
    // Budi - Week 1
    prisma.dailyReport.create({
      data: {
        studentId: students[0].id,
        date: new Date('2026-05-05'),
        startTime: '15:00',
        endTime: '16:30',
        subject: 'Matematika',
        topic: 'Perkalian dan Pembagian Bilangan',
        enthusiasmScore: 4,
        focusScore: 4,
        understandingScore: 3,
        homework: 'Latihan soal perkalian halaman 25-27',
        progressNotes: 'Budi mulai paham konsep perkalian dasar',
        parentNotes: 'Perlu latihan lebih banyak untuk pembagian',
        attendanceStatus: 'present',
      },
    }),
    prisma.dailyReport.create({
      data: {
        studentId: students[0].id,
        date: new Date('2026-05-07'),
        startTime: '15:00',
        endTime: '16:30',
        subject: 'Bahasa Indonesia',
        topic: 'Membaca dan Memahami Cerita Pendek',
        enthusiasmScore: 5,
        focusScore: 4,
        understandingScore: 4,
        homework: 'Baca cerita "Kancil dan Buaya" dan jawab pertanyaan',
        progressNotes: 'Sangat antusias saat membaca cerita',
        parentNotes: 'Terus dorong minat baca di rumah',
        attendanceStatus: 'present',
      },
    }),
    // Budi - Week 2
    prisma.dailyReport.create({
      data: {
        studentId: students[0].id,
        date: new Date('2026-05-12'),
        startTime: '15:00',
        endTime: '16:30',
        subject: 'IPA',
        topic: 'Bagian-bagian Tumbuhan dan Fungsinya',
        enthusiasmScore: 4,
        focusScore: 3,
        understandingScore: 4,
        homework: 'Gambar dan beri label bagian tumbuhan',
        progressNotes: 'Paham materi dengan baik',
        parentNotes: 'Bisa diajak mengamati tanaman di rumah',
        attendanceStatus: 'present',
      },
    }),
    prisma.dailyReport.create({
      data: {
        studentId: students[0].id,
        date: new Date('2026-05-14'),
        startTime: '15:00',
        endTime: '16:30',
        subject: 'Matematika',
        topic: 'Pecahan Sederhana',
        enthusiasmScore: 3,
        focusScore: 3,
        understandingScore: 3,
        homework: 'Latihan soal pecahan halaman 35-37',
        progressNotes: 'Perlu penjelasan ulang untuk pecahan',
        parentNotes: 'Mohon bantu latihan di rumah dengan benda konkret',
        attendanceStatus: 'present',
      },
    }),
    // Ani - Week 1
    prisma.dailyReport.create({
      data: {
        studentId: students[1].id,
        date: new Date('2026-05-06'),
        startTime: '16:00',
        endTime: '17:30',
        subject: 'Matematika',
        topic: 'Kelipatan dan Faktor Bilangan',
        enthusiasmScore: 5,
        focusScore: 5,
        understandingScore: 5,
        homework: 'Latihan soal halaman 42-44',
        progressNotes: 'Ani sangat cepat menangkap materi',
        parentNotes: 'Prestasi sangat baik, pertahankan!',
        attendanceStatus: 'present',
      },
    }),
    prisma.dailyReport.create({
      data: {
        studentId: students[1].id,
        date: new Date('2026-05-08'),
        startTime: '16:00',
        endTime: '17:30',
        subject: 'Bahasa Inggris',
        topic: 'Family Members Vocabulary',
        enthusiasmScore: 5,
        focusScore: 4,
        understandingScore: 5,
        homework: 'Buat family tree dan label dalam bahasa Inggris',
        progressNotes: 'Vocabulary sangat baik',
        parentNotes: 'Bisa ditambah latihan conversation',
        attendanceStatus: 'present',
      },
    }),
    // Ani - Week 2
    prisma.dailyReport.create({
      data: {
        studentId: students[1].id,
        date: new Date('2026-05-13'),
        startTime: '16:00',
        endTime: '17:30',
        subject: 'IPA',
        topic: 'Sumber Energi dan Kegunaannya',
        enthusiasmScore: 4,
        focusScore: 4,
        understandingScore: 4,
        homework: 'Buat daftar sumber energi di rumah',
        progressNotes: 'Paham dan bisa memberikan contoh',
        parentNotes: 'Anak sangat kritis dan banyak bertanya',
        attendanceStatus: 'present',
      },
    }),
    prisma.dailyReport.create({
      data: {
        studentId: students[1].id,
        date: new Date('2026-05-15'),
        startTime: '16:00',
        endTime: '17:30',
        subject: 'Matematika',
        topic: 'Pengukuran Waktu',
        enthusiasmScore: 5,
        focusScore: 5,
        understandingScore: 4,
        homework: 'Latihan soal cerita tentang waktu',
        progressNotes: 'Sangat aktif dan semangat',
        parentNotes: 'Terus berikan soal tantangan',
        attendanceStatus: 'present',
      },
    }),
    // Cahaya - Week 1
    prisma.dailyReport.create({
      data: {
        studentId: students[2].id,
        date: new Date('2026-05-05'),
        startTime: '13:00',
        endTime: '14:30',
        subject: 'Matematika',
        topic: 'Penjumlahan dan Pengurangan 1-100',
        enthusiasmScore: 3,
        focusScore: 2,
        understandingScore: 3,
        homework: 'Latihan penjumlahan halaman 18-20',
        progressNotes: 'Perlu bimbingan ekstra, mudah teralihkan',
        parentNotes: 'Cari waktu belajar yang lebih fokus',
        attendanceStatus: 'present',
      },
    }),
    prisma.dailyReport.create({
      data: {
        studentId: students[2].id,
        date: new Date('2026-05-12'),
        startTime: '13:00',
        endTime: '14:30',
        subject: 'Bahasa Indonesia',
        topic: 'Menyusun Kalimat Sederhana',
        enthusiasmScore: 4,
        focusScore: 3,
        understandingScore: 3,
        homework: 'Buat 5 kalimat tentang kegiatan sehari-hari',
        progressNotes: 'Lebih fokus hari ini',
        parentNotes: 'Terus latih membaca dan menulis',
        attendanceStatus: 'present',
      },
    }),
    // Dimas - Week 1
    prisma.dailyReport.create({
      data: {
        studentId: students[3].id,
        date: new Date('2026-05-09'),
        startTime: '15:00',
        endTime: '16:30',
        subject: 'Matematika',
        topic: 'Operasi Hitung Campuran',
        enthusiasmScore: 4,
        focusScore: 4,
        understandingScore: 4,
        homework: 'Latihan soal cerita halaman 55-58',
        progressNotes: 'Pemahaman bagus, perlu latihan rutin',
        parentNotes: 'Dimas siap untuk materi yang lebih menantang',
        attendanceStatus: 'present',
      },
    }),
    prisma.dailyReport.create({
      data: {
        studentId: students[3].id,
        date: new Date('2026-05-16'),
        startTime: '15:00',
        endTime: '16:30',
        subject: 'IPA',
        topic: 'Daur Air dan Manfaatnya',
        enthusiasmScore: 5,
        focusScore: 5,
        understandingScore: 5,
        homework: 'Buat diagram daur air',
        progressNotes: 'Sangat antusias dan kritis',
        parentNotes: 'Bisa diajak eksperimen sederhana di rumah',
        attendanceStatus: 'present',
      },
    }),
    // Additional reports
    prisma.dailyReport.create({
      data: {
        studentId: students[0].id,
        date: new Date('2026-05-19'),
        startTime: '15:00',
        endTime: '16:30',
        subject: 'Matematika',
        topic: 'Pengukuran Panjang',
        enthusiasmScore: 4,
        focusScore: 4,
        understandingScore: 4,
        homework: 'Ukur benda-benda di rumah',
        progressNotes: 'Paham konsep pengukuran',
        parentNotes: 'Latih dengan penggaris dan meteran',
        attendanceStatus: 'present',
      },
    }),
    prisma.dailyReport.create({
      data: {
        studentId: students[1].id,
        date: new Date('2026-05-20'),
        startTime: '16:00',
        endTime: '17:30',
        subject: 'Bahasa Indonesia',
        topic: 'Menulis Paragraf Sederhana',
        enthusiasmScore: 5,
        focusScore: 5,
        understandingScore: 5,
        homework: 'Tulis paragraf tentang liburan',
        progressNotes: 'Kemampuan menulis sangat baik',
        parentNotes: 'Dorong untuk menulis jurnal harian',
        attendanceStatus: 'present',
      },
    }),
  ]);

  console.log(`✅ Created ${reports.length} daily reports`);

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${students.length} students`);
  console.log(`   - ${schedules.length} schedules`);
  console.log(`   - ${reports.length} daily reports`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
