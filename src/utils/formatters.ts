/**
 * Helper formatting utilities for Textile Wholesale Documents
 */

/**
 * Formats a number to standard Indonesian Rupiah currency string
 * e.g., 15250 -> "Rp 15.250,00" or "15.250,00"
 */
export function formatRupiah(amount: number, withPrefix = true): string {
  if (isNaN(amount)) return withPrefix ? 'Rp 0,00' : '0,00';
  
  const parts = amount.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];
  
  const formatted = `${integerPart},${decimalPart}`;
  return withPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Formats decimal numbers like yardages (e.g., 1063.80 or 12612.60)
 */
export function formatYard(qty: number, showSuffix = true): string {
  if (isNaN(qty)) return showSuffix ? '0.00 YARDS' : '0.00';
  const formatted = qty.toFixed(2);
  return showSuffix ? `${formatted} YARDS` : formatted;
}

/**
 * Formats dates (e.g., "2026-07-18" -> "18 July 2026" or "18 Juli 2026")
 */
export function formatDateIndonesian(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const day = String(date.getDate()).padStart(2, '0');
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
