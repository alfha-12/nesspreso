import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  MenuItem,
  Transaction,
  CartItem,
  StockLog,
  CashierActivity,
  PrinterConfig,
  PaymentMethod,
  LowStockAlert,
  Topping,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_USERS,
  DEFAULT_ADMIN,
  DEFAULT_CASHIER,
  INITIAL_PRINTER_CONFIG,
  INITIAL_ACTIVITIES,
  INITIAL_STOCK_LOGS,
  generateSeedTransactions,
} from '../data/initialData';
import { bluetoothPrinterService } from '../services/bluetoothPrinter';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Auth & Roles
  currentUser: User | null;
  users: User[];
  loginAsAdmin: (email: string, pass: string) => { success: boolean; error?: string };
  registerAdmin: (email: string, pass: string, name: string, storeName: string) => { success: boolean; error?: string };
  loginAsCashier: (pin: string) => { success: boolean; error?: string };
  switchToCashier: () => void;
  switchUser: (user: User) => void;
  logout: () => void;
  addCashier: (name: string, email: string, pin: string) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;

  // Active Navigation
  activeView: 'pos' | 'dashboard' | 'reports' | 'menu' | 'stock' | 'printer' | 'database' | 'cashiers';
  setActiveView: (view: 'pos' | 'dashboard' | 'reports' | 'menu' | 'stock' | 'printer' | 'database' | 'cashiers') => void;

  // Menu Management
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;

  // Stock Management
  stockLogs: StockLog[];
  restockItem: (menuItemId: string, addQty: number, notes?: string) => void;
  adjustStock: (menuItemId: string, newStock: number, reason: 'adjustment' | 'waste', notes?: string) => void;
  lowStockAlerts: LowStockAlert[];
  unreadAlertCount: number;
  markAlertsAsRead: () => void;

  // POS & Cart
  cart: CartItem[];
  addToCart: (
    item: MenuItem,
    variant: 'Ice' | 'Hot',
    sugarLevel: 'Normal (100%)' | 'Less Sugar (70%)' | 'Half Sugar (50%)' | 'No Sugar (0%)',
    iceLevel: 'Normal Ice' | 'Less Ice' | 'No Ice',
    toppings: Topping[],
    qty?: number,
    notes?: string
  ) => void;
  updateCartQty: (cartId: string, delta: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  checkout: (
    paymentMethod: PaymentMethod,
    cashAmount?: number,
    discountAmount?: number
  ) => Promise<{ success: boolean; transaction?: Transaction; error?: string }>;

  // Transactions & Cashier Audit
  transactions: Transaction[];
  cashierActivities: CashierActivity[];
  voidTransaction: (trxId: string, reason: string) => void;

  // Printer & Receipt Modal
  printerConfig: PrinterConfig;
  updatePrinterConfig: (config: Partial<PrinterConfig>) => void;
  receiptModalTrx: Transaction | null;
  openReceiptModal: (trx: Transaction) => void;
  closeReceiptModal: () => void;
  printViaBluetooth: (trx: Transaction) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'nicepresso_users_v1',
  CURRENT_USER: 'nicepresso_current_user_v1',
  MENU: 'nicepresso_menu_v1',
  TRANSACTIONS: 'nicepresso_transactions_v1',
  STOCK_LOGS: 'nicepresso_stock_logs_v1',
  ACTIVITIES: 'nicepresso_activities_v1',
  PRINTER: 'nicepresso_printer_v1',
  READ_ALERTS: 'nicepresso_read_alerts_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State Loaders from localStorage or Seeds
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'cashier')) {
          return parsed;
        }
      } catch {
        return DEFAULT_CASHIER;
      }
    }
    return DEFAULT_CASHIER; // Default to Cashier so entering web directly opens Cashier dashboard!
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU);
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : generateSeedTransactions();
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_LOGS;
  });

  const [cashierActivities, setCashierActivities] = useState<CashierActivity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRINTER);
    return saved ? JSON.parse(saved) : INITIAL_PRINTER_CONFIG;
  });

  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.READ_ALERTS);
    return saved ? JSON.parse(saved) : [];
  });

  // UI States - Default to POS Terminal (Dashboard Kasir)
  const [activeView, setActiveView] = useState<'pos' | 'dashboard' | 'reports' | 'menu' | 'stock' | 'printer' | 'database' | 'cashiers'>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiptModalTrx, setReceiptModalTrx] = useState<Transaction | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(cashierActivities));
  }, [cashierActivities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRINTER, JSON.stringify(printerConfig));
  }, [printerConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.READ_ALERTS, JSON.stringify(readAlertIds));
  }, [readAlertIds]);

  // Log Cashier Activity Helper
  const logActivity = (
    action: CashierActivity['action'],
    details: string,
    amount?: number,
    invoiceNumber?: string
  ) => {
    if (!currentUser) return;
    const newAct: CashierActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      action,
      details,
      amount,
      invoiceNumber,
      timestamp: new Date().toISOString(),
    };
    setCashierActivities((prev) => [newAct, ...prev]);
  };

  // Auth Functions
  const loginAsAdmin = (email: string, pass: string) => {
    const admin = users.find((u) => u.role === 'admin' && u.email.toLowerCase() === email.toLowerCase());
    if (!admin) {
      return { success: false, error: 'Email admin tidak terdaftar.' };
    }
    if (admin.passwordHash && admin.passwordHash !== pass) {
      return { success: false, error: 'Kata sandi admin tidak tepat.' };
    }
    const updated = { ...admin, lastActive: new Date().toISOString() };
    setCurrentUser(updated);
    setActiveView('dashboard');
    setUsers((prev) => prev.map((u) => (u.id === admin.id ? updated : u)));
    logActivity('login', `Admin login via email (${email})`);
    return { success: true };
  };

  const registerAdmin = (email: string, pass: string, name: string, storeName: string) => {
    if (!email || !pass || !name) {
      return { success: false, error: 'Semua kolom pendaftaran wajib diisi.' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Kata sandi minimal 6 karakter demi keamanan akun.' };
    }
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Email sudah terdaftar. Silakan login.' };
    }

    const newAdmin: User = {
      id: `user-admin-${Date.now()}`,
      email,
      name,
      role: 'admin',
      passwordHash: pass,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newAdmin]);
    setCurrentUser(newAdmin);
    setActiveView('dashboard');
    if (storeName) {
      setPrinterConfig((prev) => ({ ...prev, storeName }));
    }
    logActivity('login', `Admin baru mendaftar & login (${email})`);
    return { success: true };
  };

  const switchToCashier = () => {
    const cashier = users.find((u) => u.role === 'cashier') || DEFAULT_CASHIER;
    setCurrentUser(cashier);
    setActiveView('pos');
    logActivity('login', `Beralih ke Terminal Kasir (${cashier.name})`);
  };

  const loginAsCashier = (pin: string) => {
    const cashier = users.find((u) => u.role === 'cashier' && u.pin === pin && u.isActive);
    if (!cashier) {
      return { success: false, error: 'PIN kasir salah atau akun dinonaktifkan.' };
    }
    const updated = { ...cashier, lastActive: new Date().toISOString() };
    setCurrentUser(updated);
    setActiveView('pos');
    setUsers((prev) => prev.map((u) => (u.id === cashier.id ? updated : u)));
    logActivity('login', `Kasir ${cashier.name} login via PIN`);
    return { success: true };
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'cashier') {
      setActiveView('pos');
    }
    logActivity('login', `Berganti pengguna ke ${user.name} (${user.role})`);
  };

  const logout = () => {
    if (currentUser) {
      logActivity('logout', `Keluar dari mode ${currentUser.role === 'admin' ? 'Admin' : 'Kasir'}`);
    }
    switchToCashier();
  };

  const addCashier = (name: string, email: string, pin: string) => {
    const newCashier: User = {
      id: `user-cashier-${Date.now()}`,
      name,
      email,
      role: 'cashier',
      pin,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newCashier]);
    logActivity('shift_start', `Admin menambahkan kasir baru: ${name}`);
  };

  const updateUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser && currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target?.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      alert('Tidak dapat menghapus satu-satunya akun Admin.');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Menu Management
  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `np-${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);

    // Initial stock log
    if (newItem.stock > 0) {
      const newStockLog: StockLog = {
        id: `sl-${Date.now()}`,
        menuItemId: newItem.id,
        menuItemName: newItem.name,
        changeQty: newItem.stock,
        prevStock: 0,
        newStock: newItem.stock,
        reason: 'restock',
        notes: 'Stok awal penambahan menu baru',
        timestamp: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Admin',
      };
      setStockLogs((prev) => [newStockLog, ...prev]);
    }
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // Stock Management
  const restockItem = (menuItemId: string, addQty: number, notes?: string) => {
    const target = menuItems.find((m) => m.id === menuItemId);
    if (!target) return;

    const prevStock = target.stock;
    const newStock = prevStock + addQty;

    setMenuItems((prev) =>
      prev.map((item) => (item.id === menuItemId ? { ...item, stock: newStock } : item))
    );

    const log: StockLog = {
      id: `sl-${Date.now()}`,
      menuItemId,
      menuItemName: target.name,
      changeQty: addQty,
      prevStock,
      newStock,
      reason: 'restock',
      notes: notes || 'Restock bahan baku/cup minuman',
      timestamp: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Admin',
    };
    setStockLogs((prev) => [log, ...prev]);
  };

  const adjustStock = (
    menuItemId: string,
    newStock: number,
    reason: 'adjustment' | 'waste',
    notes?: string
  ) => {
    const target = menuItems.find((m) => m.id === menuItemId);
    if (!target) return;

    const prevStock = target.stock;
    const changeQty = newStock - prevStock;

    setMenuItems((prev) =>
      prev.map((item) => (item.id === menuItemId ? { ...item, stock: newStock } : item))
    );

    const log: StockLog = {
      id: `sl-${Date.now()}`,
      menuItemId,
      menuItemName: target.name,
      changeQty,
      prevStock,
      newStock,
      reason,
      notes: notes || (reason === 'waste' ? 'Barang tumpah/rusak (waste)' : 'Penyesuaian stok fisik'),
      timestamp: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Admin',
    };
    setStockLogs((prev) => [log, ...prev]);
  };

  // Low Stock Alerts calculation
  const lowStockAlerts: LowStockAlert[] = menuItems
    .filter((m) => m.stock <= m.minStockAlert)
    .map((m) => ({
      menuItemId: m.id,
      menuItemName: m.name,
      currentStock: m.stock,
      minStockAlert: m.minStockAlert,
      isRead: readAlertIds.includes(m.id),
      createdAt: new Date().toISOString(),
    }));

  const unreadAlertCount = lowStockAlerts.filter((a) => !a.isRead).length;

  const markAlertsAsRead = () => {
    const currentAlertIds = lowStockAlerts.map((a) => a.menuItemId);
    setReadAlertIds(Array.from(new Set([...readAlertIds, ...currentAlertIds])));
  };

  // Cart Operations
  const addToCart = (
    item: MenuItem,
    variant: 'Ice' | 'Hot',
    sugarLevel: 'Normal (100%)' | 'Less Sugar (70%)' | 'Half Sugar (50%)' | 'No Sugar (0%)',
    iceLevel: 'Normal Ice' | 'Less Ice' | 'No Ice',
    toppings: Topping[],
    qty: number = 1,
    notes: string = ''
  ) => {
    const toppingsCost = toppings.reduce((sum, t) => sum + t.price, 0);
    const unitPrice = item.price + toppingsCost;
    const subtotal = unitPrice * qty;

    // Check if duplicate configuration already exists in cart
    const existingIndex = cart.findIndex(
      (ci) =>
        ci.menuItemId === item.id &&
        ci.variant === variant &&
        ci.sugarLevel === sugarLevel &&
        ci.iceLevel === iceLevel &&
        JSON.stringify(ci.toppings.map((t) => t.id).sort()) ===
          JSON.stringify(toppings.map((t) => t.id).sort())
    );

    if (existingIndex > -1) {
      setCart((prev) => {
        const next = [...prev];
        const existing = next[existingIndex];
        const newQty = existing.qty + qty;
        next[existingIndex] = {
          ...existing,
          qty: newQty,
          subtotal: unitPrice * newQty,
        };
        return next;
      });
    } else {
      const newCartItem: CartItem = {
        cartId: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: item.id,
        name: item.name,
        price: unitPrice,
        costPrice: item.costPrice,
        qty,
        variant,
        sugarLevel,
        iceLevel,
        toppings,
        notes,
        subtotal,
      };
      setCart((prev) => [...prev, newCartItem]);
    }
  };

  const updateCartQty = (cartId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartId === cartId) {
            const nextQty = item.qty + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              qty: nextQty,
              subtotal: (item.price / item.qty) * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout Function
  const checkout = async (
    paymentMethod: PaymentMethod,
    cashAmount?: number,
    discountAmount: number = 0
  ): Promise<{ success: boolean; transaction?: Transaction; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: 'Keranjang belanja masih kosong.' };
    }

    // Check stocks
    for (const c of cart) {
      const menuItem = menuItems.find((m) => m.id === c.menuItemId);
      if (menuItem && menuItem.stock < c.qty) {
        return {
          success: false,
          error: `Stok minuman "${menuItem.name}" tidak mencukupi (Tersisa ${menuItem.stock}, dipesan ${c.qty}).`,
        };
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCost = cart.reduce((sum, item) => sum + item.costPrice * item.qty, 0);
    const total = Math.max(0, subtotal - discountAmount);

    if (paymentMethod === 'cash' && cashAmount !== undefined && cashAmount < total) {
      return {
        success: false,
        error: `Uang tunai yang diterima (Rp ${cashAmount.toLocaleString('id-ID')}) kurang dari total tagihan (Rp ${total.toLocaleString('id-ID')}).`,
      };
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const invoiceNumber = `NP-${dateStr.replace(/-/g, '')}-${String(transactions.length + 1).padStart(4, '0')}`;

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      invoiceNumber,
      date: dateStr,
      time: timeStr,
      timestamp: now.getTime(),
      cashierId: currentUser?.id || 'kasir',
      cashierName: currentUser?.name || 'Kasir',
      items: [...cart],
      totalQty: cart.reduce((sum, item) => sum + item.qty, 0),
      subtotal,
      discount: discountAmount,
      tax: 0,
      total,
      totalCost,
      profit: total - totalCost,
      paymentMethod,
      cashAmountReceived: paymentMethod === 'cash' ? cashAmount || total : undefined,
      changeGiven: paymentMethod === 'cash' ? (cashAmount || total) - total : undefined,
      status: 'completed',
    };

    // 1. Deduct stock for each item & add StockLogs
    const newStockLogs: StockLog[] = [];
    setMenuItems((prevMenu) => {
      const updatedMenu = [...prevMenu];
      cart.forEach((cartItem) => {
        const itemIdx = updatedMenu.findIndex((m) => m.id === cartItem.menuItemId);
        if (itemIdx > -1) {
          const prevItem = updatedMenu[itemIdx];
          const newStock = Math.max(0, prevItem.stock - cartItem.qty);
          updatedMenu[itemIdx] = {
            ...prevItem,
            stock: newStock,
          };

          newStockLogs.push({
            id: `sl-${Date.now()}-${cartItem.cartId}`,
            menuItemId: prevItem.id,
            menuItemName: prevItem.name,
            changeQty: -cartItem.qty,
            prevStock: prevItem.stock,
            newStock,
            reason: 'sale',
            notes: `Penjualan kasir #${invoiceNumber}`,
            timestamp: now.toISOString(),
            updatedBy: currentUser?.name || 'Kasir',
          });
        }
      });
      return updatedMenu;
    });

    setStockLogs((prev) => [...newStockLogs, ...prev]);

    // 2. Add transaction
    setTransactions((prev) => [newTransaction, ...prev]);

    // 3. Log cashier activity
    logActivity(
      'sale',
      `Penjualan #${invoiceNumber} (${newTransaction.totalQty} cup, ${paymentMethod.toUpperCase()})`,
      newTransaction.total,
      invoiceNumber
    );

    // 4. Clear cart & trigger confetti
    setCart([]);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#dc2626', '#f59e0b', '#10b981', '#6366f1'],
    });

    // 5. Check if Bluetooth Printer is connected and auto-print is enabled
    if (bluetoothPrinterService.isConnected() && printerConfig.autoPrintOnCheckout) {
      bluetoothPrinterService.printTransaction(newTransaction, printerConfig).catch(console.error);
    }

    // Always set receipt modal transaction so the user can inspect / print preview / download
    setReceiptModalTrx(newTransaction);

    return { success: true, transaction: newTransaction };
  };

  const voidTransaction = (trxId: string, reason: string) => {
    const target = transactions.find((t) => t.id === trxId);
    if (!target) return;

    // Restore stock
    setMenuItems((prevMenu) => {
      const updatedMenu = [...prevMenu];
      target.items.forEach((item) => {
        const idx = updatedMenu.findIndex((m) => m.id === item.menuItemId);
        if (idx > -1) {
          updatedMenu[idx] = {
            ...updatedMenu[idx],
            stock: updatedMenu[idx].stock + item.qty,
          };
        }
      });
      return updatedMenu;
    });

    // Update status
    setTransactions((prev) =>
      prev.map((t) => (t.id === trxId ? { ...t, status: 'refunded' } : t))
    );

    logActivity('void', `Membatalkan/Void transaksi #${target.invoiceNumber}. Alasan: ${reason}`, target.total, target.invoiceNumber);
  };

  const updatePrinterConfig = (config: Partial<PrinterConfig>) => {
    setPrinterConfig((prev) => ({ ...prev, ...config }));
  };

  const openReceiptModal = (trx: Transaction) => {
    setReceiptModalTrx(trx);
  };

  const closeReceiptModal = () => {
    setReceiptModalTrx(null);
  };

  const printViaBluetooth = async (trx: Transaction) => {
    return bluetoothPrinterService.printTransaction(trx, printerConfig);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        loginAsAdmin,
        registerAdmin,
        loginAsCashier,
        switchToCashier,
        switchUser,
        logout,
        addCashier,
        updateUser,
        deleteUser,

        activeView,
        setActiveView,

        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,

        stockLogs,
        restockItem,
        adjustStock,
        lowStockAlerts,
        unreadAlertCount,
        markAlertsAsRead,

        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        checkout,

        transactions,
        cashierActivities,
        voidTransaction,

        printerConfig,
        updatePrinterConfig,
        receiptModalTrx,
        openReceiptModal,
        closeReceiptModal,
        printViaBluetooth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
