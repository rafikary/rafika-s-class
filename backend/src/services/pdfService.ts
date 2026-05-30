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
            top: 60,
            bottom: 50,
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

        // HEADER - Branded Title
        this.drawHeader(doc, data);

        // WATERMARK - Large transparent background (after header, before content)
        const currentY = doc.y; // Save current Y position
        this.drawWatermark(doc);
        doc.y = currentY; // Restore Y position after watermark

        // STUDENT INFO TABLE
        this.drawStudentInfo(doc, data);

        // SUMMARY TABLE
        this.drawSummary(doc, data);

        // MAIN DATA TABLE
        this.drawReportsTable(doc, data);

        // Finalize PDF
        doc.end();

        doc.on('finish', () => resolve());
        doc.on('error', (error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawWatermark(doc: PDFKit.PDFDocument) {
    // Save current state
    doc.save();

    // Calculate center position
    const centerX = doc.page.width / 2;
    const centerY = doc.page.height / 2;

    // Draw large transparent "Belajar with Miss Fika" watermark
    doc
      .opacity(0.05)
      .fontSize(48)
      .font('Helvetica-Bold')
      .fillColor('#D4BCFA');

    // Main text
    doc.text('Belajar with', centerX - 200, centerY - 60, {
      width: 400,
      align: 'center',
    });

    doc
      .fontSize(60)
      .fillColor('#FFB8D1')
      .text('Miss Fika', centerX - 200, centerY - 10, {
        width: 400,
        align: 'center',
      });

    // Subtitle
    doc
      .fontSize(16)
      .fillColor('#A8D8F0')
      .text('BELAJAR • BERKEMBANG • BERPRESTASI', centerX - 200, centerY + 60, {
        width: 400,
        align: 'center',
      });

    // Restore state
    doc.restore();
  }

  private drawHeader(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
    // Branded header with logo text
    const centerX = doc.page.width / 2;
    
    // Brand name at top
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#D4BCFA')
      .text('Belajar with Miss Fika', 40, 50, {
        align: 'center',
        width: doc.page.width - 80,
      });

    // Decorative line
    doc
      .strokeColor('#FFB8D1')
      .lineWidth(2)
      .moveTo(centerX - 100, 68)
      .lineTo(centerX + 100, 68)
      .stroke();

    // Main title
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#7B68B0')
      .text('LAPORAN PEMBELAJARAN BULANAN', 40, 75, {
        align: 'center',
        width: doc.page.width - 80,
      });

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#9B8AC0')
      .text(`Periode: ${data.period.month} ${data.period.year}`, 40, 95, {
        align: 'center',
        width: doc.page.width - 80,
      });

    // Bottom decorative line
    doc
      .strokeColor('#A8D8F0')
      .lineWidth(1)
      .moveTo(40, 112)
      .lineTo(doc.page.width - 40, 112)
      .stroke();

    doc.y = 125;
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
        
        // Add watermark to new page (save Y position)
        const savedY = doc.y;
        this.drawWatermark(doc);
        doc.y = savedY;
        
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
      const semangat = `${report.enthusiasmScore}/5`;
      doc.text(semangat, currentX + 2, textY, {
        width: colWidths.semangat,
        align: 'center',
      });
      currentX += colWidths.semangat;

      // Fokus (bintang)
      const fokus = `${report.focusScore}/5`;
      doc.text(fokus, currentX + 2, textY, {
        width: colWidths.fokus,
        align: 'center',
      });
      currentX += colWidths.fokus;

      // Pemahaman (bintang)
      const pemahaman = `${report.understandingScore}/5`;
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
    const footerY = pageHeight - 35;
    const centerX = doc.page.width / 2;

    // Decorative top line
    doc
      .strokeColor('#D4BCFA')
      .lineWidth(1)
      .moveTo(40, footerY - 5)
      .lineTo(doc.page.width - 40, footerY - 5)
      .stroke();

    // Brand name
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#D4BCFA')
      .text('Belajar with Miss Fika', 40, footerY, {
        align: 'center',
        width: doc.page.width - 80,
      });

    // Tagline
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#9B8AC0')
      .text('BELAJAR • BERKEMBANG • BERPRESTASI', 40, footerY + 13, {
        align: 'center',
        width: doc.page.width - 80,
      });
  }
}

export default new PdfService();
