export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pin?: string;
  password?: string;
  passwordHash?: string;
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
}

export type BeverageCategory = 'Coffee' | 'Choco Series' | 'Tea & Latte' | 'Special Flavors' | 'All';

export interface MenuItem {
  id: string;
  name: string;
  category: 'Coffee' | 'Choco Series' | 'Tea & Latte' | 'Special Flavors';
  price: number;
  costPrice: number; // HPP
  stock: number;
  minStockAlert: number;
  isAvailable: boolean;
  image?: string;
  badge?: string; // e.g. "5K", "8K", "10K", "New"
  hasIceHotOption: boolean;
  hasSugarOption: boolean;
  description?: string;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  menuItemId: string;
  name: string;
  price: number;
  costPrice: number;
  qty: number;
  variant: 'Ice' | 'Hot';
  sugarLevel: 'Normal (100%)' | 'Less Sugar (70%)' | 'Half Sugar (50%)' | 'No Sugar (0%)';
  iceLevel: 'Normal Ice' | 'Less Ice' | 'No Ice';
  toppings: Topping[];
  notes?: string;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'debit';

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: number;
  cashierId: string;
  cashierName: string;
  items: CartItem[];
  totalQty: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: PaymentMethod;
  cashAmountReceived?: number;
  changeGiven?: number;
  status: 'completed' | 'refunded';
}

export interface StockLog {
  id: string;
  menuItemId: string;
  menuItemName: string;
  changeQty: number; // positive for restock, negative for sale
  prevStock: number;
  newStock: number;
  reason: 'sale' | 'restock' | 'adjustment' | 'waste';
  notes?: string;
  timestamp: string;
  updatedBy: string;
}

export interface CashierActivity {
  id: string;
  cashierId: string;
  cashierName: string;
  action: 'login' | 'logout' | 'sale' | 'void' | 'shift_start' | 'shift_end';
  details: string;
  amount?: number;
  invoiceNumber?: string;
  timestamp: string;
}

export interface LowStockAlert {
  menuItemId: string;
  menuItemName: string;
  currentStock: number;
  minStockAlert: number;
  isRead: boolean;
  createdAt: string;
}

export interface PrinterConfig {
  name: string;
  paperWidth: '58mm' | '80mm';
  autoPrintOnCheckout: boolean;
  footerMessage: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  isConnected: boolean;
}
