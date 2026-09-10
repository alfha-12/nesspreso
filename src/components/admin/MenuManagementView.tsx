import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem, BeverageCategory } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  Coffee,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react';

const CATEGORIES: Array<MenuItem['category']> = [
  'Coffee',
  'Choco Series',
  'Tea & Latte',
  'Special Flavors',
];

export const MenuManagementView: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuItem['category']>('Coffee');
  const [price, setPrice] = useState<number>(8000);
  const [costPrice, setCostPrice] = useState<number>(4000);
  const [stock, setStock] = useState<number>(30);
  const [minStockAlert, setMinStockAlert] = useState<number>(10);
  const [badge, setBadge] = useState('8K');
  const [image, setImage] = useState('');
  const [hasIceHotOption, setHasIceHotOption] = useState(true);
  const [hasSugarOption, setHasSugarOption] = useState(true);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('Coffee');
    setPrice(8000);
    setCostPrice(4000);
    setStock(30);
    setMinStockAlert(10);
    setBadge('8K');
    setImage('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80');
    setHasIceHotOption(true);
    setHasSugarOption(true);
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setCostPrice(item.costPrice);
    setStock(item.stock);
    setMinStockAlert(item.minStockAlert);
    setBadge(item.badge || '');
    setImage(item.image || '');
    setHasIceHotOption(item.hasIceHotOption);
    setHasSugarOption(item.hasSugarOption);
    setDescription(item.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Form Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Nama menu minuman wajib diisi.');
      return;
    }
    if (price <= 0) {
      setFormError('Harga jual harus lebih dari 0.');
      return;
    }

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: name.trim(),
        category,
        price,
        costPrice,
        stock,
        minStockAlert,
        badge: badge.trim(),
        image: image.trim(),
        hasIceHotOption,
        hasSugarOption,
        description: description.trim(),
      });
    } else {
      addMenuItem({
        name: name.trim(),
        category,
        price,
        costPrice,
        stock,
        minStockAlert,
        isAvailable: true,
        badge: badge.trim() || `${Math.round(price / 1000)}K`,
        image: image.trim(),
        hasIceHotOption,
        hasSugarOption,
        description: description.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: MenuItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus menu "${item.name}"?`)) {
      deleteMenuItem(item.id);
    }
  };

  // Filter menu
  const filtered = menuItems.filter((item) => {
    const matchCat = categoryFilter === 'all' ? true : item.category === categoryFilter;
    const matchQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Add Button */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Manajemen Menu Minuman
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
              {menuItems.length} Produk
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tambah varian minuman baru, perbarui harga &amp; HPP, atur opsi suhu/gula, serta ketersediaan.
          </p>
        </div>

        <button
          id="add-menu-btn"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition active:scale-98 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Minuman Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500">Kategori:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white outline-hidden"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Cards Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Minuman</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">HPP (Modal)</th>
                <th className="py-3 px-4 text-right">Margin / Cup</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => {
                const margin = item.price - item.costPrice;
                const isLow = item.stock <= item.minStockAlert;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200'}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-100 text-red-700">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">
                            {item.description || 'Tidak ada deskripsi'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-500">
                      Rp {item.costPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      +Rp {margin.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                          item.stock <= 0
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.stock} cup
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Tersedia</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Habis</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Menu"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus Menu"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Menu Modal */}
      {isModalOpen && (
        <div
          id="menu-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                {editingItem ? 'Edit Minuman' : 'Tambah Minuman Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
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

            <form onSubmit={handleSave} className="my-4 space-y-3.5 text-xs max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Minuman *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Roasted Almond Choco"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Label / Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Contoh: 10K, New, Favorit"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full font-bold px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">HPP / Modal Bahan (Rp)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stok Tersedia (Cup)</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batas Peringatan Stok Menipis</label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">URL Foto Minuman</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                  />
                  {image && (
                    <img
                      src={image}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover border"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Deskripsi Minuman</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan rasa atau komposisi..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasIceHotOption}
                    onChange={(e) => setHasIceHotOption(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="text-gray-700">Tersedia opsi Dingin (Ice) &amp; Panas (Hot)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSugarOption}
                    onChange={(e) => setHasSugarOption(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="text-gray-700">Tersedia pengaturan takaran gula (Sugar level)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition active:scale-98 shadow-xs"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
