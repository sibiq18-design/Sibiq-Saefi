import React, { useState } from 'react';
import { User } from '../types';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  KeyRound,
  Building2,
  Truck,
  Sparkles
} from 'lucide-react';

export const DEMO_USERS: User[] = [
  {
    id: 'user-1',
    username: 'admin',
    name: 'H. Suherman (Owner)',
    email: 'admin@hitextile.com',
    role: 'Admin',
  },
  {
    id: 'user-2',
    username: 'edo',
    name: 'MZ - Edo',
    email: 'edo.sales@hitextile.com',
    role: 'Sales',
  },
  {
    id: 'user-3',
    username: 'gudang',
    name: 'Budi Kurniawan',
    email: 'gudang@hitextile.com',
    role: 'Staff Gudang',
  },
];

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const foundUser = DEMO_USERS.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername ||
          u.email.toLowerCase() === cleanUsername
      );

      if (foundUser) {
        onLoginSuccess(foundUser);
      } else if (cleanUsername && password) {
        // Fallback for custom username
        const customUser: User = {
          id: `user-${Date.now()}`,
          username: cleanUsername,
          name: cleanUsername.toUpperCase(),
          email: `${cleanUsername}@hitextile.com`,
          role: 'Sales',
        };
        onLoginSuccess(customUser);
      } else {
        setErrorMsg('Username atau kata sandi tidak valid. Silakan coba lagi.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (demoUser: User) => {
    setIsLoading(true);
    setUsername(demoUser.username);
    setPassword('123456');
    setTimeout(() => {
      onLoginSuccess(demoUser);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl text-white shadow-xl font-black text-2xl tracking-wider ring-4 ring-slate-800/60 mb-2">
            TXT
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Grosir Tekstil ERP
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sistem Kelola Surat Jalan & Invoice Tekstil (Roll / Yardage)
          </p>
        </div>

        {/* Login Card Form */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" /> Masuk ke Akun Anda
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Masukkan kredensial pengguna untuk mengakses sistem
              </p>
            </div>
            <span className="px-2 py-1 bg-blue-950/80 text-blue-400 text-[10px] font-mono font-semibold rounded border border-blue-800">
              v2.4 ERP
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
              <span className="font-bold text-rose-400 mt-0.5">⚠️</span>
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / edo / gudang"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                />
                <span className="text-xs text-slate-300">Ingat sesi login saya</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses Login...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Masuk ke Aplikasi
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Cepat Masuk (Pilih Akun Demo)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="w-full p-2.5 bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700/70 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-900/60 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-700">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        User: <span className="font-mono text-slate-300">{u.username}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      u.role === 'Admin'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : u.role === 'Sales'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Sistem Keamanan Terenkripsi & Access Control Grosir Tekstil</span>
        </div>
      </div>
    </div>
  );
};
