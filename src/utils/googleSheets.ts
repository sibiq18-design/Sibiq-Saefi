import { DocumentData } from '../types';

export const SHEET_TITLE_INVOICE = 'Faktur Penjualan (Invoice)';
export const SHEET_TITLE_PACKING_LIST = 'Rincian Roll (Packing List)';

export interface SyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  invoiceRowsAppended: number;
  itemRowsAppended: number;
}

/**
 * Creates a new structured Google Spreadsheet for Grosir Tekstil ERP
 */
export async function createTextileSpreadsheet(
  accessToken: string,
  title = 'Catatan Penjualan Tekstil Grosir - PT.HI TEXTILE'
): Promise<{ id: string; url: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: SHEET_TITLE_INVOICE } },
        { properties: { title: SHEET_TITLE_PACKING_LIST } },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Gagal membuat Google Spreadsheet baru.');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write header rows to both sheets
  await initializeHeaderRows(accessToken, spreadsheetId);

  return { id: spreadsheetId, url: spreadsheetUrl };
}

/**
 * Ensures header rows exist in both sheets
 */
async function initializeHeaderRows(accessToken: string, spreadsheetId: string) {
  const invoiceHeaders = [
    [
      'Tgl Invoice',
      'No. Invoice',
      'No. Surat Jalan',
      'No. SO / Order',
      'Nama Customer',
      'Perusahaan Customer',
      'Sales',
      'Total Roll',
      'Total Yards',
      'Subtotal (Rp)',
      'Total Diskon (Rp)',
      'Grand Total (Rp)',
      'Tgl Dibuat',
    ],
  ];

  const packingHeaders = [
    [
      'No. Surat Jalan',
      'Tgl Surat Jalan',
      'Nama Customer',
      'Kode Barang',
      'Nama Kain / Barang',
      'Kode Warna',
      'Nama Warna',
      'Jumlah Roll',
      'Total Yard Item',
      'Harga / Yard (Rp)',
      'Subtotal Item (Rp)',
      'Detail Rincian Yardage Roll',
    ],
  ];

  // Update Invoice headers
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TITLE_INVOICE}'!A1:M1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: invoiceHeaders }),
    }
  );

  // Update Packing List headers
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TITLE_PACKING_LIST}'!A1:L1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: packingHeaders }),
    }
  );
}

/**
 * Appends current DocumentData (Surat Jalan & Invoice) as rows into Google Spreadsheet
 */
export async function syncDocumentToSheets(
  accessToken: string,
  spreadsheetId: string,
  doc: DocumentData
): Promise<SyncResult> {
  const totalRolls = doc.items.reduce((sum, item) => sum + item.rolls.length, 0);
  const totalYards = doc.items.reduce(
    (sum, item) => sum + item.rolls.reduce((rSum, r) => rSum + r, 0),
    0
  );

  let totalGross = 0;
  let totalDiscount = 0;
  doc.items.forEach((item) => {
    const itemYards = item.rolls.reduce((rSum, r) => rSum + r, 0);
    const gross = itemYards * item.hargaSatuan;
    const disc = gross * (item.diskonPersen / 100);
    totalGross += gross;
    totalDiscount += disc;
  });
  const grandTotal = totalGross - totalDiscount;

  // 1. Prepare Invoice Row
  const invoiceRow = [
    doc.tanggalInvoice || new Date().toISOString().split('T')[0],
    doc.noInvoice,
    doc.noSuratJalan,
    doc.noBuktiSO || doc.noOrder,
    doc.customerName,
    doc.customerCompany || '-',
    doc.sales || '-',
    totalRolls,
    totalYards.toFixed(2),
    Math.round(totalGross),
    Math.round(totalDiscount),
    Math.round(grandTotal),
    new Date().toLocaleString('id-ID'),
  ];

  // Append Invoice Row
  const invAppendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TITLE_INVOICE}'!A1:M1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [invoiceRow] }),
    }
  );

  if (!invAppendRes.ok) {
    const err = await invAppendRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal menambahkan data ke lembar Invoice Google Sheets.');
  }

  // 2. Prepare Item / Packing List Rows
  const itemRows = doc.items.map((item) => {
    const itemTotalYards = item.rolls.reduce((sum, r) => sum + r, 0);
    const itemSubtotal = itemTotalYards * item.hargaSatuan * (1 - item.diskonPersen / 100);
    const rollDetailsString = item.rolls.map((r, idx) => `R${idx + 1}:${r.toFixed(2)}`).join(' | ');

    return [
      doc.noSuratJalan,
      doc.tanggalSuratJalan || new Date().toISOString().split('T')[0],
      doc.customerName,
      item.kode,
      item.namaBarang,
      item.kodeWarna,
      item.namaWarna,
      item.rolls.length,
      itemTotalYards.toFixed(2),
      item.hargaSatuan,
      Math.round(itemSubtotal),
      rollDetailsString,
    ];
  });

  // Append Item Rows
  const itemAppendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TITLE_PACKING_LIST}'!A1:L1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: itemRows }),
    }
  );

  if (!itemAppendRes.ok) {
    const err = await itemAppendRes.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || 'Gagal menambahkan rincian roll ke lembar Packing List Google Sheets.'
    );
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    invoiceRowsAppended: 1,
    itemRowsAppended: itemRows.length,
  };
}
