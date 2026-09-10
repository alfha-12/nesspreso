import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import {
  Package,
  AlertTriangle,
  Plus,
  RefreshCw,
  History,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  X,
  Search,
} from 'lucide-react';

export const StockManagementView: React.FC = () => {
  const { menuItems, stockLogs, restockItem, adjustStock } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  // Restock Modal
  const [restockTarget, setRestockTarget] = useState<MenuItem | null>(null);
  const [addQty, setAddQty] = useState<number>(20);
  const [restockNotes, setRestockNotes] = useState('');

  // Adjustment Modal
  const [adjustTarget, setAdjustTarget] = useState<MenuItem | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<'adjustment' | 'waste'>('adjustment');
  const [adjustNotes, setAdjustNotes] = useState('');

  const handleOpenRestock = (item: MenuItem) => {
    setRestockTarget(item);
    setAddQty(20);
    setRestockNotes('Restock cup & bahan minuman rutin');
  };

  const handleOpenAdjust = (item: MenuItem) => {
    setAdjustTarget(item);
    setNewStockVal(item.stock);
    setAdjustReason('adjustment');
    setAdjustNotes('');
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockTarget && addQty > 0) {
      restockItem(restockTarget.id, addQty, restockNotes);
      setRestockTarget(null);
    }
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustTarget && newStockVal >= 0) {
      adjustStock(adjustTarget.id, newStockVal, adjustReason, adjustNotes);
      setAdjustTarget(null);
    }
  };

  const filteredItems = menuItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = menuItems.filter((i) => i.stock <= i.minStockAlert).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Pencatatan Stok &amp; Inventori Minuman
            </h1>
            {lowStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>{lowStockCount} Stok Menipis</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pantau ketersediaan stok fisik, penambahan stok (restock), serta riwayat pemakaian real-time.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'inventory'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daftar Stok Produk
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'history'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Riwayat Log Stok ({stockLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama minuman..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
              />
            </div>

            <div className="text-xs text-gray-500">
              Total {filteredItems.length} menu tercatat
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Menu Minuman</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Stok Saat Ini</th>
                    <th className="py-3 px-4 text-center">Batas Minimum</th>
                    <th className="py-3 px-4 text-center">Status Stok</th>
                    <th className="py-3 px-4 text-center">Tindakan Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => {
                    const isLow = item.stock <= item.minStockAlert && item.stock > 0;
                    const isOut = item.stock <= 0;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/70 transition ${
                          isOut
                            ? 'bg-red-50/30'
                            : isLow
                            ? 'bg-amber-50/20'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.category}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-extrabold text-sm text-gray-900">
                            {item.stock}
                          </span>{' '}
                          <span className="text-[10px] text-gray-400">cup</span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500">
                          {item.minStockAlert} cup
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Habis</span>
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Menipis</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aman</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenRestock(item)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold transition text-xs"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Restock</span>
                            </button>

                            <button
                              onClick={() => handleOpenAdjust(item)}
                              className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition text-xs"
                              title="Penyesuaian Fisik / Waste"
                            >
                              Koreksi
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* History Logs Tab */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">
              Riwayat Perubahan Stok (Audit Trail)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Menu Minuman</th>
                  <th className="py-3 px-4">Tipe Alasan</th>
                  <th className="py-3 px-4 text-center">Perubahan</th>
                  <th className="py-3 px-4 text-center">Stok Awal &rarr; Akhir</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4">Diubah Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stockLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Belum ada catatan log stok.
                    </td>
                  </tr>
                ) : (
                  stockLogs.map((log) => {
                    const isPositive = log.changeQty > 0;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {log.menuItemName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.reason === 'restock'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.reason === 'sale'
                                ? 'bg-blue-100 text-blue-800'
                                : log.reason === 'waste'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {log.reason}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span
                            className={
                              isPositive ? 'text-emerald-600' : 'text-red-600'
                            }
                          >
                            {isPositive ? `+${log.changeQty}` : log.changeQty} cup
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {log.prevStock} &rarr; <span className="font-bold text-gray-900">{log.newStock}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 italic max-w-xs truncate">
                          {log.notes || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {log.updatedBy}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Restock Minuman</h3>
              <button
                onClick={() => setRestockTarget(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="my-4 space-y-3.5 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-gray-500 text-[11px]">Menu yang direstock:</div>
                <div className="font-bold text-gray-900 text-sm">{restockTarget.name}</div>
                <div className="text-gray-600 text-xs mt-0.5">
                  Stok saat ini: <strong>{restockTarget.stock} cup</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Jumlah Penambahan Stok (Cup)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value))}
                  className="w-full font-bold px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />

                <div className="flex gap-1.5 mt-2">
                  {[10, 20, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAddQty(preset)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px]"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Catatan / Nomor Invoice Supplier
                </label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder="Contoh: Pengiriman susu & cup dari gudang"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs"
                >
                  Konfirmasi Restock (+{addQty})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Koreksi Stok Fisik</h3>
              <button
                onClick={() => setAdjustTarget(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="my-4 space-y-3.5 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="font-bold text-gray-900">{adjustTarget.name}</div>
                <div className="text-gray-600 text-xs">
                  Stok sistem tercatat: <strong>{adjustTarget.stock} cup</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Stok Fisik Aktual Baru (Cup)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(Number(e.target.value))}
                  className="w-full font-bold px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Alasan Penyesuaian</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden bg-white"
                >
                  <option value="adjustment">Penyesuaian Opname Fisik</option>
                  <option value="waste">Barang Rusak / Tumpah (Waste)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Keterangan Tambahan</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Alasan selisih stok..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold transition shadow-xs"
                >
                  Simpan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
