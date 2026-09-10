import { MenuItem, Transaction, User, StockLog, CashierActivity, PrinterConfig, Topping, CartItem } from '../types';

export const INITIAL_TOPPINGS: Topping[] = [
  { id: 'top-1', name: 'Boba Pearl', price: 3000 },
  { id: 'top-2', name: 'Grass Jelly (Cincau)', price: 2000 },
  { id: 'top-3', name: 'Cheese Foam', price: 3000 },
  { id: 'top-4', name: 'Choco Crumb', price: 2000 },
  { id: 'top-5', name: 'Extra Shot Espresso', price: 3000 },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'np-01',
    name: 'Americano Classic',
    category: 'Coffee',
    price: 5000,
    costPrice: 2000,
    stock: 45,
    minStockAlert: 10,
    isAvailable: true,
    badge: '5K',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Espresso murni aromatik dipadukan dengan air dingin/panas segar khas Nice Presso.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-02',
    name: 'Aren Latte',
    category: 'Coffee',
    price: 8000,
    costPrice: 3800,
    stock: 35,
    minStockAlert: 10,
    isAvailable: true,
    badge: '8K',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Perpaduan kopi espresso kental dengan susu segar dan manis legit gula aren asli.',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-03',
    name: 'Choco Blast Crumb',
    category: 'Choco Series',
    price: 8000,
    costPrice: 3900,
    stock: 6, // Low stock on purpose to trigger alert!
    minStockAlert: 10,
    isAvailable: true,
    badge: '8K',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Cokelat lumer pekat dengan taburan remah cokelat krispi melimpah.',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-04',
    name: 'Caramel Cocoa',
    category: 'Choco Series',
    price: 8000,
    costPrice: 3800,
    stock: 28,
    minStockAlert: 10,
    isAvailable: true,
    badge: '8K',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Kombinasi kaya bubuk kakao murni dengan swirl saus karamel lezat.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-05',
    name: 'French Vanilla Latte',
    category: 'Coffee',
    price: 8000,
    costPrice: 4000,
    stock: 19,
    minStockAlert: 10,
    isAvailable: true,
    badge: '8K',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Latte lembut wangi sirup vanila Prancis yang manis seimbang.',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-06',
    name: 'Matcha Signature',
    category: 'Tea & Latte',
    price: 8000,
    costPrice: 4200,
    stock: 22,
    minStockAlert: 10,
    isAvailable: true,
    badge: '8K',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Matcha premium Jepang diseduh dengan susu creamy yang menyegarkan.',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-07',
    name: 'Taro Milky Latte',
    category: 'Tea & Latte',
    price: 8000,
    costPrice: 3800,
    stock: 4, // Low stock on purpose
    minStockAlert: 10,
    isAvailable: true,
    badge: '8K',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Rasa talas taro ungu manis gurih bersatu dengan susu kental manis lembut.',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-08',
    name: 'Golden Butterscotch Latte',
    category: 'Special Flavors',
    price: 10000,
    costPrice: 4800,
    stock: 30,
    minStockAlert: 10,
    isAvailable: true,
    badge: '10K',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Sirup butterscotch emas bermentega mewah berpadu kopi latte istimewa.',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-09',
    name: 'Salted Caramel Latte',
    category: 'Special Flavors',
    price: 10000,
    costPrice: 4800,
    stock: 25,
    minStockAlert: 10,
    isAvailable: true,
    badge: '10K',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Sensasi gurih garam laut berpadu manisnya karamel dan espresso harum.',
    image: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-10',
    name: 'Classic Choco Malt',
    category: 'Choco Series',
    price: 8000,
    costPrice: 3900,
    stock: 40,
    minStockAlert: 10,
    isAvailable: true,
    badge: '8K New',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Rasa cokelat malt klasik legendaris yang manis dan berenergi.',
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-11',
    name: 'Choco Mocha Malt',
    category: 'Choco Series',
    price: 10000,
    costPrice: 5000,
    stock: 20,
    minStockAlert: 10,
    isAvailable: true,
    badge: '10K New',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Perpaduan seimbang kopi mocca harum dengan cokelat malt mantap.',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-12',
    name: 'Avocado Choco Malt',
    category: 'Choco Series',
    price: 10000,
    costPrice: 5200,
    stock: 14,
    minStockAlert: 10,
    isAvailable: true,
    badge: '10K New',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Kesegaran alpukat creamy dengan swirl cokelat malt tebal nikmat.',
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'np-13',
    name: 'Roasted Almond Choco',
    category: 'Choco Series',
    price: 10000,
    costPrice: 5100,
    stock: 5, // Low stock on purpose
    minStockAlert: 10,
    isAvailable: true,
    badge: '10K New',
    hasIceHotOption: true,
    hasSugarOption: true,
    description: 'Cokelat kental harum dengan cita rasa kacang almond sangrai yang gurih.',
    image: 'https://images.unsplash.com/photo-1610889556528-9a770e32644f?w=400&auto=format&fit=crop&q=80',
  },
];

