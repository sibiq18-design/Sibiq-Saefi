import { DocumentData } from '../types';

/**
 * Generates an array of roll yardages that sum up to target total
 */
function generateRolls(count: number, avgYard: number): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    // slight variation between -3 and +3 yards
    const variation = ((i % 5) - 2) * 1.35;
    const yard = Math.round((avgYard + variation) * 100) / 100;
    rolls.push(yard);
  }
  return rolls;
}

export const sampleTextileData: DocumentData = {
  companyName: "",
  companySubtitle: "",
  companyAddress: "",
  companyPhone: "",

  noSuratJalan: "DMGB/OUT/2607/00307",
  noBuktiSO: "BLUE/SO2607/0312",
  noInvoice: "BLUE/INV/26/05/0142",
  noOrder: "BLUE/SO2605/0111",
  noPO: "-",
  sales: "MZ - EDO",

  tanggalSuratJalan: "2026-07-18",
  tanggalInvoice: "2026-05-07",
  jatuhTempo: "2026-06-06",

  customerName: "KANAFI",
  customerCompany: "CV. KANAFI BUSANA",
  customerAddress: "Dusun Sumbang RT 13/02 Desa Susukan, Kab. Cirebon, Jawa Barat",
  customerPhone: "081324555782",

  halamanSuratJalan: "1 dari 1",
  halamanInvoice: "1 / 1",

  noteSuratJalan: "Telah diterima dengan keadaan baik barang-barang tersebut. Note : KANAFI",
  noteInvoice: "Tidak menerima pembayaran dalam bentuk tunai ke sales/collector. Barang yg sudah di potong tdk bisa di claim.",

  items: [
    {
      id: "item-1",
      kode: "MTX-191976/127",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "127",
      namaWarna: "ABU MUDA (SH)",
      rolls: [102.90, 115.40, 120.00, 118.20, 118.20], // 5 rolls = 574.70 yards
      hargaSatuan: 15250,
      diskonPersen: 0
    },
    {
      id: "item-2",
      kode: "MTX-191976/125",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "125",
      namaWarna: "SOFT BLUE",
      rolls: generateRolls(20, 58.45), // 20 rolls ~ 1169 yards
      hargaSatuan: 15250,
      diskonPersen: 0
    },
    {
      id: "item-3",
      kode: "MTX-191976/16",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "16",
      namaWarna: "M.BROWN",
      rolls: generateRolls(40, 59.50), // 40 rolls ~ 2380 yards
      hargaSatuan: 15250,
      diskonPersen: 0
    },
    {
      id: "item-4",
      kode: "MTX-191976/24",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "24",
      namaWarna: "BLACK",
      rolls: generateRolls(100, 59.20), // 100 rolls ~ 5920 yards
      hargaSatuan: 15250,
      diskonPersen: 0
    },
    {
      id: "item-5",
      kode: "MTX-191976/41",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "41",
      namaWarna: "GREEN",
      rolls: generateRolls(30, 59.50), // 30 rolls ~ 1785 yards
      hargaSatuan: 15250,
      diskonPersen: 0
    },
    {
      id: "item-6",
      kode: "MTX-191976/104",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "104",
      namaWarna: "ABU TUA (EN)",
      rolls: generateRolls(40, 59.75), // 40 rolls ~ 2390 yards
      hargaSatuan: 15250,
      diskonPersen: 0
    },
    {
      id: "item-7",
      kode: "MTX-191976/169",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "169",
      namaWarna: "MAHOGANY",
      rolls: generateRolls(20, 59.55), // 20 rolls ~ 1191 yards
      hargaSatuan: 15250,
      diskonPersen: 0
    }
  ]
};
