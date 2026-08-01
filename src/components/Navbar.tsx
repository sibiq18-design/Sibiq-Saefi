import React, { useState } from 'react';
import {
  Edit3,
  Truck,
  Receipt,
  Printer,
  Sparkles,
  Layers,
  Save,
  CheckCircle2,
  LogOut,
  User as UserIcon,
  ChevronDown,
  ShieldAlert,
  Database,
  CloudUpload,
  LayoutDashboard
} from 'lucide-react';
import { ViewMode, User } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onPrint: () => void;
  onLoadSample: () => void;
  onSaveToDatabase: () => void;
  isSavingDb: boolean;
  dbSavedCount: number;
  totalRolls: number;
  totalYards: number;
  grandTotal: number;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onPrint,
  onLoadSample,
  onSaveToDatabase,
  isSavingDb,
  dbSavedCount,
  totalRolls,
  totalYards,
  grandTotal,
  user,
  onLogout,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md font-black text-lg tracking-wider">
              TXT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-white">
                  Grosir Tekstil ERP
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Database className="w-3 h-3 text-emerald-400" />
                  Firestore Sync
                </span>
              </div>
            </div>
          </div>

          {/* View Toggle Tabs */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-300" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('edit')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'edit'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Input Form</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('surat_jalan')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'surat_jalan'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Surat Jalan</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('invoice')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'invoice'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('history')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer relative ${
                currentView === 'history'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>Database Riwayat</span>
              {dbSavedCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-800">
                  {dbSavedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onViewChange('print_all')}
              className={`hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'print_all'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dual View</span>
            </button>
          </div>

          {/* Action Buttons & User Profile */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSaveToDatabase}
              disabled={isSavingDb}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Simpan Dokumen ini Ke Cloud Firestore"
            >
              {isSavingDb ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="hidden lg:inline">Menyimpan...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4 text-indigo-200" />
                  <span className="hidden sm:inline">Simpan Ke DB</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden lg:inline">Cetak / Simpan PDF</span>
            </button>

            {/* User Profile Badge & Dropdown */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold leading-tight text-white max-w-[110px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-blue-400 font-medium leading-none">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-slate-700/80">
                    <div className="px-3.5 py-2">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {user.role}
                      </span>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 font-semibold flex items-center gap-2 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Keluar (Log Out)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
