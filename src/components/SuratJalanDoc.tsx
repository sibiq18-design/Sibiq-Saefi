import React from 'react';
import { DocumentData } from '../types';
import { formatDateIndonesian, formatYard } from '../utils/formatters';

interface SuratJalanDocProps {
  data: DocumentData;
  onOpenVerification?: () => void;
}

export const SuratJalanDoc: React.FC<SuratJalanDocProps> = ({ data }) => {
  // Calculate aggregate totals
  const totalRollsCount = data.items.reduce((sum, item) => sum + item.rolls.length, 0);
  const totalYardsCount = data.items.reduce(
    (sum, item) => sum + item.rolls.reduce((rSum, yard) => rSum + yard, 0),
    0
  );

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
            <span className="inline-block px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded">
              PACKING LIST / SJ
            </span>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center my-3">
          <h2 className="text-2xl font-extrabold text-blue-900 tracking-widest uppercase">SURAT JALAN</h2>
          <div className="w-24 h-0.5 bg-blue-900 mx-auto mt-0.5"></div>
        </div>

        {/* Header Grid Boxes */}
        <div className="grid grid-cols-12 gap-3 mb-4 text-xs">
          {/* Left Header Box (Surat Jalan Info) */}
          <div className="col-span-6 border border-slate-900 p-2.5 rounded-sm bg-slate-50/50">
            <table className="w-full text-left font-medium">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-1 text-slate-600 w-28">No. Surat Jalan</td>
                  <td className="py-1 font-mono font-bold text-slate-900">: {data.noSuratJalan}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1 text-slate-600">No. Bukti / SO</td>
                  <td className="py-1 font-mono text-slate-900">: {data.noBuktiSO}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1 text-slate-600">Tanggal</td>
                  <td className="py-1 text-slate-900">: {formatDateIndonesian(data.tanggalSuratJalan)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-600">Halaman ke</td>
                  <td className="py-1 text-slate-900">: {data.halamanSuratJalan}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Header Box (Customer Info) */}
          <div className="col-span-6 border border-slate-900 p-2.5 rounded-sm bg-slate-50/50">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Kepada Yth:</p>
            <p className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              {data.customerName} {data.customerCompany ? `(${data.customerCompany})` : ''}
            </p>
            <p className="text-xs text-slate-700 leading-relaxed mt-1">{data.customerAddress}</p>
            <p className="text-xs font-mono font-semibold text-slate-800 mt-1">
              Telp / WA: {data.customerPhone}
            </p>
          </div>
        </div>

        {/* Textile Yardage Roll Matrix Table */}
        <div className="mb-4 overflow-hidden border border-slate-900 rounded-sm">
          <table className="w-full text-xs text-left border-collapse tbl-border">
            <thead className="bg-slate-100 font-bold uppercase text-slate-800 border-b border-slate-900">
              <tr>
                <th className="py-2 px-2 text-center w-8 border-r border-slate-900">No</th>
                <th className="py-2 px-3 w-64 border-r border-slate-900">Item / Deskripsi Kain</th>
                <th className="py-2 px-3 border-r border-slate-900">Rincian Roll (Yard)</th>
                <th className="py-2 px-3 text-right w-40">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-900">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                    Belum ada data item roll kain.
                  </td>
                </tr>
              ) : (
                data.items.map((item, idx) => {
                  const itemRollCount = item.rolls.length;
                  const itemTotalYards = item.rolls.reduce((sum, r) => sum + r, 0);

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-2 text-center font-medium border-r border-slate-900 align-top">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-semibold border-r border-slate-900 align-top">
                        <div className="font-mono text-slate-900">{item.kode}</div>
                        <div className="text-slate-800 uppercase">{item.namaBarang}</div>
                        <div className="text-[11px] font-normal text-slate-600 mt-0.5">
                          Warna: <span className="font-semibold text-slate-800">{item.namaWarna}</span> (C#{item.kodeWarna})
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-900 align-top">
                        {/* Matrix Yardage Chips */}
                        <div className="flex flex-wrap gap-1 items-center">
                          {item.rolls.map((yard, rIdx) => (
                            <span key={rIdx} className="yard-chip text-slate-800 bg-slate-100 font-mono text-[10.5px]">
                              <span className="text-[9px] text-slate-400 mr-1">{rIdx + 1}.</span>
                              {yard.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold align-top">
                        <div className="text-slate-900">{formatYard(itemTotalYards)}</div>
                        <div className="text-[11px] font-sans font-medium text-slate-600">
                          / {itemRollCount} roll
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Row */}
            <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-bold text-slate-900">
              <tr>
                <td colSpan={2} className="py-2 px-3 text-right border-r border-slate-900 uppercase">
                  TOTAL SURAT JALAN:
                </td>
                <td className="py-2 px-3 border-r border-slate-900 font-mono">
                  <span className="text-blue-900 font-extrabold">{totalRollsCount} Roll</span> kain terdaftar
                </td>
                <td className="py-2 px-3 text-right font-mono font-extrabold text-sm text-blue-900">
                  {totalRollsCount} roll / {formatYard(totalYardsCount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Info Notes */}
        <div className="mb-4 text-xs leading-tight border border-slate-900 p-2.5 rounded-sm bg-slate-50/30">
          <p className="font-semibold text-slate-800 mb-1">
            {data.noteSuratJalan || 'Telah diterima dengan keadaan baik barang-barang tersebut.'}
          </p>
          <p className="text-slate-600 text-[11px] italic">
            * Retur barang maks 30 hari dari tanggal pengiriman dan wajib mencantumkan Nomer Surat Jalan.
          </p>
        </div>
      </div>

      {/* Footer Signatures Section */}
      <div className="pt-2">
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          {/* Box 1 */}
          <div className="border border-slate-900 p-2 rounded-sm flex flex-col justify-between h-28">
            <p className="font-bold text-slate-800">Yang menerima,</p>
            <p className="text-[11px] text-slate-500">( ttd & nama jelas )</p>
          </div>

          {/* Box 2 */}
          <div className="border border-slate-900 p-2 rounded-sm flex flex-col justify-between h-28">
            <p className="font-bold text-slate-800">Mengetahui,</p>
            <p className="text-[11px] text-slate-500">( ttd & nama jelas )</p>
          </div>

          {/* Box 3 */}
          <div className="border border-slate-900 p-2 rounded-sm flex flex-col justify-between h-28">
            <p className="font-bold text-slate-800">Hormat kami,</p>
            <p className="text-[11px] text-slate-500">( ttd & nama jelas )</p>
          </div>
        </div>
      </div>
    </div>
  );
};
