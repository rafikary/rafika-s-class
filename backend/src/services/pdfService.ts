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
   * Generate professional PDF report for monthly student progress
   */
  async generateMonthlyReport(data: MonthlyReportData, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        // Set response headers for PDF download
        const filename = `Laporan_${data.student.name}_${data.period.month}_${data.period.year}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe PDF to response
        doc.pipe(res);

        // HEADER - Logo & Title
        this.drawHeader(doc, data);

        // STUDENT INFO
        this.drawStudentInfo(doc, data);

        // SUMMARY SECTION
        this.drawSummary(doc, data);

        // DETAILED SESSIONS
        this.drawSessions(doc, data);

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

  private drawHeader(doc: PDFKit.PDFDocument, _data: MonthlyReportData) {
    // Header background gradient effect (purple to pink)
    doc
      .rect(0, 0, doc.page.width, 140)
      .fillAndStroke('#8B5CF6', '#EC4899');

    // Reset to white for text
    doc.fillColor('#FFFFFF');

    // Logo area (simplified book icon using shapes)
    const logoX = 50;
    const logoY = 30;
    
    // Book icon - simple rectangle
    doc
      .rect(logoX, logoY, 35, 45)
      .fillAndStroke('#FFFFFF', '#FFFFFF');
    
    // Book pages effect
    doc
      .rect(logoX + 5, logoY + 5, 25, 35)
      .fillAndStroke('#E9D5FF', '#E9D5FF');
    
    // Sparkle decoration
    doc
      .circle(logoX + 30, logoY + 10, 3)
      .fill('#FDE68A');

    // Title - Miss Rafika's Learning Center
    doc
      .fontSize(26)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text('MISS RAFIKA\'S LEARNING CENTER', 100, 35, {
        width: doc.page.width - 150,
      });

    // Tagline
    doc
      .fontSize(11)
      .font('Helvetica')
      .text('Belajar • Berkembang • Berprestasi', 100, 65, {
        width: doc.page.width - 150,
      });

    // Report title
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('LAPORAN PEMBELAJARAN BULANAN', 50, 95, {
        align: 'center',
        width: doc.page.width - 100,
      });

    // Reset color for content
    doc.fillColor('#1F2937');
    
    // Move cursor down after header
    doc.y = 160;
  }

  private drawStudentInfo(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
    const startY = doc.y;

    // Section title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#8B5CF6')
      .text('Informasi Siswa', 50, startY);

    doc.y += 25;

    // Info box with light purple background
    const boxY = doc.y;
    doc
      .rect(50, boxY, doc.page.width - 100, 80)
      .fillAndStroke('#F3F4F6', '#E5E7EB');

    doc.fillColor('#000000');

    // Student details
    const leftCol = 70;
    const rightCol = 320;
    let currentY = boxY + 20;

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Nama Siswa:', leftCol, currentY);
    doc
      .font('Helvetica')
      .text(data.student.name, leftCol + 100, currentY);

    currentY += 20;
    doc
      .font('Helvetica-Bold')
      .text('Kelas:', leftCol, currentY);
    doc
      .font('Helvetica')
      .text(data.student.grade, leftCol + 100, currentY);

    currentY = boxY + 20;
    doc
      .font('Helvetica-Bold')
      .text('Orang Tua:', rightCol, currentY);
    doc
      .font('Helvetica')
      .text(data.student.parentName, rightCol + 100, currentY);

    currentY += 20;
    doc
      .font('Helvetica-Bold')
      .text('Periode:', rightCol, currentY);
    doc
      .font('Helvetica')
      .text(`${data.period.month} ${data.period.year}`, rightCol + 100, currentY);

    doc.y = boxY + 100;
  }

  private drawSummary(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
    doc.y += 20;
    const startY = doc.y;

    // Section title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#8B5CF6')
      .text('Ringkasan', 50, startY);

    doc.y += 25;

    // Stats cards in a row
    const cardWidth = 130;
    const cardHeight = 80;
    const gap = 15;
    const startX = 50;
    let currentX = startX;

    // Card 1: Total Hadir
    this.drawStatCard(
      doc,
      currentX,
      doc.y,
      cardWidth,
      cardHeight,
      'Total Hadir',
      `${data.summary.presentCount}x`,
      '#10B981'
    );

    currentX += cardWidth + gap;

    // Card 2: Avg Enthusiasm
    this.drawStatCard(
      doc,
      currentX,
      doc.y,
      cardWidth,
      cardHeight,
      'Semangat',
      `${data.summary.avgEnthusiasm.toFixed(1)} ⭐`,
      '#F59E0B'
    );

    currentX += cardWidth + gap;

    // Card 3: Avg Focus
    this.drawStatCard(
      doc,
      currentX,
      doc.y,
      cardWidth,
      cardHeight,
      'Fokus',
      `${data.summary.avgFocus.toFixed(1)} ⭐`,
      '#3B82F6'
    );

    currentX += cardWidth + gap;

    // Card 4: Avg Understanding
    this.drawStatCard(
      doc,
      currentX,
      doc.y,
      cardWidth,
      cardHeight,
      'Pemahaman',
      `${data.summary.avgUnderstanding.toFixed(1)} ⭐`,
      '#8B5CF6'
    );

    doc.y += cardHeight + 30;

    // Subjects learned
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Mata Pelajaran:', 50, doc.y);

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(data.subjects.join(', '), 50, doc.y + 18);

    doc.y += 50;
  }

  private drawStatCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string,
    color: string
  ) {
    // Card background
    doc
      .roundedRect(x, y, width, height, 8)
      .fillAndStroke('#FFFFFF', '#E5E7EB');

    // Colored top bar
    doc
      .roundedRect(x, y, width, 4, 8)
      .fill(color);

    // Label
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(label, x + 15, y + 20, {
        width: width - 30,
        align: 'center',
      });

    // Value
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#1F2937')
      .text(value, x + 15, y + 40, {
        width: width - 30,
        align: 'center',
      });
  }

  private drawSessions(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
    // Check if we need a new page
    if (doc.y > 600) {
      doc.addPage();
      doc.y = 50;
    }

    // Section title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#8B5CF6')
      .text('Detail Pertemuan', 50, doc.y);

    doc.y += 25;

    // Draw each session
    data.reports.forEach((report, index) => {
      // Check if we need a new page
      if (doc.y > 650) {
        doc.addPage();
        doc.y = 50;
      }

      this.drawSessionCard(doc, report, index + 1);
      doc.y += 15;
    });
  }

  private drawSessionCard(doc: PDFKit.PDFDocument, report: any, number: number) {
    const startY = doc.y;
    const boxHeight = 150;

    // Card background
    doc
      .roundedRect(50, startY, doc.page.width - 100, boxHeight, 8)
      .fillAndStroke('#FAFAFA', '#E5E7EB');

    // Session number badge
    doc
      .circle(70, startY + 20, 15)
      .fillAndStroke('#8B5CF6', '#6B46C1');

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text(number.toString(), 65, startY + 13);

    // Session details
    doc.fillColor('#000000');
    let currentY = startY + 10;

    // Date & Subject
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`${report.date} • ${report.subject}`, 95, currentY);

    currentY += 20;

    // Topic
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#6B7280')
      .text('Materi:', 95, currentY);
    doc
      .font('Helvetica')
      .fillColor('#000000')
      .text(report.topic, 140, currentY, {
        width: doc.page.width - 190,
      });

    currentY += 25;

    // Ratings
    const ratingX = 95;
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Semangat: `, ratingX, currentY);
    doc
      .fillColor('#F59E0B')
      .text('⭐'.repeat(report.enthusiasmScore), ratingX + 60, currentY);

    doc
      .fillColor('#6B7280')
      .text(`Fokus: `, ratingX + 150, currentY);
    doc
      .fillColor('#3B82F6')
      .text('⭐'.repeat(report.focusScore), ratingX + 185, currentY);

    doc
      .fillColor('#6B7280')
      .text(`Pemahaman: `, ratingX + 275, currentY);
    doc
      .fillColor('#8B5CF6')
      .text('⭐'.repeat(report.understandingScore), ratingX + 345, currentY);

    currentY += 25;

    // Homework (if any)
    if (report.homework) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#6B7280')
        .text('PR:', 95, currentY);
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(report.homework, 115, currentY, {
          width: doc.page.width - 165,
        });
      currentY += 18;
    }

    // Progress notes (if any)
    if (report.progressNotes) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#6B7280')
        .text('Catatan:', 95, currentY);
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(report.progressNotes, 140, currentY, {
          width: doc.page.width - 190,
        });
    }

    doc.y = startY + boxHeight + 5;
  }

  private drawFooter(doc: PDFKit.PDFDocument) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 60;

    // Footer line
    doc
      .moveTo(50, footerY)
      .lineTo(doc.page.width - 50, footerY)
      .strokeColor('#E5E7EB')
      .stroke();

    // Footer text
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Belajar with Miss Fika - Belajar • Berkembang • Berprestasi', 50, footerY + 15, {
        align: 'center',
        width: doc.page.width - 100,
      });

    doc
      .fontSize(8)
      .text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`, 50, footerY + 30, {
        align: 'center',
        width: doc.page.width - 100,
      });
  }
}

export default new PdfService();
