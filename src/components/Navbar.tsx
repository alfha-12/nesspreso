import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coffee,
  LayoutDashboard,
  ShoppingCart,
  FileBarChart,
  Package,
  Layers,
  Printer,
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Database,
  UserCheck,
} from 'lucide-react';
import { AdminAuthModal } from './AdminAuthModal';
import { PrinterSettingsModal } from './PrinterSettingsModal';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    logout,
    switchToCashier,
    printerConfig,
    lowStockAlerts,
    unreadAlertCount,
    markAlertsAsRead,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('login');

  const alertRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(e.target as Node)) {
        setIsAlertOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveView('pos')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xs group-hover:bg-red-700 transition">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-gray-950">
                    {printerConfig.storeName || 'NICE PRESSO'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                    POS
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium block">
                  Kasir Minuman &amp; Stok Real-Time
                </span>
              </div>
            </div>

            {/* Navigation Tabs (Admin Full Navigation) */}
            <nav className="hidden lg:flex items-center gap-1 ml-6 pl-6 border-l border-gray-200">
              <button
                id="nav-pos-btn"
                onClick={() => setActiveView('pos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'pos'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Kasir POS</span>
              </button>

              {isAdmin && (
                <>
                  <button
                    id="nav-dashboard-btn"
                    onClick={() => setActiveView('dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeView === 'dashboard'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    id="nav-reports-btn"
                    onClick={() => setActiveView('reports')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeView === 'reports'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                    }`}
                  >
                    <FileBarChart className="w-3.5 h-3.5" />
                    <span>Laporan Penjualan</span>
                  </button>

                  <button
                    id="nav-menu-btn"
                    onClick={() => setActiveView('menu')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeView === 'menu'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Kelola Menu</span>
                  </button>

                  <button
                    id="nav-stock-btn"
                    onClick={() => setActiveView('stock')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeView === 'stock'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Stok &amp; Log</span>
                    {unreadAlertCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </button>

                  <button
                    id="nav-database-btn"
                    onClick={() => setActiveView('database')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeView === 'database'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    <span>Database SQL</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Bluetooth Thermal Printer Indicator */}
            <button
              id="header-printer-status-btn"
              onClick={() => setIsPrinterModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                printerConfig.isConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
              title="Pengaturan &amp; Sambungkan Printer Thermal Bluetooth"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {printerConfig.isConnected ? 'Printer Terhubung' : 'Printer Bluetooth'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  printerConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
            </button>

            {/* If Kasir Mode: Dedicated "Fitur Admin" Button on the right */}
            {!isAdmin ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">Kasir Aktif</span>
                  <span className="text-[10px] text-gray-400">(Siap Melayani)</span>
                </div>

                <button
                  id="btn-fitur-admin"
                  onClick={() => {
                    setAuthModalInitialMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-950 hover:bg-black text-white font-bold text-xs shadow-md transition hover:scale-102 active:scale-98 border border-gray-800"
                  title="Masuk sebagai Admin untuk melihat Laporan, Kelola Menu, dan Stok"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Fitur Admin</span>
                </button>
              </div>
            ) : (
              /* If Admin Mode: Show Stock Alerts, Quick Cashier Jump & Admin Profile */
              <div className="flex items-center gap-2">
                {/* Low Stock Notification Bell */}
                <div className="relative" ref={alertRef}>
                  <button
                    id="header-stock-alerts-btn"
                    onClick={() => {
                      setIsAlertOpen(!isAlertOpen);
                      markAlertsAsRead();
                    }}
                    className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                    title="Notifikasi Stok Menipis"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadAlertCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-extrabold animate-bounce">
                        {unreadAlertCount}
                      </span>
                    )}
                  </button>

                  {/* Stock Alerts Dropdown */}
                  {isAlertOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-gray-100 p-3 text-xs z-50 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Peringatan Stok ({lowStockAlerts.length})</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Real-time</span>
                      </div>

                      <div className="max-h-60 overflow-y-auto py-2 space-y-1.5">
                        {lowStockAlerts.length === 0 ? (
                          <div className="py-4 text-center text-gray-400 text-xs">
                            Semua stok minuman dalam batas aman.
                          </div>
                        ) : (
                          lowStockAlerts.map((alert) => (
                            <div
                              key={alert.id}
                              className={`p-2 rounded-xl border flex items-center justify-between ${
                                alert.severity === 'critical'
                                  ? 'bg-red-50/70 border-red-200 text-red-900'
                                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-xs">{alert.menuItemName}</div>
                                <div className="text-[10px] opacity-80">
                                  Sisa: <strong>{alert.currentStock}</strong> cup (Min:{' '}
                                  {alert.minStock})
                                </div>
                              </div>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  alert.severity === 'critical'
                                    ? 'bg-red-200 text-red-800'
                                    : 'bg-amber-200 text-amber-800'
                                }`}
                              >
                                {alert.severity === 'critical' ? 'Kritis' : 'Menipis'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      {lowStockAlerts.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setActiveView('stock');
                              setIsAlertOpen(false);
                            }}
                            className="w-full py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-center block transition text-[11px]"
                          >
                            Buka Manajemen Stok &amp; Restock
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick button to jump to Kasir POS */}
                <button
                  id="header-mode-kasir-btn"
                  onClick={() => {
                    switchToCashier();
                  }}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    activeView === 'pos'
                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                      : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                  title="Kembali ke Mode Kasir POS"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
                  <span>Mode Kasir</span>
                </button>

                {/* Admin user dropdown & logout */}
                <div className="relative" ref={userRef}>
                  <button
                    id="header-user-menu-btn"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition border border-gray-200/70"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white bg-red-600">
                      A
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-xs font-bold text-gray-900 leading-tight">
                        {currentUser?.name || 'Owner Admin'}
                      </div>
                      <div className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">
                        Admin Outlet
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 p-2 text-xs z-50 animate-in fade-in zoom-in-95">
                      <div className="p-2.5 rounded-xl bg-gray-50 mb-2 border border-gray-100">
                        <div className="font-bold text-gray-900">{currentUser?.name}</div>
                        <div className="text-[11px] text-gray-500 truncate">{currentUser?.email}</div>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-700">
                            Owner Admin
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setActiveView('dashboard');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 text-left"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-500" />
                          <span>Dashboard Admin</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveView('database');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 text-left"
                        >
                          <Database className="w-4 h-4 text-blue-500" />
                          <span>Skema Database SQL</span>
                        </button>

                        <button
                          onClick={() => {
                            switchToCashier();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg text-amber-800 hover:bg-amber-50 text-left font-semibold"
                        >
                          <ShoppingCart className="w-4 h-4 text-amber-600" />
                          <span>Beralih ke Kasir POS</span>
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-50 text-left font-semibold border-t border-gray-100 mt-1"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span>Keluar Admin</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden flex items-center justify-between gap-1 px-4 py-2 bg-gray-50 border-t border-gray-200 overflow-x-auto text-xs">
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveView('pos')}
              className={`px-3 py-1.5 rounded-lg shrink-0 font-semibold transition ${
                activeView === 'pos' ? 'bg-red-600 text-white' : 'text-gray-600'
              }`}
            >
              Kasir POS
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-1.5 rounded-lg shrink-0 font-semibold transition ${
                    activeView === 'dashboard' ? 'bg-red-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('reports')}
                  className={`px-3 py-1.5 rounded-lg shrink-0 font-semibold transition ${
                    activeView === 'reports' ? 'bg-red-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Laporan
                </button>
                <button
                  onClick={() => setActiveView('menu')}
                  className={`px-3 py-1.5 rounded-lg shrink-0 font-semibold transition ${
                    activeView === 'menu' ? 'bg-red-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Menu
                </button>
                <button
                  onClick={() => setActiveView('stock')}
                  className={`px-3 py-1.5 rounded-lg shrink-0 font-semibold transition ${
                    activeView === 'stock' ? 'bg-red-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Stok
                </button>
                <button
                  onClick={() => setActiveView('database')}
                  className={`px-3 py-1.5 rounded-lg shrink-0 font-semibold transition ${
                    activeView === 'database' ? 'bg-blue-600 text-white' : 'text-gray-600'
                  }`}
                >
                  SQL
                </button>
              </>
            )}
          </div>

          {!isAdmin && (
            <button
              onClick={() => {
                setAuthModalInitialMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-950 text-white font-bold text-xs shrink-0 ml-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* Modals triggered from Header */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <PrinterSettingsModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
      />
    </>
  );
};
