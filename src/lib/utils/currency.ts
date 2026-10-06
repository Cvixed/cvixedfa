/**
 * Format angka ke format Rupiah Indonesia
 * @example formatRupiah(1250000) => "Rp 1.250.000"
 * @example formatRupiah(1250000, { compact: true }) => "Rp 1,25 jt"
 */
export function formatRupiah(
  amount: number,
  options?: { compact?: boolean; showSign?: boolean }
): string {
  const { compact = false, showSign = false } = options ?? {};

  const sign = showSign && amount > 0 ? '+' : '';
  const absAmount = Math.abs(amount);

  if (compact) {
    if (absAmount >= 1_000_000_000_000) {
      return `${sign}Rp ${(amount / 1_000_000_000_000).toFixed(1).replace('.', ',')} T`;
    }
    if (absAmount >= 1_000_000_000) {
      return `${sign}Rp ${(amount / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
    }
    if (absAmount >= 1_000_000) {
      return `${sign}Rp ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1).replace('.', ',')} jt`;
    }
    if (absAmount >= 1_000) {
      return `${sign}Rp ${(amount / 1_000).toFixed(0)} rb`;
    }
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(absAmount);

  const prefix = amount < 0 ? '-' : sign;
  return `${prefix}Rp ${formatted}`;
}

/**
 * Parse string Rupiah ke angka
 * @example parseRupiah("Rp 1.250.000") => 1250000
 * @example parseRupiah("1250000") => 1250000
 */
export function parseRupiah(value: string): number {
  // Remove "Rp", spaces, dots (thousand separator)
  const cleaned = value
    .replace(/[Rr][Pp]\s*/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();

  const result = parseInt(cleaned, 10);
  return isNaN(result) ? 0 : result;
}

/**
 * Format angka input saat mengetik (live formatting)
 * @example formatCurrencyInput("1250000") => "1.250.000"
 */
export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(digits, 10));
}
