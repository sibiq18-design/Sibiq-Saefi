import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
  Sparkles,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DocumentData } from '../types';
import { initAuth, googleSignIn, googleSignOut, getAccessToken } from '../utils/googleAuth';
import { createTextileSpreadsheet, syncDocumentToSheets } from '../utils/googleSheets';
import { formatRupiah, formatYard } from '../utils/formatters';

const SPREADSHEET_ID_KEY = 'textile_wholesale_spreadsheet_id_v1';

interface GoogleSheetsSyncProps {
  data: DocumentData;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({ data }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem(SPREADSHEET_ID_KEY) || '';
  });
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    linkUrl?: string;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Initialize Firebase Auth Listener
  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save spreadsheet ID to localStorage when changed
  useEffect(() => {
    if (spreadsheetId) {
      localStorage.setItem(SPREADSHEET_ID_KEY, spreadsheetId);
    }
  }, [spreadsheetId]);

  // Handle Google Login
  const handleLogin = async () => {
    setIsAuthLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Berhasil terhubung sebagai ${res.user.displayName || res.user.email}`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Gagal terhubung dengan akun Google.',
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Google Logout
  const handleLogout = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
    setStatusMessage({
      type: 'info',
      text: 'Anda telah keluar dari akun Google.',
    });
  };

  // Prepare sync: show confirmation modal
  const handleRequestSync = () => {
    if (!user || !token) {
      handleLogin();
      return;
    }
    setShowConfirmModal(true);
  };

  // Execute Sync after confirmation
  const handleConfirmSync = async () => {
    setShowConfirmModal(false);
    if (!token) return;

    setIsSyncing(true);
    setStatusMessage({
      type: 'info',
      text: 'Menghubungi Google Sheets API...',
    });

    try {
      let activeSheetId = spreadsheetId;
      let isNewSheet = false;

      // If no spreadsheet ID exists, create a new one first
      if (!activeSheetId) {
        const newSheet = await createTextileSpreadsheet(
          token,
          `Penjualan Grosir Tekstil - ${data.companyName || 'PT.HI TEXTILE'}`
        );
        activeSheetId = newSheet.id;
        setSpreadsheetId(activeSheetId);
        isNewSheet = true;
      }

      // Sync document rows to Sheets
      const result = await syncDocumentToSheets(token, activeSheetId, data);

      setStatusMessage({
        type: 'success',
        text: `${isNewSheet ? 'Google Spreadsheet baru berhasil dibuat & ' : ''}Data Invoice ${data.noInvoice} (${data.items.length} item, ${result.itemRowsAppended} baris roll) berhasil dicatat ke Google Sheets!`,
        linkUrl: result.spreadsheetUrl,
      });
    } catch (err: any) {
      console.error('Sync to sheets failed:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan saat menyimpan data ke Google Sheets.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle create fresh new spreadsheet
  const handleCreateNewSpreadsheet = async () => {
    if (!token) return;
    if (
      spreadsheetId &&
      !window.confirm('Buat Google Spreadsheet baru? Tautan spreadsheet saat ini akan diganti.')
    ) {
      return;
    }

    setIsSyncing(true);
    try {
      const newSheet = await createTextileSpreadsheet(
        token,
        `Penjualan Grosir Tekstil - ${data.companyName || 'PT.HI TEXTILE'}`
      );
      setSpreadsheetId(newSheet.id);
      setStatusMessage({
        type: 'success',
        text: 'Google Spreadsheet baru berhasil dibuat dengan header Faktur & Packing List!',
        linkUrl: newSheet.url,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Gagal membuat Google Spreadsheet baru.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const currentSheetUrl = spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : null;

  const totalRolls = data.items.reduce((sum, item) => sum + item.rolls.length, 0);
  const totalYards = data.items.reduce(
    (sum, item) => sum + item.rolls.reduce((rSum, r) => rSum + r, 0),
    0
  );

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-xl shadow-md p-4 sm:p-5 border border-emerald-800/80 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">
                Pencatatan Google Sheets Otomatis
              </h3>
              <span className="px-2 py-0.5 bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold rounded text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> OAuth Active
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Simpan rekapitulasi Surat Jalan & Invoice kain secara otomatis ke spreadsheet Google Drive Anda.
            </p>
          </div>
        </div>

        {/* User Auth Status */}
        <div className="flex items-center gap-2">
          {isAuthLoading ? (
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa akun Google...
            </div>
          ) : user ? (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-emerald-700/50 px-3 py-1.5 rounded-lg text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                {user.displayName?.[0] || user.email?.[0] || 'G'}
              </div>
              <div className="hidden md:block text-left font-medium">
                <p className="text-white font-semibold text-[11px] leading-tight">
                  {user.displayName || 'Akun Terhubung'}
                </p>
                <p className="text-emerald-300 text-[10px] truncate max-w-[140px]">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 text-slate-400 hover:text-rose-400 transition"
                title="Keluar dari Google"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="px-3.5 py-1.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-lg shadow transition flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-lg border border-emerald-800/40">
        <div className="text-xs space-y-1">
          <div className="font-semibold text-emerald-200 flex items-center gap-2">
            <span>
              Target Dokumen: <strong className="text-white">{data.noInvoice}</strong> ({data.customerName})
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            Rincian: {data.items.length} Item Kain ({totalRolls} Roll / {formatYard(totalYards, false)})
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentSheetUrl && (
            <a
              href={currentSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Buka Spreadsheet
            </a>
          )}

          {user && (
            <button
              type="button"
              onClick={handleCreateNewSpreadsheet}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Buat Google Spreadsheet baru"
            >
              <Plus className="w-3.5 h-3.5" /> Spreadsheet Baru
            </button>
          )}

          <button
            type="button"
            onClick={handleRequestSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Menyimpan...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" /> Simpan Ke Google Sheets
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Feedback Message */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-start gap-2.5 transition border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200'
              : 'bg-blue-950/90 border-blue-500/80 text-blue-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <p className="font-medium">{statusMessage.text}</p>
            {statusMessage.linkUrl && (
              <a
                href={statusMessage.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-bold mt-1"
              >
                Klik di sini untuk membuka Google Spreadsheet Anda <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* MANDATORY Confirmation Modal for Workspace Data Mutation */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-emerald-700 pb-3 border-b border-slate-100">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">Konfirmasi Catat Ke Google Sheets</h4>
                <p className="text-xs text-slate-500">Izin menyimpan data ke Google Drive Anda</p>
              </div>
            </div>

            <div className="text-xs text-slate-700 space-y-2.5">
              <p>
                Aplikasi akan menambahkan data transaksi <strong className="text-slate-900">{data.noInvoice}</strong> ({data.customerName}) ke Google Spreadsheet Anda:
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Invoice:</span>
                  <span className="font-bold text-slate-800">{data.noInvoice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Surat Jalan:</span>
                  <span className="font-bold text-slate-800">{data.noSuratJalan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-800">{data.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah Item:</span>
                  <span className="font-bold text-slate-800">{data.items.length} Item ({totalRolls} Roll)</span>
                </div>
              </div>

              <p className="text-slate-500 italic">
                Data akan dicatat pada lembar "Faktur Penjualan (Invoice)" dan "Rincian Roll (Packing List)".
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSync}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Ya, Catat Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
