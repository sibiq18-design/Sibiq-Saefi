import React from 'react';
import { SavedTransaction } from '../lib/firebase';
import { DocumentData, User, ViewMode } from '../types';
import { formatRupiah, formatYard } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Layers,
  Truck,
  Receipt,
  Users,
  Plus,
  ArrowUpRight,
  Database,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  ChevronRight,
  FileText,
  DollarSign,
  Clock
} from 'lucide-react';

interface DashboardProps {
  transactions: SavedTransaction[];
  isLoading: boolean;
  currentUser: User;
  onViewChange: (view: ViewMode) => void;
  onNewTransaction: () => void;
  onSelectTransaction: (trans: SavedTransaction) => void;
  onLoadSample: () => void;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  isLoading,
  currentUser,
  onViewChange,
  onNewTransaction,
  onSelectTransaction,
  onLoadSample,
}) => {
  // Aggregate Metrics
  const totalTransactionsCount = transactions.length;
  const grandOmset = transactions.reduce((acc, t) => acc + (t.grandTotal || 0), 0);
  const totalRollsAll = transactions.reduce((acc, t) => acc + (t.totalRolls || 0), 0);
  const totalYardsAll = transactions.reduce((acc, t) => acc + (t.totalYards || 0), 0);

  // Customer Statistics
  const customerStatsMap: Record<
    string,
    { name: string; company: string; count: number; rolls: number; yards: number; totalRp: number }
  > = {};

  // Fabric / Color breakdown
  const fabricStatsMap: Record<string, { label: string; rolls: number; yards: number; totalRp: number }> = {};

  transactions.forEach((t) => {
    const cName = t.data.customerName?.trim() || 'Pelanggan Umum';
    if (!customerStatsMap[cName]) {
      customerStatsMap[cName] = {
        name: cName,
        company: t.data.customerCompany || '-',
        count: 0,
        rolls: 0,
        yards: 0,
        totalRp: 0,
      };
    }
    customerStatsMap[cName].count += 1;
    customerStatsMap[cName].rolls += t.totalRolls || 0;
    customerStatsMap[cName].yards += t.totalYards || 0;
    customerStatsMap[cName].totalRp += t.grandTotal || 0;

    // Items breakdown
    t.data.items?.forEach((item) => {
      const label = item.namaBarang
        ? `${item.namaBarang} (${item.namaWarna || item.kodeWarna || 'Uni'})`
        : item.kode || 'Kain Tekstil';

      const itemYard = item.rolls.reduce((sum, r) => sum + r, 0);
      const itemRolls = item.rolls.length;
      const itemVal = itemYard * item.hargaSatuan * (1 - item.diskonPersen / 100);

      if (!fabricStatsMap[label]) {
        fabricStatsMap[label] = { label, rolls: 0, yards: 0, totalRp: 0 };
      }
      fabricStatsMap[label].rolls += itemRolls;
      fabricStatsMap[label].yards += itemYard;
      fabricStatsMap[label].totalRp += itemVal;
    });
  });

  const topCustomers = Object.values(customerStatsMap)
    .sort((a, b) => b.totalRp - a.totalRp)
    .slice(0, 5);

  const topFabrics = Object.values(fabricStatsMap)
    .sort((a, b) => b.yards - a.yards)
    .slice(0, 6);

  // Chart Data: Top Customers Bar Chart
  const customerChartData = topCustomers.map((c) => ({
    name: c.name.length > 12 ? c.name.substring(0, 10) + '..' : c.name,
    fullName: c.name,
    'Omset (Rp)': Math.round(c.totalRp),
    'Total Yard': Math.round(c.yards),
  }));

  // Chart Data: Fabric Distribution Pie Chart
  const fabricPieData = topFabrics.map((f) => ({
    name: f.label.length > 20 ? f.label.substring(0, 18) + '..' : f.label,
    fullName: f.label,
    value: Math.round(f.yards),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Background Decorative Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Executive ERP Dashboard
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Firestore Cloud Live
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Selamat Datang, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Ikhtisar operasional distribusi grosir tekstil, kalkulasi otomatis yardage roll, omset penjualan, dan rekapitulasi dokumen pelanggan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onNewTransaction}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Form Transaksi Baru
            </button>

            {transactions.length === 0 && (
              <button
                type="button"
                onClick={onLoadSample}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> Muat Data Sample
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Omset Penjualan
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRupiah(grandOmset)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Dari total dokumen di Firestore
            </p>
          </div>
        </div>

        {/* KPI 2: Total Yardage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Panjang Kain
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatYard(totalYardsAll)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Akumulasi seluruh roll terdistribusi
            </p>
          </div>
        </div>

        {/* KPI 3: Total Rolls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Jumlah Roll Kain
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalRollsAll} <span className="text-sm font-bold text-slate-500">Roll</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Faktur & packing list roll kain
            </p>
          </div>
        </div>

        {/* KPI 4: Total Dokumen */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dokumen Terbit
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalTransactionsCount} <span className="text-sm font-bold text-slate-500">Faktur</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Surat Jalan & Invoice</span>
              <button
                type="button"
                onClick={() => onViewChange('history')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Lihat
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Volume Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Penjualan Per Pelanggan Utam
              </h3>
              <p className="text-xs text-slate-500">Perbandingan total nilai transaksi (Omset Rp) tiap pelanggan</p>
            </div>
            <button
              type="button"
              onClick={() => onViewChange('history')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              Semua Pelanggan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {customerChartData.length > 0 ? (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val)), 'Total Penjualan']}
                    labelFormatter={(label) => `Pelanggan: ${label}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="Omset (Rp)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <Database className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold">Belum ada grafik transaksi tersimpan</p>
              <button
                type="button"
                onClick={onLoadSample}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
              >
                Muat Data Contoh Rayon Twill
              </button>
            </div>
          )}
        </div>

        {/* Fabric Type Breakdown Pie Chart (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" /> Distribusi Kain Terlaris
            </h3>
            <p className="text-xs text-slate-500">Persentase yardage berdasarkan variasi kain & warna</p>
          </div>

          {fabricPieData.length > 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fabricPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fabricPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${formatYard(Number(val))}`, 'Volume Yardage']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <Layers className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold">Belum ada data variasi kain</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Customer Summary & Recent Document Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Top Pelanggan Grosir Kain
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Peringkat Omset</span>
          </div>

          {topCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="py-2 px-1">Customer</th>
                    <th className="py-2 px-1 text-center">Dokumen</th>
                    <th className="py-2 px-1 text-center">Roll</th>
                    <th className="py-2 px-1 text-right">Total Yard</th>
                    <th className="py-2 px-1 text-right">Nilai Rp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topCustomers.map((cust, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-1 font-bold text-slate-800">
                        {cust.name}
                        {cust.company && cust.company !== '-' && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            {cust.company}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-1 text-center font-medium text-slate-600">
                        {cust.count}
                      </td>
                      <td className="py-2.5 px-1 text-center font-medium text-slate-600">
                        {cust.rolls}
                      </td>
                      <td className="py-2.5 px-1 text-right font-medium text-slate-700">
                        {formatYard(cust.yards)}
                      </td>
                      <td className="py-2.5 px-1 text-right font-bold text-emerald-600">
                        {formatRupiah(cust.totalRp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada pelanggan terdaftar.</p>
          )}
        </div>

        {/* Recent Firestore Documents Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Transaksi Terbaru (Cloud Firestore)
            </h3>
            <button
              type="button"
              onClick={() => onViewChange('history')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Lihat Semua ({transactions.length})
            </button>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-2.5">
              {transactions.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTransaction(t)}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 transition flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        SJ: {t.data.noSuratJalan || 'Tanpa No'}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition truncate max-w-[140px] sm:max-w-[200px]">
                        {t.data.customerName || 'Pelanggan Umum'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{t.totalRolls} Roll</span>
                      <span>•</span>
                      <span>{formatYard(t.totalYards)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-xs text-emerald-600 block">
                      {formatRupiah(t.grandTotal)}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold group-hover:underline flex items-center justify-end gap-0.5">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Belum ada transaksi tersimpan. Buat transaksi pertama Anda!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
