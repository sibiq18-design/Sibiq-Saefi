import React, { useState, useEffect } from 'react';
import { ViewMode, DocumentData, User, TextileItem } from './types';
import { sampleTextileData } from './data/sampleData';
import { Navbar } from './components/Navbar';
import { FormInput } from './components/FormInput';
import { SuratJalanDoc } from './components/SuratJalanDoc';
import { InvoiceDoc } from './components/InvoiceDoc';
import { LoginForm } from './components/LoginForm';
import { TransactionHistory } from './components/TransactionHistory';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { VerificationModal } from './components/VerificationModal';
import { PublicVerificationPage } from './components/PublicVerificationPage';
import {
  subscribeTransactions,
  saveTransactionToDb,
  deleteTransactionFromDb,
  SavedTransaction,
} from './lib/firebase';
import { generateUniqueDocNumbers } from './utils/formatters';
import { Printer, Edit3, Sparkles, FileText, CheckCircle2, ArrowRight, Check, ShieldCheck, QrCode, Layers } from 'lucide-react';

const USER_STORAGE_KEY = 'textile_wholesale_erp_user_v1';
const getUserStorageKey = (userId: string) => `textile_wholesale_erp_data_user_${userId}`;

export const getBlankDocumentData = (user?: User | null): DocumentData => {
  const nums = generateUniqueDocNumbers();
  return {
    companyName: user?.companyName || 'PT. HITEXTILE UTAMA GROSIR',
    companySubtitle: 'Supplier & Distributor Resmi Kain Tekstil Grosir',
    companyAddress: 'Jl. Tekstil Raya No. 88, Kopo, Bandung, Jawa Barat',
    companyPhone: '022-5432100 / 0812-9876-5432',
    noSuratJalan: nums.noSuratJalan,
    noBuktiSO: nums.noBuktiSO,
    noInvoice: nums.noInvoice,
    noOrder: nums.noOrder,
    noPO: '-',
    sales: user?.name || 'Sales Representative',
    tanggalSuratJalan: new Date().toISOString().split('T')[0],
    tanggalInvoice: new Date().toISOString().split('T')[0],
    jatuhTempo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    customerName: '',
    customerCompany: '',
    customerAddress: '',
    customerPhone: '',
    halamanSuratJalan: '1 dari 1',
    halamanInvoice: '1 / 1',
    noteSuratJalan: 'Telah diterima dengan keadaan baik barang-barang tersebut.',
    noteInvoice: 'Barang yang sudah dipotong tidak dapat diklaim.',
    items: [],
  };
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Failed to load user session:', e);
    }
    return null;
  });

  const [data, setData] = useState<DocumentData>(() => {
    if (!currentUser) return sampleTextileData;
    try {
      const saved = localStorage.getItem(getUserStorageKey(currentUser.id));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }
    return {
      ...sampleTextileData,
      sales: currentUser.name || sampleTextileData.sales,
      companyName: currentUser.companyName || sampleTextileData.companyName,
    };
  });

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isSaved, setIsSaved] = useState(true);

  // Standalone Public QR Verification Code State
  const [publicVerifyCode, setPublicVerifyCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('verify') || params.get('inv') || params.get('sj') || null;
  });

  // Verification Modal State
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Firebase Database States
  const [savedTransactions, setSavedTransactions] = useState<SavedTransaction[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: '',
  });

  // Check URL query parameters for ?verify= or ?inv= or ?sj= on initial load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const verifyCode = params.get('verify') || params.get('inv') || params.get('sj');
    if (verifyCode) {
      setShowVerificationModal(true);
      setCurrentView('invoice');
    }
  }, []);

  // Security Session Check: Auto-logout blocked or pending sessions
  useEffect(() => {
    if (currentUser && (currentUser.status === 'blocked' || currentUser.status === 'pending')) {
      localStorage.removeItem(USER_STORAGE_KEY);
      setCurrentUser(null);
    }
  }, [currentUser]);

  // Update active user data on user login switch
  useEffect(() => {
    if (!currentUser) return;
    try {
      const userKey = getUserStorageKey(currentUser.id);
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items)) {
          setData(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }

    // Default sample tailored to user if no prior saved state
    setData({
      ...sampleTextileData,
      sales: currentUser.name || sampleTextileData.sales,
      companyName: currentUser.companyName || sampleTextileData.companyName,
    });
    setActiveTransactionId(null);
  }, [currentUser?.id]);

  // Subscribe to real-time Firestore database for the active user
  useEffect(() => {
    if (!currentUser) return;
    setIsDbLoading(true);
    const unsubscribe = subscribeTransactions(
      currentUser.id,
      (list) => {
        setSavedTransactions(list);
        setIsDbLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setIsDbLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.id]);

  // Auto-save to user-isolated localStorage on data change
  useEffect(() => {
    if (!currentUser) return;
    setIsSaved(false);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(getUserStorageKey(currentUser.id), JSON.stringify(data));
        setIsSaved(true);
      } catch (e) {
        console.error('Failed to save to local storage:', e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [data, currentUser?.id]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session:', e);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar (Log Out) dari sistem?')) {
      setCurrentUser(null);
      try {
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear user session:', e);
      }
    }
  };

  // Save current transaction to Firestore Database with user isolation
  const handleSaveToDatabase = async () => {
    if (!currentUser) return;
    setIsSavingDb(true);
    try {
      const docId = await saveTransactionToDb(
        data,
        currentUser.id,
        activeTransactionId || undefined
      );
      setActiveTransactionId(docId);
      setSaveToast({
        show: true,
        msg: `Transaksi "${data.noSuratJalan || 'Berhasil'}" tersimpan di Database Firestore!`,
      });
      setTimeout(() => setSaveToast({ show: false, msg: '' }), 4000);
    } catch (err) {
      alert('Gagal menyimpan transaksi ke database. Pastikan koneksi internet stabil.');
    } finally {
      setIsSavingDb(false);
    }
  };

  // Load transaction from history
  const handleSelectTransaction = (trans: SavedTransaction) => {
    setData(trans.data);
    setActiveTransactionId(trans.id);
    setCurrentView('edit');
  };

  // Create new blank transaction
  const handleNewTransaction = () => {
    setData(getBlankDocumentData(currentUser));
    setActiveTransactionId(null);
    setCurrentView('edit');
  };

  // Delete transaction from Firestore
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransactionFromDb(id);
    if (activeTransactionId === id) {
      setActiveTransactionId(null);
    }
  };

  // Quick view doc from history
  const handleViewDocFromHistory = (
    trans: SavedTransaction,
    view: 'surat_jalan' | 'invoice'
  ) => {
    setData(trans.data);
    setActiveTransactionId(trans.id);
    setCurrentView(view);
  };

  // Load sample Rayon Twill data
  const handleLoadSample = () => {
    if (
      window.confirm(
        'Muat data contoh Rayon Twill? Data di form saat ini akan diganti dengan data contoh.'
      )
    ) {
      const freshNums = generateUniqueDocNumbers();
      setData({
        ...sampleTextileData,
        sales: currentUser?.name || sampleTextileData.sales,
        companyName: currentUser?.companyName || sampleTextileData.companyName,
        noSuratJalan: freshNums.noSuratJalan,
        noBuktiSO: freshNums.noBuktiSO,
        noInvoice: freshNums.noInvoice,
        noOrder: freshNums.noOrder,
      });
      setActiveTransactionId(null);
    }
  };

  // Reset data to empty template
  const handleReset = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengosongkan seluruh isi form? Data customer dan item kain akan dihapus.'
      )
    ) {
      if (currentUser) {
        try {
          localStorage.removeItem(getUserStorageKey(currentUser.id));
        } catch (e) {
          console.error('Failed to clear local storage:', e);
        }
      }
      setData(getBlankDocumentData(currentUser));
      setActiveTransactionId(null);
    }
  };

  // Helper to generate print document title (Nama Customer + No. Invoice)
  const getPdfDocumentTitle = () => {
    const custName = (data.customerName || data.customerCompany || 'Customer').trim();
    const invNo = (data.noInvoice || data.noSuratJalan || 'INV').trim();

    // Sanitize slashes and special characters for clean OS filename saving
    const cleanCust = custName.replace(/[/\\?%*:|"<>]/g, '_');
    const cleanInv = invNo.replace(/[/\\?%*:|"<>]/g, '-');

    return `${cleanCust} - ${cleanInv}`;
  };

  // Handle print action with optional target view
  const handlePrint = (targetView?: ViewMode) => {
    const prevTitle = document.title;
    const printTitle = getPdfDocumentTitle();
    document.title = printTitle;

    if (targetView && targetView !== currentView) {
      setCurrentView(targetView);
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.title = prevTitle;
        }, 1500);
      }, 150);
      return;
    }

    if (currentView !== 'surat_jalan' && currentView !== 'invoice' && currentView !== 'print_all') {
      setCurrentView('print_all');
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.title = prevTitle;
        }, 1500);
      }, 150);
      return;
    }

    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1500);
  };

  // Keyboard shortcut listener (Ctrl+P / Cmd+P) & browser native print event
  useEffect(() => {
    const handleBeforePrint = () => {
      document.title = getPdfDocumentTitle();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [data]);

  // Totals calculation
  const totalRolls = data.items.reduce((sum, item) => sum + item.rolls.length, 0);
  const totalYards = data.items.reduce(
    (sum, item) => sum + item.rolls.reduce((rSum, yard) => rSum + yard, 0),
    0
  );
  const grandTotal = data.items.reduce((sum, item) => {
    const itemYards = item.rolls.reduce((rSum, yard) => rSum + yard, 0);
    const gross = itemYards * item.hargaSatuan;
    return sum + gross * (1 - item.diskonPersen / 100);
  }, 0);

  // Public QR Code Verification View for Customers (Does not grant access to app)
  if (publicVerifyCode) {
    return (
      <PublicVerificationPage
        initialCode={publicVerifyCode}
        onGoToApp={() => {
          if (typeof window !== 'undefined') {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
          }
          setPublicVerifyCode(null);
        }}
      />
    );
  }

  // Render Login screen if not authenticated
  if (!currentUser) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 text-slate-800 font-sans">
      {/* Toast Notification */}
      {saveToast.show && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-100">{saveToast.msg}</p>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onPrint={handlePrint}
        onLoadSample={handleLoadSample}
        onSaveToDatabase={handleSaveToDatabase}
        onNewTransaction={handleNewTransaction}
        isSavingDb={isSavingDb}
        dbSavedCount={savedTransactions.length}
        totalRolls={totalRolls}
        totalYards={totalYards}
        grandTotal={grandTotal}
        customerName={data.customerName}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-3 sm:p-6 print-container overflow-y-auto">
          {/* MODE 0: DASHBOARD */}
        {currentView === 'dashboard' && (
          <Dashboard
            transactions={savedTransactions}
            isLoading={isDbLoading}
            currentUser={currentUser}
            onViewChange={setCurrentView}
            onNewTransaction={handleNewTransaction}
            onSelectTransaction={handleSelectTransaction}
            onLoadSample={handleLoadSample}
          />
        )}

        {/* MODE 1: EDIT FORM */}
        {currentView === 'edit' && (
          <FormInput
            data={data}
            onChange={setData}
            onLoadSample={handleLoadSample}
            onReset={handleReset}
          />
        )}

        {/* MODE 2: SURAT JALAN PREVIEW */}
        {currentView === 'surat_jalan' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Toolbar Top Bar for Preview */}
            <div className="no-print bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="font-bold text-sm text-slate-900">
                  Preview Surat Jalan (Packing List) - Siap Cetak A4 (1 Halaman)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(true)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Tampilkan Status & Link QR Code Verifikasi Keaslian Dokumen"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verifikasi QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('edit')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Data
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('print_all')}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" /> Cetak Semua (SJ+INV)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('invoice')}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  Ke Preview Invoice <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Surat Jalan A4
                </button>
              </div>
            </div>

            {/* Document Render */}
            <div className="overflow-x-auto pb-8">
              <SuratJalanDoc data={data} onOpenVerification={() => setShowVerificationModal(true)} />
            </div>
          </div>
        )}

        {/* MODE 3: INVOICE PREVIEW */}
        {currentView === 'invoice' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Toolbar Top Bar for Preview */}
            <div className="no-print bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="font-bold text-sm text-slate-900">
                  Preview Invoice (Faktur Penjualan) - Siap Cetak A4 (1 Halaman)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(true)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Tampilkan Status & Link QR Code Verifikasi Keaslian Dokumen"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verifikasi QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('edit')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Data
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('print_all')}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" /> Cetak Semua (SJ+INV)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('surat_jalan')}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  Ke Surat Jalan <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Invoice A4
                </button>
              </div>
            </div>

            {/* Document Render */}
            <div className="overflow-x-auto pb-8">
              <InvoiceDoc data={data} onOpenVerification={() => setShowVerificationModal(true)} />
            </div>
          </div>
        )}

        {/* MODE 4: DATABASE RIWAYAT */}
        {currentView === 'history' && (
          <TransactionHistory
            transactions={savedTransactions}
            isLoading={isDbLoading}
            activeTransactionId={activeTransactionId}
            onSelectTransaction={handleSelectTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onNewTransaction={handleNewTransaction}
            onViewDoc={handleViewDocFromHistory}
          />
        )}

        {/* MODE 5: DUAL VIEW / CETAK SEMUA (SJ + INVOICE DI LEMBAR TERPISAH) */}
        {currentView === 'print_all' && (
          <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="no-print bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-amber-400" /> Cetak Paket Dokumen Lengkap (Surat Jalan & Invoice)
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Surat Jalan dan Invoice otomatis dicetak pada lembar halaman A4 yang berbeda (tidak digabung): Halaman 1 khusus <strong className="text-blue-300">Surat Jalan</strong> dan Halaman 2 khusus <strong className="text-emerald-300">Invoice</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('edit')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-700 cursor-pointer"
                >
                  Kembali ke Form
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint('surat_jalan')}
                  className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  title="Cetak Surat Jalan Saja (1 Halaman)"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" /> Cetak SJ Saja
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint('invoice')}
                  className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  title="Cetak Invoice Saja (1 Halaman)"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-400" /> Cetak Invoice Saja
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Kedua Dokumen (2 Halaman Terpisah)
                </button>
              </div>
            </div>

            {/* Document 1: Surat Jalan (Halaman 1) */}
            <div className="print-page-sj overflow-x-auto">
              <div className="no-print font-bold text-slate-700 text-xs mb-2 uppercase tracking-wide flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="text-slate-900 font-extrabold">Dokumen 1: SURAT JALAN (PACKING LIST)</span>
                </span>
                <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Dicetak di Halaman 1
                </span>
              </div>
              <SuratJalanDoc data={data} onOpenVerification={() => setShowVerificationModal(true)} />
            </div>

            {/* Visual separator for screen only */}
            <div className="no-print my-8 border-b-2 border-dashed border-slate-300 flex items-center justify-center">
              <span className="bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-full border border-slate-200 shadow-2xs">
                ✂ Batas Halaman Cetak • Dokumen Berikutnya Otomatis di Halaman Baru
              </span>
            </div>

            {/* Explicit print-only page break marker */}
            <div className="print-page-break" aria-hidden="true" />

            {/* Document 2: Invoice (Halaman 2) */}
            <div className="print-page-inv overflow-x-auto">
              <div className="no-print font-bold text-slate-700 text-xs mb-2 uppercase tracking-wide flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-slate-900 font-extrabold">Dokumen 2: INVOICE (FAKTUR PENJUALAN)</span>
                </span>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Dicetak di Halaman 2
                </span>
              </div>
              <InvoiceDoc data={data} onOpenVerification={() => setShowVerificationModal(true)} />
            </div>
          </div>
        )}
      </main>

      {/* Interactive Document Authenticity Verification Modal */}
      {showVerificationModal && (
        <VerificationModal
          data={data}
          matchedTransaction={savedTransactions.find(
            (t) =>
              t.data.noInvoice === data.noInvoice ||
              t.data.noSuratJalan === data.noSuratJalan
          )}
          onClose={() => setShowVerificationModal(false)}
          onPrint={handlePrint}
        />
      )}
    </div>
  </div>
  );
}

