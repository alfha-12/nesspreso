import React, { useState } from 'react';
import { MenuItem, Topping } from '../types';
import { INITIAL_TOPPINGS } from '../data/initialData';
import { X, Plus, Minus, Check, Flame, Snowflake } from 'lucide-react';

interface DrinkCustomizeModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    variant: 'Ice' | 'Hot',
    sugarLevel: 'Normal (100%)' | 'Less Sugar (70%)' | 'Half Sugar (50%)' | 'No Sugar (0%)',
    iceLevel: 'Normal Ice' | 'Less Ice' | 'No Ice',
    toppings: Topping[],
    qty: number,
    notes: string
  ) => void;
}

export const DrinkCustomizeModal: React.FC<DrinkCustomizeModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [variant, setVariant] = useState<'Ice' | 'Hot'>('Ice');
  const [sugarLevel, setSugarLevel] = useState<
    'Normal (100%)' | 'Less Sugar (70%)' | 'Half Sugar (50%)' | 'No Sugar (0%)'
  >('Normal (100%)');
  const [iceLevel, setIceLevel] = useState<'Normal Ice' | 'Less Ice' | 'No Ice'>('Normal Ice');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  const toggleTopping = (topping: Topping) => {
    if (selectedToppings.find((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const toppingsCost = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = item.price + toppingsCost;
  const totalPrice = unitPrice * qty;

  const handleConfirm = () => {
    onAddToCart(item, variant, sugarLevel, iceLevel, selectedToppings, qty, notes);
    onClose();
  };

  return (
    <div
      id="drink-customize-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover shadow-xs border border-gray-100"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-700">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">{item.category}</p>
              <div className="text-sm font-extrabold text-red-600 mt-0.5">
                Rp {item.price.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
          <button
            id="close-customize-modal-btn"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Options */}
        <div className="my-4 space-y-4 max-h-[50vh] overflow-y-auto pr-1 text-xs">
          {/* Temperature Variant: Ice or Hot */}
          {item.hasIceHotOption && (
            <div>
              <label className="font-bold text-gray-800 block mb-1.5">Suhu Minuman</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVariant('Ice')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition ${
                    variant === 'Ice'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Snowflake className="w-4 h-4 text-blue-500" />
                  <span>Dingin (Ice)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVariant('Hot')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition ${
                    variant === 'Hot'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Panas (Hot)</span>
                </button>
              </div>
            </div>
          )}

          {/* Sugar Level */}
          {item.hasSugarOption && (
            <div>
              <label className="font-bold text-gray-800 block mb-1.5">Tingkat Kemanisan (Sugar)</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    'Normal (100%)',
                    'Less Sugar (70%)',
                    'Half Sugar (50%)',
                    'No Sugar (0%)',
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSugarLevel(lvl)}
                    className={`py-2 px-2.5 rounded-lg border text-center transition font-medium ${
                      sugarLevel === lvl
                        ? 'border-red-600 bg-red-50 text-red-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ice Level (if Ice variant) */}
          {variant === 'Ice' && (
            <div>
              <label className="font-bold text-gray-800 block mb-1.5">Takaran Es Batu (Ice)</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Normal Ice', 'Less Ice', 'No Ice'] as const).map((ice) => (
                  <button
                    key={ice}
                    type="button"
                    onClick={() => setIceLevel(ice)}
                    className={`py-2 px-2 rounded-lg border text-center transition font-medium ${
                      iceLevel === ice
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {ice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toppings Selection */}
          <div>
            <label className="font-bold text-gray-800 block mb-1.5">
              Topping Tambahan (Opsional)
            </label>
            <div className="space-y-1.5">
              {INITIAL_TOPPINGS.map((topping) => {
                const isChecked = !!selectedToppings.find((t) => t.id === topping.id);
                return (
                  <div
                    key={topping.id}
                    onClick={() => toggleTopping(topping)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      isChecked
                        ? 'border-red-500 bg-red-50/40 text-gray-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                          isChecked
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-medium">{topping.name}</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      +Rp {topping.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="font-bold text-gray-800 block mb-1">Catatan Khusus</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pisahkan es, susu oat, dll."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
            />
          </div>
        </div>

        {/* Bottom Bar: Quantity & Add to Cart */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-gray-800">{qty}</span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            id="confirm-add-drink-btn"
            type="button"
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition active:scale-98 shadow-xs"
          >
            <span>Tambah ke Pesanan</span>
            <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
