/**
 * Normalize Indonesian phone number to international format
 * @param phone - Phone number in various formats
 * @returns Normalized phone number (e.g., 6281234567890)
 */
export const normalizeWhatsAppNumber = (phone: string): string => {
  if (!phone) return '';

  // Remove all non-numeric characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Remove leading +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Handle Indonesian formats
  if (cleaned.startsWith('0')) {
    // 08xxx -> 628xxx
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    // 8xxx -> 628xxx
    cleaned = '62' + cleaned;
  } else if (!cleaned.startsWith('62')) {
    // Assume Indonesian number if doesn't start with 62
    cleaned = '62' + cleaned;
  }

  return cleaned;
};

/**
 * Validate WhatsApp number format
 * @param phone - Normalized phone number
 * @returns True if valid
 */
export const isValidWhatsAppNumber = (phone: string): boolean => {
  const normalized = normalizeWhatsAppNumber(phone);

  // Must start with 62 and have 10-13 digits total
  if (!normalized.startsWith('62')) return false;
  if (normalized.length < 10 || normalized.length > 13) return false;

  // Must contain only digits
  if (!/^\d+$/.test(normalized)) return false;

  return true;
};

/**
 * Generate monthly report WhatsApp message
 */
export interface WhatsAppMessageParams {
  studentName: string;
  parentName: string;
  period: string;  // Flexible period label (e.g., "May 2026" or "6 May - 5 June 2026")
  totalSessions: number;
  subjectsSummary: string;
  progressSummary: string;
  downloadUrl?: string;
}

export const generateMonthlyReportWhatsAppMessage = (
  params: WhatsAppMessageParams
): string => {
  const {
    studentName,
    parentName,
    period,
    totalSessions,
    subjectsSummary,
    progressSummary,
    downloadUrl,
  } = params;

  const downloadSection = downloadUrl
    ? `\n\n*Download Laporan PDF:*\n${downloadUrl}\n\n_(Klik link di atas untuk download laporan lengkap dalam bentuk PDF)_`
    : ``;

  return `Assalamualaikum ${parentName},

Berikut saya sertakan laporan perkembangan belajar *${studentName}* untuk periode *${period}* dalam bentuk PDF.

*Ringkasan pembelajaran:*

- Total pertemuan: *${totalSessions} kali*
- Perkembangan belajar: ${studentName} menunjukkan pencapaian yang baik selama pembelajaran berlangsung
- Materi yang dipelajari: ${subjectsSummary}
- Detail kemajuan: ${progressSummary}${downloadSection}

Silakan klik link di atas untuk melihat laporan PDF lengkap mengenai materi yang dipelajari, perkembangan belajar, serta catatan pembelajaran.

Terima kasih atas kepercayaan yang telah diberikan.

Wassalamualaikum wr. wb.

_Study with Miss Fika_`;
};

/**
 * Generate WhatsApp click-to-chat URL
 * @param phoneNumber - Normalized phone number
 * @param message - Pre-filled message
 * @returns WhatsApp URL
 */
export const generateWhatsAppUrl = (
  phoneNumber: string,
  message: string
): string => {
  const normalized = normalizeWhatsAppNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encodedMessage}`;
};
