import React, { useState } from 'react';
import { ViewMode, User } from '../types';
import {
  LayoutDashboard,
  Edit3,
  Truck,
  Receipt,
  Database,
  Layers,
  Plus,
  CloudUpload,
  Printer,
  Sparkles,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  ChevronRight,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { formatRupiah, formatYard } from '../utils/formatters';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onPrint: () => void;
  onLoadSample: () => void;
  onSaveToDatabase: () => void;
  onNewTransaction: () => void;
  isSavingDb: boolean;
  dbSavedCount: number;
  totalRolls: number;
  totalYards: number;
  grandTotal: number;
  customerName: string;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onPrint,
  onLoadSample,
  onSaveToDatabase,
  onNewTransaction,
  isSavingDb,
  dbSavedCount,
  totalRolls,
  totalYards,
  grandTotal,
  customerName,
  user,
  onLogout,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as ViewMode,
      label: 'Dashboard',
      subtitle: 'Ringkasan & Analisis Sales',
      icon: LayoutDashboard,
      color: 'text-blue-400',
      activeBg: 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/30 border-blue-500',
    },
    {
      id: 'edit' as ViewMode,
      label: 'Input Transaksi',
      subtitle: 'Form Roll Kain & Customer',
      icon: Edit3,
      color: 'text-amber-400',
      activeBg: 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/30 border-blue-500',
    },
    {
      id: 'surat_jalan' as ViewMode,
      label: 'Surat Jalan',
      subtitle: 'Packing List Roll Kain',
      icon: Truck,
      color: 'text-emerald-400',
      activeBg: 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/30 border-blue-500',
    },
    {
      id: 'invoice' as ViewMode,
      label: 'Invoice / Faktur',
      subtitle: 'Dokumen Penjualan A4',
      icon: Receipt,
      color: 'text-indigo-400',
      activeBg: 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/30 border-blue-500',
    },
    {
      id: 'history' as ViewMode,
      label: 'Database Riwayat',
      subtitle: `${dbSavedCount} Dokumen Tersimpan`,
      icon: Database,
      badge: dbSavedCount > 0 ? `${dbSavedCount}` : undefined,
      color: 'text-teal-400',
      activeBg: 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-600/30 border-emerald-500',
    },
    {
      id: 'print_all' as ViewMode,
      label: 'Cetak Semua (SJ+INV)',
      subtitle: 'Paket Dokumen Lengkap',
      icon: Layers,
      color: 'text-purple-400',
      activeBg: 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/30 border-blue-500',
    },
  ];

  const handleSelectNav = (view: ViewMode) => {
    onViewChange(view);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Top Navbar with Hamburger */}
      <div className="no-print lg:hidden bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs text-white">
              TXT
            </div>
            <div>
              <h1 className="font-extrabold text-xs tracking-tight text-white">Grosir Tekstil ERP</h1>
              <p className="text-[10px] text-slate-400 capitalize">{currentView.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveToDatabase}
            disabled={isSavingDb}
            className="p-2 bg-indigo-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="p-2 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="no-print lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        className={`no-print fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:static'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg font-black text-xs tracking-widest border border-indigo-400/30">
                TXT
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                  Grosir Tekstil <span className="text-blue-400 font-medium">ERP</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">v2.5 • Surat Jalan & Invoice</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Firestore Cloud
            </span>
            <span className="text-slate-400 font-mono">{dbSavedCount} Data</span>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Menu Utama
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? item.activeBg
                      : 'bg-slate-900 border-transparent hover:bg-slate-800/80 hover:border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : `bg-slate-800/80 ${item.color} group-hover:scale-105`
                      } transition`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="truncate">
                      <div className="text-xs font-bold truncate leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {item.badge ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white text-emerald-700'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Aksi Cepat
            </span>

            <button
              type="button"
              onClick={() => {
                onNewTransaction();
                setIsOpenMobile(false);
              }}
              className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-between cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" /> Transaksi Baru
              </span>
              <span className="text-[10px] font-normal text-blue-400 group-hover:text-white">Form</span>
            </button>

            <button
              type="button"
              onClick={onSaveToDatabase}
              disabled={isSavingDb}
              className="w-full px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-between cursor-pointer disabled:opacity-50 group"
            >
              <span className="flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-indigo-400" />
                {isSavingDb ? 'Menyimpan...' : 'Simpan ke Firestore'}
              </span>
              <span className="text-[10px] font-normal text-indigo-400 group-hover:text-white">Cloud</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="w-full px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-between cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" /> Cetak PDF / A4
              </span>
              <span className="text-[10px] font-normal text-emerald-400 group-hover:text-white">Print</span>
            </button>

            <button
              type="button"
              onClick={onLoadSample}
              className="w-full px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-bold text-xs rounded-xl transition flex items-center justify-between cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Data Contoh Rayon
              </span>
              <span className="text-[10px] font-normal text-amber-400">Sample</span>
            </button>
          </div>

          {/* Active Dokumen Summary Widget */}
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-blue-400">
                <FileText className="w-3.5 h-3.5" /> Dokumen Aktif
              </span>
              <span className="text-emerald-400 font-mono">{formatRupiah(grandTotal)}</span>
            </div>

            <div className="text-xs font-extrabold text-white truncate">
              {customerName || 'Belum Ada Customer'}
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] border-t border-slate-700/60">
              <div className="bg-slate-900/80 p-1.5 rounded text-center">
                <span className="text-slate-400 block text-[9px] uppercase">Total Roll</span>
                <span className="font-extrabold text-white">{totalRolls} Roll</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded text-center">
                <span className="text-slate-400 block text-[9px] uppercase">Total Yard</span>
                <span className="font-extrabold text-blue-300">{formatYard(totalYards)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center border border-blue-400/30 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-blue-400 font-medium truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {user.role}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 hover:border-rose-800 border border-slate-700 rounded-xl transition cursor-pointer shrink-0"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
