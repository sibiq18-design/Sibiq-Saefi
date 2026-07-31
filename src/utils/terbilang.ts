/**
 * Utility to convert numbers to Indonesian words ("Terbilang")
 * Supports numbers up to trillions with proper grammar and capitalization.
 */

const ANGKA = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas"
];

function penyebut(nilai: number): string {
  let temp = "";
  const n = Math.floor(Math.abs(nilai));

  if (n < 12) {
    temp = " " + ANGKA[n];
  } else if (n < 20) {
    temp = penyebut(n - 10) + " Belas";
  } else if (n < 100) {
    temp = penyebut(Math.floor(n / 10)) + " Puluh" + penyebut(n % 10);
  } else if (n < 200) {
    temp = " Seratus" + penyebut(n - 100);
  } else if (n < 1000) {
    temp = penyebut(Math.floor(n / 100)) + " Ratus" + penyebut(n % 100);
  } else if (n < 2000) {
    temp = " Seribu" + penyebut(n - 1000);
  } else if (n < 1000000) {
    temp = penyebut(Math.floor(n / 1000)) + " Ribu" + penyebut(n % 1000);
  } else if (n < 1000000000) {
    temp = penyebut(Math.floor(n / 1000000)) + " Juta" + penyebut(n % 1000000);
  } else if (n < 1000000000000) {
    temp = penyebut(Math.floor(n / 1000000000)) + " Milyar" + penyebut(n % 1000000000);
  } else if (n < 1000000000000000) {
    temp = penyebut(Math.floor(n / 1000000000000)) + " Triliun" + penyebut(n % 1000000000000);
  }

  return temp;
}

export function terbilangRupiah(num: number): string {
  if (isNaN(num) || num === 0) return "Nol Rupiah";
  
  const rounded = Math.round(num);
  let hasil = penyebut(rounded).trim();
  
  // Clean up extra spaces
  hasil = hasil.replace(/\s+/g, ' ');

  if (!hasil) return "Nol Rupiah";

  return `${hasil} Rupiah`;
}