export const DEFAULT_ADMIN: User = {
  id: 'user-admin-1',
  email: 'admin@nicepresso.com',
  name: 'Owner Admin',
  role: 'admin',
  passwordHash: 'admin123',
  isActive: true,
  createdAt: '2026-01-01T08:00:00Z',
  lastActive: new Date().toISOString(),
};

export const DEFAULT_CASHIER: User = {
  id: 'user-cashier-1',
  email: 'kasir@nicepresso.com',
  name: 'Kasir Nice Presso',
  role: 'cashier',
  pin: '1234',
  isActive: true,
  createdAt: '2026-01-10T08:00:00Z',
  lastActive: new Date().toISOString(),
};

export const INITIAL_USERS: User[] = [DEFAULT_ADMIN, DEFAULT_CASHIER];

export const INITIAL_PRINTER_CONFIG: PrinterConfig = {
  name: 'Thermal Bluetooth POS-58',
  paperWidth: '58mm',
  autoPrintOnCheckout: true,
  footerMessage: 'Terima kasih atas kunjungan Anda!\nFollow IG: @nicepresso.id',
  storeName: 'NICE PRESSO',
  storeAddress: 'Jl. Boulevard Raya No. 42, Kota',
  storePhone: '0812-3456-7890',
  isConnected: false,
};

