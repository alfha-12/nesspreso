import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  Users,
  UserPlus,
  KeyRound,
  Shield,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit2,
  X,
  AlertCircle,
} from 'lucide-react';

export const CashierManagementView: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    cashierActivities,
    transactions,
    currentUser,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [pin, setPin] = useState('1234');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('cashier');
    setPin('1234');
    setPassword('');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPin(u.pin || '1234');
    setPassword(u.password || '');
    setIsActive(u.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setFormError('Email akun wajib diisi.');
      return;
    }
    if (role === 'cashier' && (!pin || pin.length < 4)) {
      setFormError('PIN kasir minimal 4 digit angka.');
      return;
    }
    if (role === 'admin' && !editingUser && (!password || password.length < 6)) {
      setFormError('Kata sandi admin minimal 6 karakter.');
      return;
    }

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        role,
        pin: pin.trim(),
        password: password ? password.trim() : editingUser.password,
        isActive,
      });
    } else {
      addUser({
        name: name.trim(),
        email: email.trim(),
        role,
        pin: pin.trim(),
        password: password.trim() || 'admin123',
        isActive,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (u: User) => {
    if (u.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${u.name}?`)) {
      deleteUser(u.id);
    }
  };

  // Activity logs filtered
  const filteredActivities = cashierActivities.filter((act) => {
    if (selectedUserFilter === 'all') return true;
    return act.cashierId === selectedUserFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Kelola Akses &amp; Akun Petugas Kasir
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {users.length} Akun Terdaftar
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Atur hak akses staf, buat PIN cepat kasir, aktifkan/nonaktifkan akun, dan audit aktivitas operasional.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition active:scale-98 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Petugas Kasir</span>
        </button>
      </div>

      {/* User Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          // Calculate total transactions & revenue made by this user
          const userTransactions = transactions.filter(
            (t) => t.cashierId === u.id && t.status === 'completed'
          );
          const totalSales = userTransactions.reduce((sum, t) => sum + t.total, 0);

          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition ${
                u.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50/70 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-sm ${
                        u.role === 'admin' ? 'bg-red-600' : 'bg-amber-600'
                      }`}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.id === currentUser?.id && (
                          <span className="text-[9px] font-extrabold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                            Saya
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-gray-500">{u.email}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      u.role === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] block">PIN Akses Kasir</span>
                    <div className="font-mono font-bold text-gray-800 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-gray-400" />
                      <span>{u.pin || '••••'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[10px] block">Status Akses</span>
                    <div className="font-bold flex items-center gap-1">
                      {u.isActive ? (
                        <span className="text-emerald-700 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-0.5">
                          <XCircle className="w-3 h-3" />
                          <span>Nonaktif</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sales Performance Summary */}
                <div className="mt-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>Total Penjualan:</span>
                    <span className="font-bold text-gray-900">
                      {userTransactions.length} Transaksi
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-red-600 text-xs mt-0.5">
                    <span>Omset Kasir:</span>
                    <span>Rp {totalSales.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Akses</span>
                </button>

                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => handleDelete(u)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Hapus Akun Kasir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cashier Activity Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="font-bold text-gray-900 text-sm">
              Catatan Log Aktivitas Kasir ({filteredActivities.length})
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Filter Kasir:</span>
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-semibold outline-hidden"
            >
              <option value="all">Semua Petugas</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Nama Kasir</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
                <th className="py-3 px-4">Rincian Aktivitas</th>
                <th className="py-3 px-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Tidak ada catatan aktivitas untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {act.cashierName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          act.action === 'sale'
                            ? 'bg-emerald-100 text-emerald-800'
                            : act.action === 'login'
                            ? 'bg-blue-100 text-blue-800'
                            : act.action === 'void'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {act.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {act.details}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                      {act.amount !== undefined ? `Rp ${act.amount.toLocaleString('id-ID')}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Cashier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                {editingUser ? 'Edit Hak Akses Akun' : 'Tambah Akun Petugas Kasir'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Email Akun *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kasir@nicepresso.com"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tingkat Akses (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden bg-white"
                  >
                    <option value="cashier">Petugas Kasir</option>
                    <option value="admin">Owner / Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">PIN Cepat Kasir (4 Digit)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full font-mono text-center font-bold px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                </div>
              </div>

              {role === 'admin' && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Kata Sandi Admin {editingUser ? '(Kosongkan jika tidak diganti)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="font-semibold text-gray-800">
                    Akun ini Aktif dan dapat masuk ke terminal kasir
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
