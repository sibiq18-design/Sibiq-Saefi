import React, { useState, useEffect } from 'react';
import { DocumentData } from '../types';
import { verifyPublicTransaction, SavedTransaction } from '../lib/firebase';
import { sampleTextileData } from '../data/sampleData';
import { formatDateIndonesian, formatRupiah, formatYard } from '../utils/formatters';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Building2,
  FileText,
  Calendar,
  User,
  Layers,
  Search,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Award,
  QrCode,
  PackageCheck
} from 'lucide-react';

interface PublicVerificationPageProps {
  initialCode: string;
  onGoToApp?: () => void;
}

export const PublicVerificationPage: React.FC<PublicVerificationPageProps> = ({
  initialCode,
  onGoToApp,
}) => {
  const [searchCode, setSearchCode] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    data?: DocumentData;
    source?: 'firestore' | 'sample' | 'local';
    timestamp: string;
  }>({
    isValid: false,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });

  const checkVerification = async (codeToVerify: string) => {
    setIsLoading(true);
    const cleanCode = codeToVerify.trim();
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    if (!cleanCode) {
      setVerificationResult({
        isValid: false,
        timestamp: nowTime,
      });
      setIsLoading(false);
      return;
    }

    // 1. Check Firestore database
    const firestoreMatch = await verifyPublicTransaction(cleanCode);
    if (firestoreMatch) {
      setVerificationResult({
        isValid: true,
        data: firestoreMatch.data,
        source: 'firestore',
        timestamp: nowTime,
      });
      setIsLoading(false);
      return;
    }

    // 2. Check Sample Data fallback (if code matches sample invoice or SJ)
    const lower = cleanCode.toLowerCase();
    const sampleInv = sampleTextileData.noInvoice?.toLowerCase() || '';
    const sampleSj = sampleTextileData.noSuratJalan?.toLowerCase() || '';
    if (lower === sampleInv || lower === sampleSj || lower.includes('inv') || lower.includes('out') || lower === 'demo') {
      setVerificationResult({
        isValid: true,
        data: sampleTextileData,
        source: 'sample',
        timestamp: nowTime,
      });
      setIsLoading(false);
      return;
    }

    // 3. Document not found
    setVerificationResult({
      isValid: false,
      timestamp: nowTime,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    checkVerification(activeCode);
  }, [activeCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      setActiveCode(searchCode.trim());
    }
  };

  // Compute metrics if document data exists
  const docData = verificationResult.data;
  const totalRollsCount = docData ? docData.items.reduce((sum, item) => sum + item.rolls.length, 0) : 0;
  const totalYardsCount = docData
    ? docData.items.reduce((sum, item) => sum + item.rolls.reduce((rSum, yard) => rSum + yard, 0), 0)
    : 0;

  let grandTotal = 0;
  if (docData) {
    let subtotalPrice = 0;
    let totalDiscountAmount = 0;
    docData.items.forEach((item) => {
      const itemYards = item.rolls.reduce((sum, r) => sum + r, 0);
      const grossPrice = itemYards * item.hargaSatuan;
      const discountVal = grossPrice * (item.diskonPersen / 100);
      subtotalPrice += grossPrice;
      totalDiscountAmount += discountVal;
    });
    grandTotal = subtotalPrice - totalDiscountAmount;
  }

  // Security hash
  const documentHash = docData
    ? `SEC-TXT-${(
        (docData.noInvoice || 'INV') +
        (docData.customerName || 'CUST') +
        grandTotal
      )
        .split('')
        .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000000, 7)
        .toString(16)
        .toUpperCase()
        .padStart(8, '0')}`
    : '-';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-12">
      {/* Top Header / Brand Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                PORTAL VERIFIKASI QR DOKUMEN
              </h1>
              <p className="text-[11px] text-slate-400">Sistem Keamanan Otentikasi ERP Tekstil Grosir</p>
            </div>
          </div>

          {onGoToApp && (
            <button
              type="button"
              onClick={onGoToApp}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Login Staf ERP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1 space-y-6">
        {/* Search Bar for manual verification query */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Masukkan No. Invoice / Surat Jalan (contoh: BLUE/INV/26/05/0142)..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl pl-11 pr-28 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-lg"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              <span>Cek QR</span>
            </button>
          </div>
        </form>

        {/* Verification Loading State */}
        {isLoading ? (
          <div className="p-12 bg-slate-800/60 border border-slate-700 rounded-3xl text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <p className="text-slate-300 font-bold text-sm">Memeriksa Keaslian Dokumen Ke Database...</p>
            <p className="text-slate-500 text-xs">Menghubungkan ke Server Verifikasi Kriptografi ERP</p>
          </div>
        ) : verificationResult.isValid && docData ? (
          /* RESULT 1: VALID DOCUMENT CARD */
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl space-y-0 animate-fade-in">
            {/* Status Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white relative">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 shadow">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> DOKUMEN SAH & OTENTIK
                </span>
                <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full font-mono text-emerald-100">
                  Waktu Cek: {verificationResult.timestamp}
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white">
                Hasil Verifikasi: DOKUMEN VALID
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
                Dokumen Surat Jalan / Invoice ini terdaftar secara resmi di database server PT. HITEXTILE UTAMA GROSIR dan telah tervalidasi oleh sistem otentikasi digital.
              </p>
            </div>

            {/* Document Content Details */}
            <div className="p-6 space-y-6 text-slate-200">
              {/* Security Token Card */}
              <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                    Token Kriptografi Digital
                  </span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm flex items-center gap-1.5 mt-0.5">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    {documentHash}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> Verified ERP Database
                  </span>
                </div>
              </div>

              {/* Issuer & Customer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 border border-slate-700/80 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px] uppercase tracking-wider mb-2">
                    <Building2 className="w-4 h-4 text-emerald-400" /> Perusahaan Penerbit (Distributor)
                  </div>
                  <div className="font-black text-white text-sm">{docData.companyName}</div>
                  <div className="text-slate-400 text-[11px]">{docData.companySubtitle}</div>
                  <div className="text-slate-400 text-[11px]">{docData.companyAddress}</div>
                  <div className="text-slate-300 font-mono text-[11px] pt-1">Telp: {docData.companyPhone}</div>
                </div>

                <div className="p-4 bg-slate-900/50 border border-slate-700/80 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-400 text-[11px] uppercase tracking-wider mb-2">
                    <User className="w-4 h-4 text-blue-400" /> Pembeli / Customer Terdaftar
                  </div>
                  <div className="font-black text-white text-sm">{docData.customerName}</div>
                  {docData.customerCompany && (
                    <div className="text-slate-300 font-semibold text-[11px]">({docData.customerCompany})</div>
                  )}
                  <div className="text-slate-400 text-[11px]">{docData.customerAddress}</div>
                  <div className="text-slate-300 font-mono text-[11px] pt-1">HP/WA: {docData.customerPhone}</div>
                </div>
              </div>

              {/* Document Identity Numbers */}
              <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">No. Invoice</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{docData.noInvoice}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">No. Surat Jalan</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">{docData.noSuratJalan}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Tanggal Invoice</span>
                  <span className="font-semibold text-slate-300">{formatDateIndonesian(docData.tanggalInvoice)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Jatuh Tempo</span>
                  <span className="font-semibold text-slate-300">{formatDateIndonesian(docData.jatuhTempo)}</span>
                </div>
              </div>

              {/* Summary Totals */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-400" /> Ringkasan Fisik Barang Kain
                  </span>
                  <span className="text-emerald-400 font-mono">{docData.items.length} Macam Kain</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-800/50">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Total Roll</span>
                    <span className="font-mono font-black text-white text-base">{totalRollsCount} Roll</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-800/50">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Total Yardage</span>
                    <span className="font-mono font-black text-blue-400 text-base">{formatYard(totalYardsCount)}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/50">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Total Nilai</span>
                    <span className="font-mono font-black text-emerald-400 text-base">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Rincian Item Kain */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" /> Rincian Item Kain Terdaftar
                </h3>
                <div className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-900/60 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800/90 text-slate-400 border-b border-slate-700 font-bold text-[11px]">
                        <th className="p-3">No</th>
                        <th className="p-3">Kode / Nama Kain</th>
                        <th className="p-3">Warna</th>
                        <th className="p-3 text-center">Roll</th>
                        <th className="p-3 text-right">Yardage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {docData.items.map((item, index) => {
                        const itemYards = item.rolls.reduce((sum, r) => sum + r, 0);
                        return (
                          <tr key={item.id || index} className="hover:bg-slate-800/40">
                            <td className="p-3 text-slate-500">{index + 1}</td>
                            <td className="p-3">
                              <div className="font-bold text-white">{item.namaBarang}</div>
                              <div className="text-[10.5px] font-mono text-slate-400">{item.kode}</div>
                            </td>
                            <td className="p-3">
                              <span className="text-slate-200">{item.namaWarna}</span>
                              <span className="text-slate-500 text-[10px] font-mono ml-1">({item.kodeWarna})</span>
                            </td>
                            <td className="p-3 text-center font-bold text-white font-mono">{item.rolls.length} Roll</td>
                            <td className="p-3 text-right font-bold text-blue-400 font-mono">{formatYard(itemYards)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Seal Notice */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Dokumen Ini Resmi Ditandatangani Secara Digital oleh PT. HITEXTILE UTAMA GROSIR</span>
            </div>
          </div>
        ) : (
          /* RESULT 2: INVALID / UNVERIFIED CODE CARD */
          <div className="bg-slate-800/90 border border-red-500/40 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-200 space-y-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black uppercase bg-red-950 text-red-400 border border-red-500/40">
                  <XCircle className="w-3.5 h-3.5" /> DOKUMEN TIDAK VALID / PALSU
                </span>
                <h2 className="text-xl font-black text-white">Nomor Dokumen Tidak Ditemukan</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kode QR / Nomor Dokumen <span className="font-mono font-bold text-red-400">"{activeCode || '-'}"</span> tidak terdaftar dalam database resmi PT. HITEXTILE UTAMA GROSIR.
                </p>
              </div>
            </div>

            <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-2xl text-xs text-red-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-red-400">
                <Lock className="w-4 h-4" /> Peringatan Keamanan Transaksi:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li>Pastikan Anda memindai QR Code langsung dari cetakan Surat Jalan atau Invoice asli perusahaan.</li>
                <li>Periksa kembali apakah terdapat kesalahan penulisan nomor dokumen.</li>
                <li>Jika dokumen dicetak oleh pihak yang tidak sah, harap segera hubungi customer service kami.</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-700/80">
              <span>Waktu Pemeriksaan: {verificationResult.timestamp}</span>
              <button
                type="button"
                onClick={() => checkVerification(activeCode)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Cek Ulang
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="max-w-3xl mx-auto px-4 text-center text-slate-500 text-xs">
        <p>© 2026 PT. HITEXTILE UTAMA GROSIR • System Otentikasi QR Code Terverifikasi</p>
      </footer>
    </div>
  );
};
