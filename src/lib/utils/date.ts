import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format tanggal ke format Indonesia
 * @example formatDateId("2024-03-15") => "15 Maret 2024"
 */
export function formatDateId(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy', { locale: id });
}

/**
 * Format tanggal pendek
 * @example formatDateShort("2024-03-15") => "15 Mar 2024"
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMM yyyy', { locale: id });
}

/**
 * Format tanggal relatif
 * @example formatDateRelative("2024-03-15") => "Hari ini" | "Kemarin" | "3 hari lalu"
 */
export function formatDateRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Hari ini';
  if (isYesterday(d)) return 'Kemarin';
  return formatDistanceToNow(d, { locale: id, addSuffix: true });
}

/**
 * Format tanggal untuk input HTML
 * @example formatDateInput(new Date()) => "2024-03-15"
 */
export function formatDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format bulan-tahun
 * @example formatMonthYear(3, 2024) => "Maret 2024"
 */
export function formatMonthYear(month: number, year: number): string {
  const d = new Date(year, month - 1, 1);
  return format(d, 'MMMM yyyy', { locale: id });
}

/**
 * Get current date info in Asia/Jakarta timezone
 */
export function getJakartaDate(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  );
}

/**
 * Get current month and year
 */
export function getCurrentPeriod(): { month: number; year: number } {
  const now = getJakartaDate();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
