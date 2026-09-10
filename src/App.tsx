/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PosView } from './components/pos/PosView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SalesReportView } from './components/admin/SalesReportView';
import { MenuManagementView } from './components/admin/MenuManagementView';
import { StockManagementView } from './components/admin/StockManagementView';
import { CashierManagementView } from './components/admin/CashierManagementView';
import { SqlDatabaseView } from './components/admin/SqlDatabaseView';
import { ReceiptModal } from './components/ReceiptModal';
import {
  Coffee,
  Printer,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView, currentUser, setActiveView, printerConfig } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Render view depending on active tab
  const renderActiveView = () => {
    switch (activeView) {
      case 'pos':
        return <PosView />;

      case 'dashboard':
        if (!isAdmin) {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
              <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-base font-bold text-gray-900">Akses Dibatasi</h2>
              <p className="text-xs text-gray-600">
                Halaman Dashboard analitik dan laporan keuangan hanya dapat diakses oleh akun Owner / Admin.
              </p>
              <button
                onClick={() => setActiveView('pos')}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Kembali ke Terminal Kasir
              </button>
            </div>
          );
        }
        return <AdminDashboard />;

      case 'reports':
        if (!isAdmin) {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
              <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-base font-bold text-gray-900">Akses Laporan Terkunci</h2>
              <p className="text-xs text-gray-600">
                Silakan login sebagai Admin untuk melihat dan mengekspor laporan omset harian, bulanan, dan tahunan.
              </p>
              <button
                onClick={() => setActiveView('pos')}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Kembali ke Terminal Kasir
              </button>
            </div>
          );
        }
        return <SalesReportView />;

      case 'menu':
        if (!isAdmin) {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
              <Layers className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-base font-bold text-gray-900">Khusus Manajemen Menu</h2>
              <p className="text-xs text-gray-600">
                Hanya admin yang dapat menambah, mengubah harga, atau menghapus varian menu minuman.
              </p>
              <button
                onClick={() => setActiveView('pos')}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Kembali ke Terminal Kasir
              </button>
            </div>
          );
        }
        return <MenuManagementView />;

      case 'stock':
        if (!isAdmin) {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
              <Package className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-base font-bold text-gray-900">Akses Inventori Stok</h2>
              <p className="text-xs text-gray-600">
                Login sebagai admin untuk melakukan restock bahan atau penyesuaian stok fisik.
              </p>
              <button
                onClick={() => setActiveView('pos')}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Kembali ke Terminal Kasir
              </button>
            </div>
          );
        }
        return <StockManagementView />;

      case 'cashiers':
        if (!isAdmin) {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
              <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-base font-bold text-gray-900">Akses Kelola Staf</h2>
              <p className="text-xs text-gray-600">
                Pengaturan akun kasir dan PIN hanya dapat diatur oleh Admin.
              </p>
              <button
                onClick={() => setActiveView('pos')}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Kembali ke Terminal Kasir
              </button>
            </div>
          );
        }
        return <CashierManagementView />;

      case 'database':
        if (!isAdmin) {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
              <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-base font-bold text-gray-900">Skema Database Terkunci</h2>
              <p className="text-xs text-gray-600">
                Silakan masuk sebagai Admin untuk melihat dan mengunduh skema database.sql serta panduan Visual Studio Code.
              </p>
              <button
                onClick={() => setActiveView('pos')}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Kembali ke Terminal Kasir
              </button>
            </div>
          );
        }
        return <SqlDatabaseView />;

      default:
        return <PosView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans antialiased text-gray-900">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pb-10">
        {renderActiveView()}
      </main>

      {/* Global Thermal Receipt Modal */}
      <ReceiptModal />

      {/* Modern Status Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
              NP
            </div>
            <span className="font-bold text-gray-800">
              {printerConfig.storeName || 'NICE PRESSO'}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] truncate max-w-[240px] sm:max-w-none">
              {printerConfig.address || 'Outlet Minuman Segar'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <Printer className="w-3 h-3 text-gray-400" />
              <span>
                Thermal ESC/POS:{' '}
                <strong className={printerConfig.isConnected ? 'text-emerald-600' : 'text-gray-600'}>
                  {printerConfig.isConnected ? 'Terhubung' : 'Siap Bluetooth / Cetak Web'}
                </strong>
              </span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="font-medium text-gray-600">
              Kasir: <strong className="text-red-700">{currentUser?.name || 'Kasir'}</strong> (
              {currentUser?.role || 'kasir'})
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
