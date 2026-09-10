import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem, BeverageCategory, PaymentMethod } from '../../types';
import { DrinkCustomizeModal } from '../DrinkCustomizeModal';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  QrCode,
  Banknote,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
} from 'lucide-react';

const CATEGORIES: BeverageCategory[] = [
  'All',
  'Coffee',
  'Choco Series',
  'Tea & Latte',
  'Special Flavors',
];

export const PosView: React.FC = () => {
  const {
    menuItems,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkout,
    currentUser,
    printerConfig,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<BeverageCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrinkForCustomization, setSelectedDrinkForCustomization] = useState<MenuItem | null>(null);

  // Payment Checkout Modal
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory =
        selectedCategory === 'All' ? true : item.category === selectedCategory;
      const matchQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount);
  const changeAmount = Math.max(0, cashGiven - grandTotal);
  const isCashSufficient = cashGiven >= grandTotal;

  // Open Checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setDiscountAmount(0);
    setCashGiven(grandTotal);
    setCheckoutError(null);
    setIsCheckoutModalOpen(true);
  };

  // Perform checkout
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setCheckoutError(null);
    try {
      const res = await checkout(
        paymentMethod,
        paymentMethod === 'cash' ? cashGiven : undefined,
        discountAmount
      );
      if (res.success) {
        setIsCheckoutModalOpen(false);
      } else {
        setCheckoutError(res.error || 'Gagal memproses transaksi.');
      }
    } catch (err: any) {
      setCheckoutError(err?.message || 'Terjadi kesalahan sistem pembayaran.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Product Catalog */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Bar: Search & Status */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari menu minuman..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Kasir Aktif:</span>
                <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                  {currentUser?.name || 'Kasir Standar'}
                </span>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'All' ? 'Semua Menu' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {filteredMenuItems.map((item) => {
              const isOutOfStock = item.stock <= 0 || !item.isAvailable;
              const isLowStock = item.stock > 0 && item.stock <= item.minStockAlert;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!isOutOfStock) {
                      setSelectedDrinkForCustomization(item);
                    }
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-3 transition duration-150 ${
                    isOutOfStock
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-red-400 hover:shadow-md cursor-pointer active:scale-98'
                  }`}
                >
                  {/* Image / Thumbnail */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-2">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                        {item.name.charAt(0)}
                      </div>
                    )}

                    {/* Price Badge on Top Right */}
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/75 text-white font-extrabold text-[10px] backdrop-blur-xs">
                      {item.badge || `Rp ${Math.round(item.price / 1000)}k`}
                    </div>

                    {/* Low Stock or Out of Stock Badge */}
                    {isOutOfStock ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                        Habis
                      </div>
                    ) : isLowStock ? (
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold text-[9px]">
                        Sisa {item.stock}
                      </div>
                    ) : null}
                  </div>

                  {/* Drink Info */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-xs line-clamp-2 leading-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-extrabold text-red-600">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Stok: {item.stock}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMenuItems.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-gray-700">Menu tidak ditemukan</p>
              <p className="text-xs mt-1">Coba gunakan kata kunci lain atau pilih kategori lain.</p>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Order Cart & Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col h-[calc(100vh-140px)] sticky top-20">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Pesanan Sekarang</h3>
                  <span className="text-[10px] text-gray-500">
                    {cart.reduce((s, i) => s + i.qty, 0)} cup minuman
                  </span>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  id="clear-cart-btn"
                  onClick={clearCart}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                  title="Kosongkan Keranjang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-12">
                  <ShoppingCart className="w-10 h-10 stroke-1 text-gray-300" />
                  <p className="font-bold text-gray-600 text-xs">Keranjang Masih Kosong</p>
                  <p className="text-[11px] max-w-[200px]">
                    Klik menu minuman di sebelah kiri untuk menambahkan ke pesanan.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="pt-2 first:pt-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-gray-900 text-xs">
                          {item.name}{' '}
                          <span className="text-red-600 font-semibold">[{item.variant}]</span>
                        </div>
                        <div className="text-[10px] text-gray-500 space-x-1">
                          <span>{item.sugarLevel.split(' ')[0]} sugar</span>
                          {item.variant === 'Ice' && <span>• {item.iceLevel}</span>}
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="text-[10px] text-gray-600">
                            + {item.toppings.map((t) => t.name).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[9px] text-gray-400 italic">
                            Ket: {item.notes}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-gray-300 hover:text-red-600 transition p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-extrabold text-gray-900">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </span>

                      {/* Qty Stepper */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button
                          onClick={() => updateCartQty(item.cartId, -1)}
                          className="p-1 hover:bg-white text-gray-600 rounded-l-lg transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-gray-800">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.cartId, 1)}
                          className="p-1 hover:bg-white text-gray-600 rounded-r-lg transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Calculations & Checkout Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50/70 rounded-b-2xl space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Minuman</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total Tagihan</span>
                    <span className="text-red-600">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button
                  id="checkout-trigger-btn"
                  onClick={handleOpenCheckout}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition active:scale-98 shadow-xs flex items-center justify-center gap-2"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Bayar Sekarang (Rp {subtotal.toLocaleString('id-ID')})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drink Customization Modal */}
      {selectedDrinkForCustomization && (
        <DrinkCustomizeModal
          item={selectedDrinkForCustomization}
          onClose={() => setSelectedDrinkForCustomization(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Checkout & Payment Modal */}
      {isCheckoutModalOpen && (
        <div
          id="checkout-payment-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Pembayaran Transaksi</h3>
                <p className="text-xs text-gray-500">Pilih metode pembayaran pelanggan</p>
              </div>
              <button
                id="close-checkout-btn"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {checkoutError && (
              <div className="my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Bill Summary */}
            <div className="my-4 p-4 rounded-xl bg-red-50/60 border border-red-100 text-center">
              <div className="text-xs text-red-700 font-semibold uppercase tracking-wider">
                Total Tagihan
              </div>
              <div className="text-2xl font-extrabold text-red-600 mt-1">
                Rp {grandTotal.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {cart.reduce((sum, item) => sum + item.qty, 0)} item pesanan
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition ${
                    paymentMethod === 'cash'
                      ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-red-600" />
                  <span>Tunai (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition ${
                    paymentMethod === 'qris'
                      ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-red-600" />
                  <span>QRIS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('debit')}
                  className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition ${
                    paymentMethod === 'debit'
                      ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-red-600" />
                  <span>Debit/Transfer</span>
                </button>
              </div>

              {/* Cash Input & Quick Keys */}
              {paymentMethod === 'cash' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Nominal Uang Tunai Diterima (Rp)
                    </label>
                    <input
                      type="number"
                      value={cashGiven || ''}
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      placeholder="Contoh: 50000"
                      className="w-full text-lg font-bold px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden font-mono"
                    />
                  </div>

                  {/* Fast nominal buttons */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCashGiven(grandTotal)}
                      className="py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px]"
                    >
                      Uang Pas
                    </button>
                    {[10000, 20000, 50000, 100000].map((nominal) => (
                      <button
                        key={nominal}
                        type="button"
                        onClick={() => setCashGiven(nominal)}
                        className="py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px]"
                      >
                        Rp {nominal / 1000}k
                      </button>
                    ))}
                  </div>

                  {/* Kembalian Box */}
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <span className="text-gray-600 font-semibold">Kembalian:</span>
                    <span
                      className={`text-base font-extrabold ${
                        isCashSufficient ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {isCashSufficient
                        ? `Rp ${changeAmount.toLocaleString('id-ID')}`
                        : `Kurang Rp ${(grandTotal - cashGiven).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              )}

              {/* QRIS Realistic Preview */}
              {paymentMethod === 'qris' && (
                <div className="text-center py-3 space-y-2 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="mx-auto w-44 h-44 bg-white p-2.5 rounded-xl border border-gray-300 shadow-xs flex flex-col items-center justify-center">
                    {/* Simulated Clean QRIS Matrix */}
                    <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-800 rounded-lg p-2 flex flex-col items-center justify-center text-white text-[10px]">
                      <QrCode className="w-24 h-24 text-white" />
                      <span className="font-extrabold tracking-wider mt-1">QRIS STANDAR POS</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Arahkan pelanggan scan QRIS via GoPay, OVO, Dana, BCA, atau Livin Mandiri.
                  </div>
                </div>
              )}

              {/* Debit/Transfer Notes */}
              {paymentMethod === 'debit' && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Pembayaran EDC / Transfer Bank</span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Pastikan mesin EDC telah mengeluarkan struk approval atau bukti transfer bank telah masuk ke rekening outlet.
                  </p>
                </div>
              )}

              {/* Auto Thermal Print Notification */}
              {printerConfig.isConnected && printerConfig.autoPrintOnCheckout && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px]">
                  <Printer className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Struk akan otomatis dicetak ke {printerConfig.name}.</span>
                </div>
              )}
            </div>

            {/* Confirm Payment Action Button */}
            <div className="mt-5 pt-3 border-t border-gray-100">
              <button
                id="submit-payment-btn"
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing || (paymentMethod === 'cash' && !isCashSufficient)}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition active:scale-98 shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Memproses Transaksi...'
                    : `Selesaikan Transaksi (Rp ${grandTotal.toLocaleString('id-ID')})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
