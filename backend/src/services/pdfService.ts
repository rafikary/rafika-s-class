import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface MonthlyReportData {
  student: {
    name: string;
    grade: string;
    parentName: string;
  };
  period: {
    month: string;
    year: number;
  };
  summary: {
    totalSessions: number;
    presentCount: number;
    avgEnthusiasm: number;
    avgFocus: number;
    avgUnderstanding: number;
  };
  subjects: string[];
  reports: Array<{
    date: string;
    subject: string;
    topic: string;
    enthusiasmScore: number;
    focusScore: number;
    understandingScore: number;
    homework?: string;
    progressNotes?: string;
    parentNotes?: string;
  }>;
}

export class PdfService {
  /**
   * Generate simple table-based PDF report (Excel-style)
   */
  async generateMonthlyReport(data: MonthlyReportData, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40,
          },
          layout: 'landscape', // Landscape untuk tabel lebih lebar
        });

        // Set response headers for PDF download
        const filename = `Laporan_${data.student.name}_${data.period.month}_${data.period.year}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe PDF to response
        doc.pipe(res);

        // HEADER - Simple Title
        this.drawHeader(doc, data);

        // STUDENT INFO TABLE
        this.drawStudentInfo(doc, data);

        // SUMMARY TABLE
        this.drawSummary(doc, data);

        // MAIN DATA TABLE
        this.drawReportsTable(doc, data);

        // FOOTER
        this.drawFooter(doc);

        // Finalize PDF
        doc.end();

        doc.on('finish', () => resolve());
        doc.on('error', (error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawHeader(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
    // Simple header with title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('LAPORAN PEMBELAJARAN BULANAN', 40, 40, {
        align: 'center',
        width: doc.page.width - 80,
      });

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Periode: ${data.period.month} ${data.period.year}`, 40, 60, {
        align: 'center',
        width: doc.page.width - 80,
      });

    doc.y = 85;
  }

  private drawStudentInfo(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
    const startY = doc.y;
    const leftCol = 40;
    const valueCol = 150;

    // Draw simple info box
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000');

    doc.text('Nama Siswa:', leftCol, startY);
    doc.font('Helvetica').text(data.student.name, valueCol, startY);

    doc.font('Helvetica-Bold').text('Kelas:', leftCol, startY + 15);
    doc.font('Helvetica').text(data.student.grade, valueCol, startY + 15);

    doc.font('Helvetica-Bold').text('Orang Tua:', leftCol, startY + 30);
    doc.font('Helvetica').text(data.student.parentName, valueCol, startY + 30);

    doc.y = startY + 50;
  }

  private drawSummary(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
    const startY = doc.y;
    const leftCol = 40;

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('RINGKASAN', leftCol, startY);

    doc.y += 15;

    // Simple summary line
    const summaryText = `Total Pertemuan: ${data.summary.presentCount}x | Rata-rata Semangat: ${data.summary.avgEnthusiasm.toFixed(1)} | Fokus: ${data.summary.avgFocus.toFixed(1)} | Pemahaman: ${data.summary.avgUnderstanding.toFixed(1)}`;
    
    doc
      .fontSize(8)
      .font('Helvetica')
      .text(summaryText, leftCol, doc.y);

    doc.y += 20;
  }

  private drawReportsTable(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
    const startY = doc.y;
    const startX = 40;
    const pageWidth = doc.page.width - 80;

    // Table column widths (landscape mode)
    const colWidths = {
      no: 30,
      date: 70,
      subject: 90,
      topic: 120,
      semangat: 60,
      fokus: 60,
      pemahaman: 70,
      pr: 90,
      notes: 150,
    };

    // Draw table header
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF');

    let currentX = startX;
    let currentY = startY;

    // Header background
    doc
      .rect(startX, currentY, pageWidth, 20)
      .fill('#4B5563');

    doc.fillColor('#FFFFFF');

    // Header cells
    currentX = startX;
    currentY = startY + 5;

    doc.text('No', currentX + 5, currentY, { width: colWidths.no, align: 'center' });
    currentX += colWidths.no;

    doc.text('Tanggal', currentX + 2, currentY, { width: colWidths.date, align: 'center' });
    currentX += colWidths.date;

    doc.text('Mata Pelajaran', currentX + 2, currentY, { width: colWidths.subject, align: 'center' });
    currentX += colWidths.subject;

    doc.text('Materi', currentX + 2, currentY, { width: colWidths.topic, align: 'center' });
    currentX += colWidths.topic;

    doc.text('Semangat', currentX + 2, currentY, { width: colWidths.semangat, align: 'center' });
    currentX += colWidths.semangat;

    doc.text('Fokus', currentX + 2, currentY, { width: colWidths.fokus, align: 'center' });
    currentX += colWidths.fokus;

    doc.text('Pemahaman', currentX + 2, currentY, { width: colWidths.pemahaman, align: 'center' });
    currentX += colWidths.pemahaman;

    doc.text('PR', currentX + 2, currentY, { width: colWidths.pr, align: 'center' });
    currentX += colWidths.pr;

    doc.text('Catatan', currentX + 2, currentY, { width: colWidths.notes, align: 'center' });

    currentY = startY + 20;

    // Draw table rows
    doc.fillColor('#000000').font('Helvetica');

    data.reports.forEach((report, index) => {
      // Check if need new page
      if (currentY > doc.page.height - 100) {
        doc.addPage({ layout: 'landscape' });
        currentY = 40;
      }

      const rowHeight = 35;

      // Alternating row colors
      if (index % 2 === 0) {
        doc.rect(startX, currentY, pageWidth, rowHeight).fill('#F9FAFB');
      } else {
        doc.rect(startX, currentY, pageWidth, rowHeight).fill('#FFFFFF');
      }

      doc.fillColor('#000000');

      currentX = startX;
      const textY = currentY + 8;

      // No
      doc.fontSize(8).text((index + 1).toString(), currentX + 5, textY, {
        width: colWidths.no,
        align: 'center',
      });
      currentX += colWidths.no;

      // Tanggal
      doc.text(report.date, currentX + 2, textY, {
        width: colWidths.date,
        align: 'left',
      });
      currentX += colWidths.date;

      // Subject
      doc.text(report.subject, currentX + 2, textY, {
        width: colWidths.subject,
        align: 'left',
      });
      currentX += colWidths.subject;

      // Topic
      doc.text(report.topic, currentX + 2, textY, {
        width: colWidths.topic,
        align: 'left',
        height: rowHeight - 10,
      });
      currentX += colWidths.topic;

      // Semangat (bintang)
      const semangat = '★'.repeat(report.enthusiasmScore);
      doc.text(semangat, currentX + 2, textY, {
        width: colWidths.semangat,
        align: 'center',
      });
      currentX += colWidths.semangat;

      // Fokus (bintang)
      const fokus = '★'.repeat(report.focusScore);
      doc.text(fokus, currentX + 2, textY, {
        width: colWidths.fokus,
        align: 'center',
      });
      currentX += colWidths.fokus;

      // Pemahaman (bintang)
      const pemahaman = '★'.repeat(report.understandingScore);
      doc.text(pemahaman, currentX + 2, textY, {
        width: colWidths.pemahaman,
        align: 'center',
      });
      currentX += colWidths.pemahaman;

      // PR
      doc.fontSize(7).text(report.homework || '-', currentX + 2, textY, {
        width: colWidths.pr,
        align: 'left',
        height: rowHeight - 10,
      });
      currentX += colWidths.pr;

      // Notes
      doc.text(report.progressNotes || '-', currentX + 2, textY, {
        width: colWidths.notes,
        align: 'left',
        height: rowHeight - 10,
      });

      // Draw row border
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(0.5)
        .rect(startX, currentY, pageWidth, rowHeight)
        .stroke();

      currentY += rowHeight;
    });

    doc.y = currentY + 10;
  }

  private drawFooter(doc: PDFKit.PDFDocument) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 30;

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Belajar with Miss Fika', 40, footerY, {
        align: 'center',
        width: doc.page.width - 80,
      });
  }
}

export default new PdfService();
