import React from 'react';
import {
  Edit3,
  Truck,
  Receipt,
  Printer,
  Sparkles,
  Layers,
  Save,
  CheckCircle2
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onPrint: () => void;
  onLoadSample: () => void;
  isSaved: boolean;
  totalRolls: number;
  totalYards: number;
  grandTotal: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onPrint,
  onLoadSample,
  isSaved,
  totalRolls,
  totalYards,
  grandTotal,
}) => {
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
                  <CheckCircle2 className="w-3 h-3" />
                  {isSaved ? 'Tersimpan (LocalStorage)' : 'Menyimpan...'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sistem Cetak Surat Jalan & Invoice A4 Presisi
              </p>
            </div>
          </div>

          {/* View Toggle Tabs */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => onViewChange('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
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
              onClick={() => onViewChange('print_all')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'print_all'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dual View</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
