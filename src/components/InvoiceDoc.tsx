import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { DocumentData } from '../types';
import { formatDateIndonesian, formatRupiah, formatYard } from '../utils/formatters';
import { terbilangRupiah } from '../utils/terbilang';

interface InvoiceDocProps {
  data: DocumentData;
  onOpenVerification?: () => void;
}

export const InvoiceDoc: React.FC<InvoiceDocProps> = ({ data, onOpenVerification }) => {
  // Calculate Totals
  const totalRollsCount = data.items.reduce((sum, item) => sum + item.rolls.length, 0);
  const totalYardsCount = data.items.reduce(
    (sum, item) => sum + item.rolls.reduce((rSum, yard) => rSum + yard, 0),
    0
  );

  // Subtotal & Discount
  let subtotalPrice = 0;
  let totalDiscountAmount = 0;

  data.items.forEach((item) => {
    const itemYards = item.rolls.reduce((sum, r) => sum + r, 0);
    const grossPrice = itemYards * item.hargaSatuan;
    const discountVal = grossPrice * (item.diskonPersen / 100);
    subtotalPrice += grossPrice;
    totalDiscountAmount += discountVal;
  });

  const grandTotal = subtotalPrice - totalDiscountAmount;
  const terbilangText = terbilangRupiah(grandTotal);

  // Validasi URL QR Code unik ke URL publik web
  const validationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(
          data.noInvoice || data.noSuratJalan
        )}`
      : `https://grosir-tekstil.app/verify?inv=${encodeURIComponent(data.noInvoice)}`;

  return (
    <div className="a4-document text-slate-900 bg-white flex flex-col justify-between select-text">
      <div>
        {/* Company Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-2 mb-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{data.companyName}</h1>
            <p className="text-xs font-semibold text-slate-600 tracking-wider uppercase">{data.companySubtitle}</p>
            <p className="text-[11px] text-slate-500">{data.companyAddress}</p>
          </div>
          <div className="text-right text-xs">
            <span className="inline-block px-2 py-0.5 bg-emerald-800 text-white font-mono text-[10px] font-bold rounded">
              FAKTUR PENJUALAN
            </span>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center my-3">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-widest uppercase">INVOICE</h2>
          <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase">FAKTUR PENJUALAN GROSIR</p>
          <div className="w-24 h-0.5 bg-slate-900 mx-auto mt-0.5"></div>
        </div>

        {/* Header Grid Boxes */}
        <div className="grid grid-cols-12 gap-3 mb-4 text-xs">
          {/* Left Header Box (Invoice Info) */}
          <div className="col-span-6 border border-slate-900 p-2.5 rounded-sm bg-slate-50/50">
            <table className="w-full text-left font-medium">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-1 text-slate-600 w-28">No. Invoice</td>
                  <td className="py-1 font-mono font-bold text-slate-900">: {data.noInvoice}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1 text-slate-600">Tanggal</td>
                  <td className="py-1 text-slate-900">: {formatDateIndonesian(data.tanggalInvoice)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1 text-slate-600">Jatuh Tempo</td>
                  <td className="py-1 font-semibold text-slate-900">: {formatDateIndonesian(data.jatuhTempo)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-600">Halaman ke</td>
                  <td className="py-1 text-slate-900">: {data.halamanInvoice}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Header Box (Customer Info & Ref) */}
          <div className="col-span-6 border border-slate-900 p-2.5 rounded-sm bg-slate-50/50">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Kepada Yth:</p>
                <p className="font-bold text-sm text-slate-900 uppercase">
                  {data.customerName} {data.customerCompany ? `(${data.customerCompany})` : ''}
                </p>
                <p className="text-[11px] text-slate-700 leading-tight mt-0.5">{data.customerAddress}</p>
                <p className="text-[11px] font-mono text-slate-800">HP: {data.customerPhone}</p>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-300 grid grid-cols-2 gap-1 text-[11px]">
              <div>
                <span className="text-slate-500">No. SJ:</span>{' '}
                <span className="font-mono font-semibold">{data.noSuratJalan}</span>
              </div>
              <div>
                <span className="text-slate-500">No. Order:</span>{' '}
                <span className="font-mono font-semibold">{data.noOrder}</span>
              </div>
              <div>
                <span className="text-slate-500">No. PO:</span>{' '}
                <span className="font-mono">{data.noPO || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500">Sales:</span>{' '}
                <span className="font-semibold">{data.sales}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 10-Column Textile Invoice Table */}
        <div className="mb-4 overflow-hidden border border-slate-900 rounded-sm">
          <table className="w-full text-xs text-left border-collapse tbl-border">
            <thead className="bg-slate-100 font-bold uppercase text-slate-800 border-b border-slate-900">
              <tr>
                <th className="py-2 px-1 text-center w-7 border-r border-slate-900">No</th>
                <th className="py-2 px-2 w-28 border-r border-slate-900">Kode</th>
                <th className="py-2 px-2 border-r border-slate-900">Nama Barang</th>
                <th className="py-2 px-1 text-center w-14 border-r border-slate-900">Kd Wrb</th>
                <th className="py-2 px-2 border-r border-slate-900">Nama Warna</th>
                <th className="py-2 px-1 text-center w-10 border-r border-slate-900">Roll</th>
                <th className="py-2 px-2 text-right w-24 border-r border-slate-900">Qty (Yds)</th>
                <th className="py-2 px-2 text-right w-24 border-r border-slate-900">Harga</th>
                <th className="py-2 px-1 text-center w-12 border-r border-slate-900">Disc</th>
                <th className="py-2 px-2 text-right w-28">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-900">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-slate-400 italic">
                    Belum ada data item transaksi invoice.
                  </td>
                </tr>
              ) : (
                data.items.map((item, idx) => {
                  const rollCount = item.rolls.length;
                  const itemYards = item.rolls.reduce((sum, r) => sum + r, 0);
                  const grossAmount = itemYards * item.hargaSatuan;
                  const itemTotal = grossAmount * (1 - item.diskonPersen / 100);

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-1 text-center font-medium border-r border-slate-900">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-[11px] font-semibold border-r border-slate-900">
                        {item.kode}
                      </td>
                      <td className="py-1.5 px-2 font-semibold uppercase border-r border-slate-900">
                        {item.namaBarang}
                      </td>
                      <td className="py-1.5 px-1 text-center font-mono border-r border-slate-900">
                        {item.kodeWarna}
                      </td>
                      <td className="py-1.5 px-2 font-medium border-r border-slate-900">
                        {item.namaWarna}
                      </td>
                      <td className="py-1.5 px-1 text-center font-mono font-bold border-r border-slate-900">
                        {rollCount}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-semibold border-r border-slate-900">
                        {itemYards.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono border-r border-slate-900">
                        {formatRupiah(item.hargaSatuan, false)}
                      </td>
                      <td className="py-1.5 px-1 text-center font-mono text-slate-600 border-r border-slate-900">
                        {item.diskonPersen > 0 ? `${item.diskonPersen}%` : '0%'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold">
                        {formatRupiah(itemTotal, false)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Calculation & Terbilang Section */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          {/* Left Column: Totals & Terbilang */}
          <div className="col-span-7 flex flex-col justify-between">
            <div className="border border-slate-900 p-2.5 rounded-sm bg-slate-50/50 text-xs mb-2">
              <div className="flex justify-between font-mono font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1">
                <span>TOTAL ROLL: {totalRollsCount} Roll</span>
                <span>TOTAL QTY: {formatYard(totalYardsCount)}</span>
              </div>
              <div className="mt-1">
                <span className="font-bold text-slate-700">Terbilang:</span>
                <p className="font-semibold text-slate-900 italic capitalize leading-relaxed text-[11px] bg-amber-50/80 p-1.5 rounded border border-amber-200 mt-1">
                  "{terbilangText}"
                </p>
              </div>
            </div>

            <div className="border border-slate-900 p-2 rounded-sm text-[10.5px] text-slate-600 leading-tight">
              <p className="font-bold text-slate-800 underline mb-0.5">SYARAT & KETENTUAN:</p>
              <p>1. {data.noteInvoice}</p>
              <p>2. Retur barang maks 30 hari dari tanggal pengiriman dan wajib mencantumkan No. Surat Jalan.</p>
            </div>
          </div>

          {/* Right Column: Pricing Summary */}
          <div className="col-span-5 border border-slate-900 p-2.5 rounded-sm bg-slate-50/50 text-xs">
            <table className="w-full text-right font-medium">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-1 text-left text-slate-600">Sub Total</td>
                  <td className="py-1 font-mono font-bold text-slate-900">: {formatRupiah(subtotalPrice)}</td>
                </tr>
                {totalDiscountAmount > 0 && (
                  <tr className="border-b border-slate-200 text-rose-700">
                    <td className="py-1 text-left">Discount</td>
                    <td className="py-1 font-mono font-bold">: -{formatRupiah(totalDiscountAmount)}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-slate-900 text-slate-900">
                  <td className="py-2 text-left font-black text-sm uppercase">TOTAL AKHIR</td>
                  <td className="py-2 font-mono font-extrabold text-base text-slate-900">
                    : {formatRupiah(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Signatures and Verification */}
      <div className="pt-2">
        <div className="grid grid-cols-12 gap-3 items-end">
          {/* Left Signature / Approval Box */}
          <div className="col-span-8 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="border border-slate-900 p-2 rounded-sm flex flex-col justify-between h-28">
              <p className="font-bold text-slate-800">Note / Catatan,</p>
              <p className="text-[10px] text-slate-500">( Pembayaran via transfer Bank )</p>
            </div>
            <div className="border border-slate-900 p-2 rounded-sm flex flex-col justify-between h-28">
              <p className="font-bold text-slate-800">Disetujui Oleh,</p>
              <p className="text-[11px] text-slate-500">( ttd & stempel toko )</p>
            </div>
          </div>

          {/* Right QR Code Box */}
          <div
            onClick={onOpenVerification}
            className={`col-span-4 flex flex-col items-center justify-center p-2 border border-slate-300 rounded bg-white h-28 ${
              onOpenVerification ? 'cursor-pointer hover:border-emerald-500 hover:shadow-sm transition' : ''
            }`}
            title="Klik untuk membuka status verifikasi keaslian dokumen"
          >
            <QRCodeSVG value={validationUrl} size={76} level="M" />
            <span className="text-[9px] font-mono text-slate-600 mt-1 text-center font-bold flex items-center gap-1">
              VERIFIKASI INVOICE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
