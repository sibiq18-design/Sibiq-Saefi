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

  items: []
};
