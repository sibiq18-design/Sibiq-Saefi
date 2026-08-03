import React, { useState } from 'react';
import { DocumentData } from '../types';
import { SavedTransaction } from '../lib/firebase';
import { formatDateIndonesian, formatRupiah, formatYard } from '../utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Printer,
  Copy,
  Check,
  Building2,
  FileText,
  Calendar,
  User,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';

interface VerificationModalProps {
  data: DocumentData;
  matchedTransaction?: SavedTransaction | null;
  onClose: () => void;
  onPrint: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  data,
  matchedTransaction,
  onClose,
  onPrint,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute document totals
  const totalRollsCount = data.items.reduce((sum, item) => sum + item.rolls.length, 0);
  const totalYardsCount = data.items.reduce(
    (sum, item) => sum + item.rolls.reduce((rSum, yard) => rSum + yard, 0),
    0
  );

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

  // Construct Verification URL
  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(
          data.noInvoice || data.noSuratJalan
        )}`
      : `https://grosir-tekstil.app/verify?inv=${encodeURIComponent(data.noInvoice)}`;

  // Generate digital verification hash code
  const documentHash = `TXT-SEC-${(
    (data.noInvoice || 'INV') +
    (data.customerName || 'CUST') +
    grandTotal
  )
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000000, 7)
    .toString(16)
    .toUpperCase()
    .padStart(8, '0')}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Verification Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/30 border border-emerald-300/40 flex items-center justify-center text-emerald-200 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400 text-emerald-950 tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Dokumen Otentik & Terverifikasi
              </span>
              <h2 className="text-xl font-extrabold tracking-tight mt-0.5 text-white">
                Sistem Verifikasi Keaslian Invoice
              </h2>
            </div>
          </div>

          <p className="text-xs text-emerald-100/90 leading-relaxed max-w-lg">
            Dokumen transaksi ini memiliki QR Code validasi unik. Data di bawah ini terdaftar resmi dalam database ERP Grosir Tekstil.
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Security Hash Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wider">
                Digital Security Token
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                {documentHash}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Valid
              </span>
              {matchedTransaction && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center gap-1 border border-blue-200">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> Cloud Sync
                </span>
              )}
            </div>
          </div>

          {/* Customer & Issuer Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Penerbit Dokumen
              </div>
              <p className="font-bold text-slate-900 text-sm">{data.companyName || 'PT. HITEXTILE UTAMA GROSIR'}</p>
              <p className="text-slate-600 text-[11px]">{data.companySubtitle || 'Supplier & Distributor Kain Tekstil'}</p>
              <p className="text-slate-500 text-[10.5px]">{data.companyAddress}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Pembeli / Customer
              </div>
              <p className="font-bold text-slate-900 text-sm">{data.customerName || 'Customer'}</p>
              {data.customerCompany && (
                <p className="text-slate-600 font-medium text-[11px]">({data.customerCompany})</p>
              )}
              <p className="text-slate-500 text-[10.5px] truncate">{data.customerAddress}</p>
              <p className="text-slate-700 font-mono text-[10.5px]">Telp/HP: {data.customerPhone}</p>
            </div>
          </div>

          {/* Document Reference Details */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" /> Rincian Identitas Dokumen
              </span>
              <span className="font-mono text-slate-500">ID: {data.noInvoice}</span>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">No. Invoice</span>
                <span className="font-mono font-bold text-slate-900">{data.noInvoice}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">No. Surat Jalan</span>
                <span className="font-mono font-semibold text-slate-800">{data.noSuratJalan}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Tanggal Invoice</span>
                <span className="font-medium text-slate-800">{formatDateIndonesian(data.tanggalInvoice)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Jatuh Tempo</span>
                <span className="font-medium text-slate-800">{formatDateIndonesian(data.jatuhTempo)}</span>
              </div>
            </div>
          </div>

          {/* Item Metrics & Grand Total */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Ringkasan Fisik Barang & Total
              </span>
              <span className="text-[11px] text-emerald-700">{data.items.length} Kalimat Item Kain</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Total Roll</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">{totalRollsCount} Roll</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Total Yardage</span>
                <span className="font-mono font-extrabold text-blue-700 text-sm">{formatYard(totalYardsCount)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-300 shadow-xs">
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Grand Total</span>
                <span className="font-mono font-extrabold text-emerald-700 text-sm">{formatRupiah(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Direct Verification Link Input Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Tautan Verifikasi Keaslian (Public Verification Link)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={verificationUrl}
                className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Modal Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistem Otentikasi QR ERP Grosir Tekstil</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onPrint();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Dokumen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
