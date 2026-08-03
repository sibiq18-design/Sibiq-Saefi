import { DocumentData } from '../types';

/**
 * Generates an array of roll yardages that sum up to target total
 */
function generateRolls(count: number, targetTotal: number): number[] {
  const avg = targetTotal / count;
  const rolls: number[] = [];
  let currentSum = 0;
  for (let i = 0; i < count - 1; i++) {
    const variation = ((i % 5) - 2) * 1.25;
    const yard = Math.round((avg + variation) * 100) / 100;
    rolls.push(yard);
    currentSum += yard;
  }
  rolls.push(Math.round((targetTotal - currentSum) * 100) / 100);
  return rolls;
}

export const sampleTextileData: DocumentData = {
  companyName: "PT. HITEXTILE UTAMA GROSIR",
  companySubtitle: "Supplier & Distributor Kain Tekstil Grosir Roll-Rollan",
  companyAddress: "Jl. Textile Industry No. 88, Bandung, Jawa Barat",
  companyPhone: "022-7654321 / 0812-9988-7766",

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
  noteInvoice: "Tidak menerima pembayaran dalam bentuk tunai ke sales/collector. Barang yg sudah di potong tdk bisa di claim. Retur barang maks 30 hari dari tanggal pengiriman dan wajib mencantumkan Nomer Surat Jalan.",

  items: [
    {
      id: "item-1",
      kode: "MTX-191976/127",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "127",
      namaWarna: "ABU MUDA (SH)",
      hargaSatuan: 15250,
      diskonPersen: 0,
      rolls: generateRolls(5, 574.70),
    },
    {
      id: "item-2",
      kode: "MTX-191976/125",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "125",
      namaWarna: "SOFT BLUE",
      hargaSatuan: 15250,
      diskonPersen: 0,
      rolls: generateRolls(20, 1169.00),
    },
    {
      id: "item-3",
      kode: "MTX-191976/016",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "16",
      namaWarna: "M.BROWN",
      hargaSatuan: 15250,
      diskonPersen: 0,
      rolls: generateRolls(40, 2450.00),
    },
    {
      id: "item-4",
      kode: "MTX-191976/024",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "24",
      namaWarna: "BLACK",
      hargaSatuan: 15250,
      diskonPersen: 0,
      rolls: generateRolls(100, 6120.00),
    },
    {
      id: "item-5",
      kode: "MTX-191976/041",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "41",
      namaWarna: "GREEN",
      hargaSatuan: 15250,
      diskonPersen: 0,
      rolls: generateRolls(30, 1820.00),
    },
    {
      id: "item-6",
      kode: "MTX-191976/104",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "104",
      namaWarna: "ABU TUA (EN)",
      hargaSatuan: 15250,
      diskonPersen: 0,
      rolls: generateRolls(40, 2420.00),
    },
    {
      id: "item-7",
      kode: "MTX-191976/169",
      namaBarang: "RAYON TWILL UNIQLO - S",
      kodeWarna: "169",
      namaWarna: "MAHOGANY",
      hargaSatuan: 15250,
      diskonPersen: 0,
      rolls: generateRolls(20, 1210.00),
    },
  ],
};