// Generate realistic seeded transactions for today, past 7 days, this month, and past months in 2026
export function generateSeedTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // Helper to format date YYYY-MM-DD
  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  let counter = 100;

  // 1. Transactions for TODAY
  const todayTimes = ['09:15:20', '10:02:11', '11:20:45', '12:45:00', '13:30:15', '14:10:22', '15:25:50', '16:40:10'];
  todayTimes.forEach((timeStr, idx) => {
    counter++;
    const isRian = idx % 2 === 0;
    const isQris = idx % 3 === 0;
    const item1 = INITIAL_MENU_ITEMS[idx % INITIAL_MENU_ITEMS.length];
    const item2 = INITIAL_MENU_ITEMS[(idx + 3) % INITIAL_MENU_ITEMS.length];
    const qty1 = (idx % 2) + 1;
    const qty2 = idx % 3 === 0 ? 1 : 0;

    const cartItems: CartItem[] = [
      {
        cartId: `ci-${counter}-1`,
        menuItemId: item1.id,
        name: item1.name,
        price: item1.price,
        costPrice: item1.costPrice,
        qty: qty1,
        variant: 'Ice',
        sugarLevel: 'Normal (100%)',
        iceLevel: 'Normal Ice',
        toppings: idx % 2 === 0 ? [{ id: 'top-1', name: 'Boba Pearl', price: 3000 }] : [],
        subtotal: item1.price * qty1 + (idx % 2 === 0 ? 3000 * qty1 : 0),
      },
    ];

    if (qty2 > 0) {
      cartItems.push({
        cartId: `ci-${counter}-2`,
        menuItemId: item2.id,
        name: item2.name,
        price: item2.price,
        costPrice: item2.costPrice,
        qty: qty2,
        variant: 'Hot',
        sugarLevel: 'Less Sugar (70%)',
        iceLevel: 'No Ice',
        toppings: [],
        subtotal: item2.price * qty2,
      });
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCost = cartItems.reduce((sum, item) => sum + (item.costPrice * item.qty), 0);
    const total = subtotal;

    transactions.push({
      id: `trx-${counter}`,
      invoiceNumber: `NP-${formatDate(now).replace(/-/g, '')}-${String(counter).padStart(4, '0')}`,
      date: formatDate(now),
      time: timeStr,
      timestamp: new Date(`${formatDate(now)}T${timeStr}`).getTime(),
      cashierId: isRian ? 'user-cashier-1' : 'user-cashier-2',
      cashierName: isRian ? 'Rian (Kasir Pagi)' : 'Bella (Kasir Sore)',
      items: cartItems,
      totalQty: cartItems.reduce((sum, i) => sum + i.qty, 0),
      subtotal,
      discount: 0,
      tax: 0,
      total,
      totalCost,
      profit: total - totalCost,
      paymentMethod: isQris ? 'qris' : 'cash',
      cashAmountReceived: isQris ? undefined : Math.ceil(total / 10000) * 10000 + 10000,
      changeGiven: isQris ? undefined : (Math.ceil(total / 10000) * 10000 + 10000) - total,
      status: 'completed',
    });
  });

  // 2. Transactions for past days in this month
  for (let d = 1; d < Math.min(day, 28); d++) {
    const pastDate = new Date(year, month, d, 12, 0, 0);
    const dateStr = formatDate(pastDate);
    const countPerDay = 3 + (d % 4);
    for (let c = 0; c < countPerDay; c++) {
      counter++;
      const item = INITIAL_MENU_ITEMS[(d + c) % INITIAL_MENU_ITEMS.length];
      const qty = (c % 2) + 1;
      const subtotal = item.price * qty;
      const totalCost = item.costPrice * qty;
      transactions.push({
        id: `trx-${counter}`,
        invoiceNumber: `NP-${dateStr.replace(/-/g, '')}-${String(counter).padStart(4, '0')}`,
        date: dateStr,
        time: `${String(10 + c * 2).padStart(2, '0')}:30:00`,
        timestamp: new Date(`${dateStr}T${String(10 + c * 2).padStart(2, '0')}:30:00`).getTime(),
        cashierId: 'user-cashier-1',
        cashierName: 'Kasir Nice Presso',
        items: [
          {
            cartId: `ci-${counter}`,
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            costPrice: item.costPrice,
            qty,
            variant: 'Ice',
            sugarLevel: 'Normal (100%)',
            iceLevel: 'Normal Ice',
            toppings: [],
            subtotal,
          },
        ],
        totalQty: qty,
        subtotal,
        discount: 0,
        tax: 0,
        total: subtotal,
        totalCost,
        profit: subtotal - totalCost,
        paymentMethod: c % 2 === 0 ? 'cash' : 'qris',
        status: 'completed',
      });
    }
  }

  // 3. Transactions for previous months of the year for annual reporting
  for (let m = 0; m < month; m++) {
    for (let d = 1; d <= 25; d += 4) {
      const pastDate = new Date(year, m, d, 14, 0, 0);
      const dateStr = formatDate(pastDate);
      counter++;
      const item = INITIAL_MENU_ITEMS[d % INITIAL_MENU_ITEMS.length];
      const qty = 3;
      const subtotal = item.price * qty;
      const totalCost = item.costPrice * qty;
      transactions.push({
        id: `trx-${counter}`,
        invoiceNumber: `NP-${dateStr.replace(/-/g, '')}-${String(counter).padStart(4, '0')}`,
        date: dateStr,
        time: '14:00:00',
        timestamp: pastDate.getTime(),
        cashierId: 'user-cashier-1',
        cashierName: 'Rian (Kasir Pagi)',
        items: [
          {
            cartId: `ci-${counter}`,
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            costPrice: item.costPrice,
            qty,
            variant: 'Ice',
            sugarLevel: 'Normal (100%)',
            iceLevel: 'Normal Ice',
            toppings: [],
            subtotal,
          },
        ],
        totalQty: qty,
        subtotal,
        discount: 0,
        tax: 0,
        total: subtotal,
        totalCost,
        profit: subtotal - totalCost,
        paymentMethod: 'cash',
        status: 'completed',
      });
    }
  }

  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

export const INITIAL_ACTIVITIES: CashierActivity[] = [
  {
    id: 'act-1',
    cashierId: 'user-cashier-1',
    cashierName: 'Kasir Nice Presso',
    action: 'shift_start',
    details: 'Membuka terminal kasir aktif (Saldo awal kas: Rp 100.000)',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-2',
    cashierId: 'user-cashier-1',
    cashierName: 'Kasir Nice Presso',
    action: 'login',
    details: 'Terminal Kasir siap melayani pesanan pelanggan',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000 + 60000).toISOString(),
  },
  {
    id: 'act-3',
    cashierId: 'user-cashier-1',
    cashierName: 'Kasir Nice Presso',
    action: 'sale',
    details: 'Transaksi berhasil #NP-0101 (Aren Latte x2, Boba)',
    amount: 19000,
    invoiceNumber: 'NP-0101',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_STOCK_LOGS: StockLog[] = [
  {
    id: 'sl-1',
    menuItemId: 'np-03',
    menuItemName: 'Choco Blast Crumb',
    changeQty: -4,
    prevStock: 10,
    newStock: 6,
    reason: 'sale',
    notes: 'Penjualan minuman kasir',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedBy: 'Sistem POS',
  },
  {
    id: 'sl-2',
    menuItemId: 'np-07',
    menuItemName: 'Taro Milky Latte',
    changeQty: -6,
    prevStock: 10,
    newStock: 4,
    reason: 'sale',
    notes: 'Penjualan minuman kasir',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedBy: 'Sistem POS',
  },
  {
    id: 'sl-3',
    menuItemId: 'np-01',
    menuItemName: 'Americano Classic',
    changeQty: 30,
    prevStock: 15,
    newStock: 45,
    reason: 'restock',
    notes: 'Restock biji kopi & cup harian dari supplier',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedBy: 'Owner Admin',
  },
];
