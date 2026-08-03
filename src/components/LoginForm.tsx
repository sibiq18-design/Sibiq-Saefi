import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  KeyRound,
  UserPlus,
  Building2,
  Mail,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

const REGISTERED_USERS_KEY = 'textile_wholesale_registered_users_v1';

interface StoredAccount extends User {
  passwordHash: string;
}

// Initial Default Accounts
const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    name: 'Administrator Tekstil',
    email: 'admin@hitextile.com',
    companyName: 'PT. HITEXTILE UTAMA GROSIR',
    role: 'Admin',
    passwordHash: 'password',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-sales-1',
    username: 'sales',
    name: 'Edo Sales Executive',
    email: 'edo@hitextile.com',
    companyName: 'BLUE TEXTILE DISTRIBUTOR',
    role: 'Sales',
    passwordHash: 'password',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-gudang-1',
    username: 'gudang',
    name: 'Budi Logistics Gudang',
    email: 'gudang@hitextile.com',
    companyName: 'GUDANG KAIN BANDUNG',
    role: 'Staff Gudang',
    passwordHash: 'password',
    createdAt: new Date().toISOString(),
  },
];

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'Admin' | 'Sales' | 'Staff Gudang'>('Sales');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI Common State
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load registered users from localStorage or initialize defaults
  const getRegisteredUsers = (): StoredAccount[] => {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse registered users:', e);
    }
    // Save defaults to localStorage
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  };

  // Handle Login Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = loginUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMsg('Silakan masukkan Username atau Email Anda.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Silakan masukkan Kata Sandi Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      // Match registered user by username or email
      const matched = users.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername ||
          u.email.toLowerCase() === cleanUsername
      );

      if (matched) {
        if (matched.passwordHash && matched.passwordHash !== loginPassword) {
          setIsLoading(false);
          setErrorMsg('Kata sandi yang Anda masukkan salah.');
          return;
        }

        const authenticatedUser: User = {
          id: matched.id,
          username: matched.username,
          name: matched.name,
          email: matched.email,
          companyName: matched.companyName,
          role: matched.role,
          createdAt: matched.createdAt,
        };

        onLoginSuccess(authenticatedUser);
      } else {
        // If account not found in registry, create dynamic account on the fly for seamless access
        const dynamicRole = cleanUsername.includes('admin')
          ? 'Admin'
          : cleanUsername.includes('gudang')
          ? 'Staff Gudang'
          : 'Sales';

        const newUser: User = {
          id: `usr-${Date.now()}`,
          username: cleanUsername,
          name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
          email: cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@tekstil.id`,
          companyName: 'Grosir Tekstil Indonesia',
          role: dynamicRole,
          createdAt: new Date().toISOString(),
        };

        // Save new user account to registry
        const updatedList = [...users, { ...newUser, passwordHash: loginPassword }];
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));

        onLoginSuccess(newUser);
      }
    }, 500);
  };

  // Handle Registration Submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setErrorMsg('Silakan isi Nama Lengkap Anda.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMsg('Silakan isi Username akun Anda.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Silakan masukkan alamat Email yang valid.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMsg('Kata sandi minimal 4 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim().toLowerCase();

    const users = getRegisteredUsers();
    const isExisting = users.some(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );

    if (isExisting) {
      setErrorMsg('Username atau Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newUser: StoredAccount = {
        id: `usr-reg-${Date.now()}`,
        username: cleanUsername,
        name: regName.trim(),
        email: cleanEmail,
        companyName: regCompany.trim() || 'Toko Kain Tekstil Grosir',
        role: regRole,
        passwordHash: regPassword,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));

      const { passwordHash, ...userPayload } = newUser;

      setSuccessMsg(`Pendaftaran berhasil! Selamat datang, ${userPayload.name}`);
      setTimeout(() => {
        onLoginSuccess(userPayload);
      }, 600);
    }, 600);
  };

  // Demo Quick Login Helper
  const handleQuickDemoLogin = (demoAccount: StoredAccount) => {
    setLoginUsername(demoAccount.username);
    setLoginPassword(demoAccount.passwordHash);
    setErrorMsg('');

    setIsLoading(true);
    setTimeout(() => {
      const { passwordHash, ...userPayload } = demoAccount;
      onLoginSuccess(userPayload);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-5 relative z-10 my-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl text-white shadow-xl font-black text-2xl tracking-wider ring-4 ring-slate-800/60 mb-1">
            TXT
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Grosir Tekstil ERP
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sistem Kelola Surat Jalan & Invoice (Multiautentikasi Per-Akun)
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5">
          {/* Mode Tabs: Login vs Register */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" /> Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Daftar Akun Baru
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in">
              <span className="font-bold text-rose-400 mt-0.5">⚠️</span>
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* MODE 1: MASUK (LOGIN) FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Username / Email Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Contoh: admin, sales, atau email Anda"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Kata Sandi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-300">Ingat sesi login saya</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Masuk ke Dashboard
                  </>
                )}
              </button>

              {/* Quick Login Accounts Bar */}
              <div className="pt-3 border-t border-slate-700/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Akses Cepat Akun Demo Sample:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin(DEFAULT_ACCOUNTS[0])}
                    className="p-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 font-semibold text-left transition flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-blue-400">Admin Utama</div>
                      <div className="text-[9px] text-slate-400">username: admin</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin(DEFAULT_ACCOUNTS[1])}
                    className="p-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 font-semibold text-left transition flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-emerald-400">Sales Exec</div>
                      <div className="text-[9px] text-slate-400">username: sales</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MODE 2: DAFTAR AKUN BARU (REGISTER) FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Nama Lengkap Pengguna <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Kanafi Supriadi"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Username Akun <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="kanafi_textile"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Peran / Role <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                  >
                    <option value="Admin">Admin (Akses Penuh)</option>
                    <option value="Sales">Sales / Penjualan</option>
                    <option value="Staff Gudang">Staff Gudang</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Nama Perusahaan / Toko Tekstil
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="Contoh: CV. KANAFI RAYON UTAMA"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Email Akun <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="kanafi@rayontekstil.com"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kata Sandi <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Konfirmasi Sandi <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Mendaftarkan Akun Anda...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Buat Akun Baru & Masuk
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Isolasi Data Terpisah Per-Akun Pengguna Terdaftar</span>
        </div>
      </div>
    </div>
  );
};

