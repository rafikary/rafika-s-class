import ExcelJS from 'exceljs';
import { MonthlyReportData } from '../types';

export class ExportExcelService {
  async generateMonthlyReportExcel(data: MonthlyReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Bulanan');

    // Set column widths
    worksheet.columns = [
      { width: 5 },  // No
      { width: 12 }, // Tanggal
      { width: 10 }, // Waktu
      { width: 20 }, // Mata Pelajaran
      { width: 35 }, // Topik
      { width: 10 }, // Semangat
      { width: 10 }, // Fokus
      { width: 12 }, // Pemahaman
      { width: 35 }, // Catatan
    ];

    // Title
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `LAPORAN BELAJAR BULANAN`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Period
    worksheet.mergeCells('A2:I2');
    const periodCell = worksheet.getCell('A2');
    periodCell.value = `${data.period.monthName} ${data.period.year}`;
    periodCell.font = { size: 12, bold: true };
    periodCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.addRow([]);

    // Student Info
    worksheet.addRow(['Nama Siswa', ':', data.student.name]);
    worksheet.addRow(['Kelas', ':', data.student.grade]);
    worksheet.addRow(['Orang Tua', ':', data.student.parentName]);
    worksheet.addRow(['No. WhatsApp', ':', data.student.parentWhatsapp || '-']);

    worksheet.addRow([]);

    // Summary
    worksheet.addRow(['RINGKASAN']);
    worksheet.getCell('A' + (worksheet.lastRow?.number || 1)).font = { bold: true };

    worksheet.addRow(['Total Pertemuan', ':', `${data.summary.totalSessions} kali`]);
    worksheet.addRow(['Hadir', ':', `${data.summary.present} kali`]);
    worksheet.addRow(['Izin', ':', `${data.summary.excused} kali`]);
    worksheet.addRow(['Sakit', ':', `${data.summary.sick} kali`]);
    worksheet.addRow(['Batal', ':', `${data.summary.cancelled} kali`]);
    worksheet.addRow([]);
    worksheet.addRow([
      'Rata-rata Semangat',
      ':',
      `${data.summary.avgEnthusiasm.toFixed(1)}/5`,
    ]);
    worksheet.addRow(['Rata-rata Fokus', ':', `${data.summary.avgFocus.toFixed(1)}/5`]);
    worksheet.addRow([
      'Rata-rata Pemahaman',
      ':',
      `${data.summary.avgUnderstanding.toFixed(1)}/5`,
    ]);
    worksheet.addRow([]);
    worksheet.addRow([
      'Mata Pelajaran',
      ':',
      data.summary.subjectsCovered.join(', '),
    ]);

    worksheet.addRow([]);
    worksheet.addRow([]);

    // Table Header
    const headerRow = worksheet.addRow([
      'No',
      'Tanggal',
      'Waktu',
      'Mata Pelajaran',
      'Topik',
      'Semangat',
      'Fokus',
      'Pemahaman',
      'Catatan & PR',
    ]);

    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // Table Data
    data.reports.forEach((report, index) => {
      const date = new Date(report.date);
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const notes = [
        report.progressNotes ? `Perkembangan: ${report.progressNotes}` : '',
        report.homework ? `PR: ${report.homework}` : '',
        report.parentNotes ? `Catatan: ${report.parentNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const row = worksheet.addRow([
        index + 1,
        formattedDate,
        `${report.startTime}-${report.endTime}`,
        report.subject,
        report.topic,
        report.enthusiasmScore,
        report.focusScore,
        report.understandingScore,
        notes || '-',
      ]);

      row.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      row.alignment = { vertical: 'top', wrapText: true };
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'top' };
      row.getCell(6).alignment = { horizontal: 'center', vertical: 'top' };
      row.getCell(7).alignment = { horizontal: 'center', vertical: 'top' };
      row.getCell(8).alignment = { horizontal: 'center', vertical: 'top' };
    });

    // Add some spacing
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Footer notes
    worksheet.addRow(['Catatan Umum:']);
    worksheet.getCell('A' + (worksheet.lastRow?.number || 1)).font = { bold: true };

    worksheet.addRow([
      'Penilaian menggunakan skala 1-5, di mana 1 = Kurang, 2 = Cukup, 3 = Baik, 4 = Sangat Baik, 5 = Excellent',
    ]);

    worksheet.addRow([]);
    const dateRow = worksheet.addRow([
      '',
      '',
      '',
      '',
      '',
      '',
      `Jakarta, ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`,
    ]);
    worksheet.mergeCells(
      `G${dateRow.number}:I${dateRow.number}`
    );

    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    const signatureRow = worksheet.addRow(['', '', '', '', '', '', '(________________)']);
    worksheet.mergeCells(
      `G${signatureRow.number}:I${signatureRow.number}`
    );
    worksheet.getCell(`G${signatureRow.number}`).alignment = {
      horizontal: 'center',
    };

    const teacherRow = worksheet.addRow(['', '', '', '', '', '', 'Guru Les Private']);
    worksheet.mergeCells(
      `G${teacherRow.number}:I${teacherRow.number}`
    );
    worksheet.getCell(`G${teacherRow.number}`).alignment = {
      horizontal: 'center',
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }
}

export default new ExportExcelService();
