import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface MonthlyReportData {
  student: {
    name: string;
    grade: string;
    parentName: string;
  };
  period: {
    label: string;  // "6 May - 5 June 2026" or "May 2026"
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
    subject2?: string | null;
    topic2?: string | null;
    subject3?: string | null;
    topic3?: string | null;
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
        const safeFileName = `Learning_Report_${data.student.name}_${data.period.label}`
          .replace(/[^a-zA-Z0-9_\-\s]/g, '')  // Remove special chars
          .replace(/\s+/g, '_');               // Replace spaces with underscores
        const filename = `${safeFileName}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        // Use 'inline' instead of 'attachment' to display PDF in browser
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

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
      .text('LEARNING PROGRESS REPORT', 40, 75, {
        align: 'center',
        width: doc.page.width - 80,
      });

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#9B8AC0')
      .text(`Period: ${data.period.label}`, 40, 95, {
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

    const drawTableHeader = (headerY: number) => {
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF');

      let headerX = startX;

      doc
        .rect(startX, headerY, pageWidth, 20)
        .fill('#4B5563');

      doc.fillColor('#FFFFFF');

      const textY = headerY + 5;

      doc.text('No', headerX + 5, textY, { width: colWidths.no, align: 'center' });
      headerX += colWidths.no;

      doc.text('Tanggal', headerX + 2, textY, { width: colWidths.date, align: 'center' });
      headerX += colWidths.date;

      doc.text('Mata Pelajaran', headerX + 2, textY, { width: colWidths.subject, align: 'center' });
      headerX += colWidths.subject;

      doc.text('Materi', headerX + 2, textY, { width: colWidths.topic, align: 'center' });
      headerX += colWidths.topic;

      doc.text('Semangat', headerX + 2, textY, { width: colWidths.semangat, align: 'center' });
      headerX += colWidths.semangat;

      doc.text('Fokus', headerX + 2, textY, { width: colWidths.fokus, align: 'center' });
      headerX += colWidths.fokus;

      doc.text('Pemahaman', headerX + 2, textY, { width: colWidths.pemahaman, align: 'center' });
      headerX += colWidths.pemahaman;

      doc.text('PR', headerX + 2, textY, { width: colWidths.pr, align: 'center' });
      headerX += colWidths.pr;

      doc.text('Catatan', headerX + 2, textY, { width: colWidths.notes, align: 'center' });

      return headerY + 20;
    };

    let currentX = startX;
    let currentY = drawTableHeader(startY);

    // Draw table rows
    doc.fillColor('#000000').font('Helvetica');

    const minRowHeight = 25;
    const rowPaddingY = 8;

    const measureTextHeight = (text: string, width: number, fontSize: number) => {
      doc.fontSize(fontSize).font('Helvetica');
      return doc.heightOfString(text, { width, align: 'left' });
    };

    // Helper to draw vertical lines for all columns
    const drawVerticalLines = (y: number, height: number) => {
      doc.strokeColor('#E5E7EB').lineWidth(0.5);

      let x = startX;
      // Line before No column
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      x += colWidths.no;

      // Line after No, before Date
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      x += colWidths.date;

      // Line after Date, before Subject
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      x += colWidths.subject;

      // Line after Subject, before Topic
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      x += colWidths.topic;

      // Line after Topic, before Semangat
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      x += colWidths.semangat;

      // Line after Semangat, before Fokus
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      x += colWidths.fokus;

      // Line after Fokus, before Pemahaman
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      x += colWidths.pemahaman;

      // Line after Pemahaman, before PR
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      x += colWidths.pr;

      // Line after PR, before Notes
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      x += colWidths.notes;

      // Final right border
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
    };

    data.reports.forEach((report, index) => {
      // Collect all subjects/topics
      const lessons: Array<{ subject: string; topic: string }> = [];
      if (report.subject && report.topic) {
        lessons.push({ subject: report.subject, topic: report.topic });
      }
      if (report.subject2 && report.topic2) {
        lessons.push({ subject: report.subject2, topic: report.topic2 });
      }
      if (report.subject3 && report.topic3) {
        lessons.push({ subject: report.subject3, topic: report.topic3 });
      }

      if (lessons.length === 0) return;

      const prText = report.homework || '-';
      const notesText = report.progressNotes || '-';

      // Measure heights for each lesson row
      const lessonRowHeights = lessons.map((lesson) => {
        const subjectHeight = measureTextHeight(lesson.subject, colWidths.subject - 4, 8);
        const topicHeight = measureTextHeight(lesson.topic, colWidths.topic - 4, 8);
        return Math.max(minRowHeight, subjectHeight, topicHeight) + rowPaddingY;
      });

      // For first row, also consider PR and Notes height
      const prHeight = measureTextHeight(prText, colWidths.pr - 4, 7);
      const notesHeight = measureTextHeight(notesText, colWidths.notes - 4, 7);
      lessonRowHeights[0] = Math.max(
        lessonRowHeights[0],
        prHeight + rowPaddingY,
        notesHeight + rowPaddingY
      );

      const totalRowHeight = lessonRowHeights.reduce((sum, h) => sum + h, 0);

      // Check if need new page
      if (currentY + totalRowHeight > doc.page.height - 60) {
        doc.addPage({ layout: 'landscape' });

        // Add watermark to new page
        const savedY = doc.y;
        this.drawWatermark(doc);
        doc.y = savedY;

        currentY = drawTableHeader(40);
      }

      // Draw each lesson row
      let rowStartY = currentY;

      lessons.forEach((lesson, lessonIndex) => {
        const rowHeight = lessonRowHeights[lessonIndex];
        const textY = rowStartY + 5;

        // Alternating row colors (based on report index, not lesson index)
        if (index % 2 === 0) {
          doc.rect(startX, rowStartY, pageWidth, rowHeight).fill('#F9FAFB');
        } else {
          doc.rect(startX, rowStartY, pageWidth, rowHeight).fill('#FFFFFF');
        }

        doc.fillColor('#000000');

        currentX = startX;

        // No - only show on first lesson row
        if (lessonIndex === 0) {
          doc.fontSize(8).text((index + 1).toString(), currentX + 5, textY, {
            width: colWidths.no,
            align: 'center',
          });
        }
        currentX += colWidths.no;

        // Tanggal - only show on first lesson row
        if (lessonIndex === 0) {
          doc.fontSize(8).text(report.date, currentX + 2, textY, {
            width: colWidths.date,
            align: 'left',
          });
        }
        currentX += colWidths.date;

        // Subject - show for each lesson
        doc.fontSize(8).text(lesson.subject, currentX + 2, textY, {
          width: colWidths.subject - 4,
          align: 'left',
        });
        currentX += colWidths.subject;

        // Topic - show for each lesson
        doc.fontSize(8).text(lesson.topic, currentX + 2, textY, {
          width: colWidths.topic - 4,
          align: 'left',
        });
        currentX += colWidths.topic;

        // Scores - only show on first lesson row
        if (lessonIndex === 0) {
          const semangat = `${report.enthusiasmScore}/5`;
          doc.fontSize(8).text(semangat, currentX + 2, textY, {
            width: colWidths.semangat,
            align: 'center',
          });
        }
        currentX += colWidths.semangat;

        if (lessonIndex === 0) {
          const fokus = `${report.focusScore}/5`;
          doc.fontSize(8).text(fokus, currentX + 2, textY, {
            width: colWidths.fokus,
            align: 'center',
          });
        }
        currentX += colWidths.fokus;

        if (lessonIndex === 0) {
          const pemahaman = `${report.understandingScore}/5`;
          doc.fontSize(8).text(pemahaman, currentX + 2, textY, {
            width: colWidths.pemahaman,
            align: 'center',
          });
        }
        currentX += colWidths.pemahaman;

        // PR - only show on first lesson row
        if (lessonIndex === 0) {
          doc.fontSize(7).text(prText, currentX + 2, textY, {
            width: colWidths.pr - 4,
            align: 'left',
          });
        }
        currentX += colWidths.pr;

        // Notes - only show on first lesson row
        if (lessonIndex === 0) {
          doc.fontSize(7).text(notesText, currentX + 2, textY, {
            width: colWidths.notes - 4,
            align: 'left',
          });
        }

        // Draw horizontal line at bottom of this row
        doc
          .strokeColor('#E5E7EB')
          .lineWidth(0.5)
          .moveTo(startX, rowStartY + rowHeight)
          .lineTo(startX + pageWidth, rowStartY + rowHeight)
          .stroke();

        // Draw vertical lines
        drawVerticalLines(rowStartY, rowHeight);

        rowStartY += rowHeight;
      });

      currentY = rowStartY;
    });

    doc.y = currentY + 10;
  }
}

export default new PdfService();
