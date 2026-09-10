import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, Lock, Store, User, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { loginAsAdmin, registerAdmin, switchToCashier } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('NICE PRESSO');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password strength meter
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleAdminRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (strength < 2) {
      setError('Kata sandi terlalu lemah. Gunakan minimal 6 karakter kombinasi angka & huruf.');
      return;
    }

    const res = registerAdmin(email, password, name, storeName);
    if (res.success) {
      setSuccess('Pendaftaran Admin Berhasil! Mengalihkan ke Dashboard Admin...');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setError(res.error || 'Gagal mendaftar admin.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = loginAsAdmin(email, password);
    if (res.success) {
      setSuccess('Login Admin Berhasil! Membuka Dashboard Admin...');
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setError(res.error || 'Email atau kata sandi tidak cocok.');
    }
  };

  return (
    <div
      id="admin-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {mode === 'register'
                  ? 'Pendaftaran Admin Baru'
                  : mode === 'login'
                  ? 'Login Akun Admin'
                  : 'Masuk Kasir (PIN)'}
              </h3>
              <p className="text-xs text-gray-500">Akses keamanan data POS Nice Presso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-gray-100 p-1 my-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 rounded-lg transition text-center ${
              mode === 'login' ? 'bg-white text-red-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Masuk Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 rounded-lg transition text-center ${
              mode === 'register' ? 'bg-white text-red-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daftar Admin Baru
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Mode 1: Admin Login */}
        {mode === 'login' && (
          <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Admin</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nicepresso.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Kata Sandi Aman</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition active:scale-98 shadow-xs mt-2"
            >
              Masuk Sebagai Admin
            </button>

            {/* Quick Demo Helper */}
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              <span>Akun demo siap pakai:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@nicepresso.com');
                  setPassword('admin123');
                }}
                className="ml-2 font-semibold text-red-600 hover:underline"
              >
                Gunakan demo (admin@nicepresso.com / admin123)
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Admin Registration */}
        {mode === 'register' && (
          <form onSubmit={handleAdminRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nama Pemilik / Admin</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Alfharoby"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nama Brand / Outlet</label>
              <div className="relative">
                <Store className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="NICE PRESSO"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Resmi Admin</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@brandanda.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kata Sandi Aman</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ulangi Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi sandi"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Kekuatan Kata Sandi:</span>
                  <span className="font-semibold text-gray-700">
                    {strength <= 1 ? 'Lemah' : strength <= 3 ? 'Cukup Kuat' : 'Sangat Kuat'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full flex-1 ${strength >= 1 ? 'bg-red-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 ${strength >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 ${strength >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 ${strength >= 4 ? 'bg-emerald-600' : 'bg-transparent'}`} />
                </div>
              </div>
            )}

            <button
              id="admin-register-submit-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition active:scale-98 shadow-xs mt-2"
            >
              Daftarkan Akun Admin
            </button>
          </form>
        )}

        {/* Kasir info and quick return */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <div className="text-[11px] text-gray-500">
            Kasir aktif melayani tanpa login
          </div>
          <button
            type="button"
            onClick={() => {
              switchToCashier();
              onClose();
            }}
            className="text-amber-700 font-semibold text-xs hover:underline"
          >
            Buka Kasir POS &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
