import React, { useState } from 'react';
import {
  FileText,
  User,
  Package,
  Plus,
  Trash2,
  Copy,
  Building2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { DocumentData, TextileItem } from '../types';
import { RollYardageEditor } from './RollYardageEditor';
import { sampleTextileData } from '../data/sampleData';
import { formatRupiah, formatYard } from '../utils/formatters';

interface FormInputProps {
  data: DocumentData;
  onChange: (updatedData: DocumentData) => void;
  onLoadSample: () => void;
  onReset: () => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  data,
  onChange,
  onLoadSample,
  onReset,
}) => {
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(0);

  // Helper to update root document fields
  const handleFieldChange = (field: keyof DocumentData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Helper to update specific item field
  const handleItemFieldChange = (index: number, field: keyof TextileItem, value: any) => {
    const updatedItems = [...data.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    onChange({
      ...data,
      items: updatedItems,
    });
  };

  // Helper to update rolls array
  const handleItemRollsChange = (index: number, newRolls: number[]) => {
    const updatedItems = [...data.items];
    updatedItems[index] = {
      ...updatedItems[index],
      rolls: newRolls,
    };
    onChange({
      ...data,
      items: updatedItems,
    });
  };

  // Add new item
  const handleAddItem = () => {
    const newItem: TextileItem = {
      id: `item-${Date.now()}`,
      kode: '',
      namaBarang: '',
      kodeWarna: '',
      namaWarna: '',
      rolls: [],
      hargaSatuan: 0,
      diskonPersen: 0,
    };
    const updated = [...data.items, newItem];
    onChange({ ...data, items: updated });
    setActiveItemIndex(updated.length - 1);
  };

  // Duplicate item
  const handleDuplicateItem = (index: number) => {
    const source = data.items[index];
    const dup: TextileItem = {
      ...source,
      id: `item-${Date.now()}`,
      kodeWarna: `${source.kodeWarna}-DUP`,
      rolls: [...source.rolls],
    };
    const updated = [...data.items];
    updated.splice(index + 1, 0, dup);
    onChange({ ...data, items: updated });
    setActiveItemIndex(index + 1);
  };

  // Delete item
  const handleDeleteItem = (index: number) => {
    const updated = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items: updated });
    setActiveItemIndex(updated.length > 0 ? Math.min(index, updated.length - 1) : null);
  };

  // Clear all items
  const handleClearAllItems = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua item dari daftar?')) {
      onChange({ ...data, items: [] });
      setActiveItemIndex(null);
    }
  };

  // Summary stats
  const totalRolls = data.items.reduce((sum, item) => sum + item.rolls.length, 0);
  const totalYards = data.items.reduce(
    (sum, item) => sum + item.rolls.reduce((rSum, r) => rSum + r, 0),
    0
  );
  const totalAmount = data.items.reduce((sum, item) => {
    const yards = item.rolls.reduce((rSum, r) => rSum + r, 0);
    const gross = yards * item.hargaSatuan;
    return sum + gross * (1 - item.diskonPersen / 100);
  }, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 select-text">
      {/* Top Banner Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">Input Data Surat Jalan & Invoice</h2>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Kelola rincian yard roll kain, customer, dan harga. Semua kalkulasi & terbilang diperbarui otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onLoadSample}
            className="flex-1 md:flex-initial px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Muat Data Contoh (Rayon Twill)
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Kosongkan Semua Data Form"
          >
            <Trash2 className="w-4 h-4" /> Kosongkan / Hapus Form
          </button>
        </div>
      </div>

      {/* Grid Section 1: Customer & Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Info Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-blue-900">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm">Data Customer (Kepada Yth)</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Customer *
              </label>
              <input
                type="text"
                value={data.customerName}
                onChange={(e) => handleFieldChange('customerName', e.target.value)}
                placeholder="misal: KANAFI"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perusahaan / Toko
              </label>
              <input
                type="text"
                value={data.customerCompany}
                onChange={(e) => handleFieldChange('customerCompany', e.target.value)}
                placeholder="misal: CV. KANAFI BUSANA"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Customer
            </label>
            <textarea
              rows={2}
              value={data.customerAddress}
              onChange={(e) => handleFieldChange('customerAddress', e.target.value)}
              placeholder="Alamat tujuan pengiriman..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              No. HP / WhatsApp
            </label>
            <input
              type="text"
              value={data.customerPhone}
              onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
              placeholder="misal: 081324555782"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Company Header Info */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm">Informasi Perusahaan Pengirim</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Perusahaan
            </label>
            <input
              type="text"
              value={data.companyName}
              onChange={(e) => handleFieldChange('companyName', e.target.value)}
              placeholder="Masukkan nama perusahaan..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sub Judul / Jenis Usaha
              </label>
              <input
                type="text"
                value={data.companySubtitle}
                onChange={(e) => handleFieldChange('companySubtitle', e.target.value)}
                placeholder="misal: DISTRIBUTOR & WHOLESALE TEKSTIL"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Telepon / Kantor
              </label>
              <input
                type="text"
                value={data.companyPhone}
                onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
                placeholder="misal: 0812-3456-7890"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Perusahaan
            </label>
            <input
              type="text"
              value={data.companyAddress}
              onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
              placeholder="Alamat lengkap kantor / gudang..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Grid Section 2: Header Identifiers & Dates */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
          <FileText className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm">Nomor Dokumen & Tanggal Transaksi</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              No. Surat Jalan
            </label>
            <input
              type="text"
              value={data.noSuratJalan}
              onChange={(e) => handleFieldChange('noSuratJalan', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              No. Bukti / SO
            </label>
            <input
              type="text"
              value={data.noBuktiSO}
              onChange={(e) => handleFieldChange('noBuktiSO', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Tgl. Surat Jalan
            </label>
            <input
              type="date"
              value={data.tanggalSuratJalan}
              onChange={(e) => handleFieldChange('tanggalSuratJalan', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              No. Invoice
            </label>
            <input
              type="text"
              value={data.noInvoice}
              onChange={(e) => handleFieldChange('noInvoice', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Tgl. Invoice
            </label>
            <input
              type="date"
              value={data.tanggalInvoice}
              onChange={(e) => handleFieldChange('tanggalInvoice', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Jatuh Tempo
            </label>
            <input
              type="date"
              value={data.jatuhTempo}
              onChange={(e) => handleFieldChange('jatuhTempo', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              No. Order
            </label>
            <input
              type="text"
              value={data.noOrder}
              onChange={(e) => handleFieldChange('noOrder', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              No. PO
            </label>
            <input
              type="text"
              value={data.noPO}
              onChange={(e) => handleFieldChange('noPO', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nama Sales
            </label>
            <input
              type="text"
              value={data.sales}
              onChange={(e) => handleFieldChange('sales', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Halaman Dokumen
            </label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="text"
                value={data.halamanSuratJalan}
                onChange={(e) => handleFieldChange('halamanSuratJalan', e.target.value)}
                placeholder="SJ: 1 dari 1"
                className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-[11px]"
              />
              <input
                type="text"
                value={data.halamanInvoice}
                onChange={(e) => handleFieldChange('halamanInvoice', e.target.value)}
                placeholder="INV: 1 / 1"
                className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Items List Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> Daftar Item & Roll Kain Grosir ({data.items.length} Item)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan kode barang, nama warna, harga/yard, dan rincian yard tiap roll.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
              <span className="text-slate-600">Grand Total: </span>
              <span className="font-extrabold text-blue-900 text-sm">{formatRupiah(totalAmount)}</span>
              <span className="text-slate-400 mx-1">|</span>
              <span className="font-bold text-slate-800">{totalRolls} Roll</span> / {formatYard(totalYards)}
            </div>

            {data.items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllItems}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                title="Hapus seluruh item dari daftar"
              >
                <Trash2 className="w-4 h-4" /> Hapus Semua Item
              </button>
            )}
          </div>
        </div>

        {/* Item Accordion Cards */}
        <div className="space-y-3">
          {data.items.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Belum ada item kain dalam transaksi ini.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Form saat ini kosong. Anda dapat menambahkan item kain baru atau memuat data contoh Rayon Twill.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Item Kain Baru
                </button>
                <button
                  type="button"
                  onClick={onLoadSample}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Muat Data Contoh
                </button>
              </div>
            </div>
          ) : (
            data.items.map((item, idx) => {
            const isExpanded = activeItemIndex === idx;
            const itemRollCount = item.rolls.length;
            const itemTotalYards = item.rolls.reduce((sum, r) => sum + r, 0);
            const itemSubtotal = itemTotalYards * item.hargaSatuan * (1 - item.diskonPersen / 100);

            return (
              <div
                key={item.id || idx}
                className={`border rounded-xl transition overflow-hidden ${
                  isExpanded
                    ? 'border-blue-500 ring-2 ring-blue-100 bg-white shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setActiveItemIndex(isExpanded ? null : idx)}
                  className="p-3 flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{item.kode}</span>
                        <span className="font-bold text-slate-800 text-xs uppercase">{item.namaBarang}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">
                          Warna #{item.kodeWarna}: {item.namaWarna}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex gap-3 font-mono">
                        <span>{itemRollCount} Roll</span>
                        <span>{formatYard(itemTotalYards)}</span>
                        <span>@ {formatRupiah(item.hargaSatuan)}/yd</span>
                        {item.diskonPersen > 0 && <span className="text-rose-600">Disc {item.diskonPersen}%</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono font-extrabold text-blue-900 text-sm">
                      {formatRupiah(itemSubtotal)}
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDuplicateItem(idx)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded transition"
                        title="Duplikat Item Ini"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Hapus Item Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveItemIndex(isExpanded ? null : idx)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded transition"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Accordion Expanded Body */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-200 bg-slate-50/30 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Kode Barang *
                        </label>
                        <input
                          type="text"
                          value={item.kode}
                          onChange={(e) => handleItemFieldChange(idx, 'kode', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nama / Jenis Kain *
                        </label>
                        <input
                          type="text"
                          value={item.namaBarang}
                          onChange={(e) => handleItemFieldChange(idx, 'namaBarang', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Kode Warna
                        </label>
                        <input
                          type="text"
                          value={item.kodeWarna}
                          onChange={(e) => handleItemFieldChange(idx, 'kodeWarna', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nama Warna
                        </label>
                        <input
                          type="text"
                          value={item.namaWarna}
                          onChange={(e) => handleItemFieldChange(idx, 'namaWarna', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Harga / Yard (Rp) *
                        </label>
                        <input
                          type="number"
                          value={item.hargaSatuan}
                          onChange={(e) =>
                            handleItemFieldChange(idx, 'hargaSatuan', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                      <div className="md:col-span-1">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Diskon Persen (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={item.diskonPersen}
                          onChange={(e) =>
                            handleItemFieldChange(idx, 'diskonPersen', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900"
                        />
                      </div>

                      <div className="md:col-span-3 text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded-lg font-mono">
                        <span className="font-bold">Summary Item: </span>
                        {itemRollCount} Roll | Total {itemTotalYards.toFixed(2)} Yds × Rp{' '}
                        {item.hargaSatuan.toLocaleString()} ={' '}
                        <span className="font-extrabold text-blue-900">
                          {formatRupiah(itemSubtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Yardage Roll Editor */}
                    <div className="pt-2 border-t border-slate-200">
                      <RollYardageEditor
                        rolls={item.rolls}
                        onChange={(newRolls) => handleItemRollsChange(idx, newRolls)}
                        itemName={item.namaBarang}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          }))}
        </div>

        {data.items.length > 0 && (
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-medium">
              Total {data.items.length} item kain terdaftar dalam transaksi ini.
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Item Kain Baru
            </button>
          </div>
        )}
      </div>

      {/* Notes & Terms Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <h3 className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100">
          Catatan Tambahan & Keterangan Dokumen
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Footer Surat Jalan
            </label>
            <textarea
              rows={2}
              value={data.noteSuratJalan}
              onChange={(e) => handleFieldChange('noteSuratJalan', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Syarat & Ketentuan Invoice
            </label>
            <textarea
              rows={2}
              value={data.noteInvoice}
              onChange={(e) => handleFieldChange('noteInvoice', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
