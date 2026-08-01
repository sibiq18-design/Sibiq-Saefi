import React, { useState } from 'react';
import { SavedTransaction } from '../lib/firebase';
import { DocumentData } from '../types';
import { formatRupiah, formatYard } from '../utils/formatters';
import {
  Database,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User as UserIcon,
  Truck,
  Receipt,
  Layers,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: SavedTransaction[];
  isLoading: boolean;
  activeTransactionId: string | null;
  onSelectTransaction: (trans: SavedTransaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
  onNewTransaction: () => void;
  onViewDoc: (trans: SavedTransaction, view: 'surat_jalan' | 'invoice') => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading,
  activeTransactionId,
  onSelectTransaction,
  onDeleteTransaction,
  onNewTransaction,
  onViewDoc,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const sj = (t.data.noSuratJalan || '').toLowerCase();
    const inv = (t.data.noInvoice || '').toLowerCase();
    const cust = (t.data.customerName || '').toLowerCase();
    const comp = (t.data.customerCompany || '').toLowerCase();
    return sj.includes(q) || inv.includes(q) || cust.includes(q) || comp.includes(q);
  });

  const handleDelete = async (e: React.MouseEvent, id: string, sjNo: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus transaksi "${sjNo || id}" dari database Firestore?`
      )
    ) {
      try {
        setIsDeletingId(id);
        await onDeleteTransaction(id);
      } catch (err) {
        alert('Gagal menghapus transaksi dari database.');
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Database Cloud Firestore Persistent</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Riwayat Dokumen Surat Jalan & Invoice
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Seluruh data transaksi grosir kain tersimpan aman di database cloud. Anda dapat
            membuka kembali, mengedit, mencetak, atau membuat transaksi baru kapan saja tanpa takut data hilang.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewTransaction}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Buat Transaksi Baru
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. SJ, Invoice, atau Customer..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <span className="font-bold text-slate-800">{filteredTransactions.length}</span> dari{' '}
          <span className="font-bold text-slate-800">{transactions.length}</span> transaksi terdata
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold">
            Menghubungkan & Memuat data dari Firestore Database...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTransactions.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 px-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">
            {searchQuery ? 'Tidak ada data transaksi yang cocok' : 'Belum Ada Transaksi Tersimpan'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Coba gunakan kata kunci pencarian yang lain.'
              : 'Data transaksi yang Anda input di form akan otomatis tersimpan ke database cloud Firestore.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={onNewTransaction}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg shadow hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Mulai Input Transaksi Pertama
            </button>
          )}
        </div>
      )}

      {/* Transaction Cards List */}
      {!isLoading && filteredTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTransactions.map((t) => {
            const isEditing = activeTransactionId === t.id;
            const updatedDateStr = new Date(t.updatedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={t.id}
                onClick={() => onSelectTransaction(t)}
                className={`bg-white rounded-2xl border transition shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer overflow-hidden group ${
                  isEditing
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-5 space-y-3">
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block">
                        SJ: {t.data.noSuratJalan || 'Tanpa No. SJ'}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-500 block">
                        INV: {t.data.noInvoice || '-'}
                      </span>
                    </div>

                    {isEditing ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Sedang Di-Edit
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {updatedDateStr}
                      </span>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 line-clamp-1 group-hover:text-blue-600 transition">
                      {t.data.customerName || 'Pelanggan Umum'}
                    </h4>
                    {t.data.customerCompany && (
                      <p className="text-xs text-slate-500 truncate">{t.data.customerCompany}</p>
                    )}
                  </div>

                  {/* Transaction Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Roll
                      </span>
                      <span className="font-extrabold text-xs text-slate-700">{t.totalRolls}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Yardage
                      </span>
                      <span className="font-extrabold text-xs text-slate-700">
                        {formatYard(t.totalYards)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Total Rp
                      </span>
                      <span className="font-extrabold text-xs text-emerald-600 truncate block">
                        {formatRupiah(t.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Item preview count */}
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>
                      {t.data.items?.length || 0} Variasi Kode Kain
                    </span>
                    <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-1 text-[11px]">
                      Edit Form <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons Footer */}
                <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDoc(t, 'surat_jalan');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] rounded-md transition flex items-center gap-1 cursor-pointer"
                      title="Lihat Pratinjau Surat Jalan"
                    >
                      <Truck className="w-3 h-3 text-blue-600" /> Surat Jalan
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDoc(t, 'invoice');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] rounded-md transition flex items-center gap-1 cursor-pointer"
                      title="Lihat Pratinjau Invoice"
                    >
                      <Receipt className="w-3 h-3 text-emerald-600" /> Invoice
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isDeletingId === t.id}
                    onClick={(e) => handleDelete(e, t.id, t.data.noSuratJalan)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus dari Database"
                  >
                    {isDeletingId === t.id ? (
                      <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
