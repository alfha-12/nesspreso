import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, PaymentMethod } from '../../types';
import { exportToExcel, exportToPDF, ReportSummary } from '../../services/exportService';
import {
  FileSpreadsheet,
  FileText,
  Search,
  Calendar,
  DollarSign,
  Coffee,
  Printer,
  Ban,
  ArrowUpDown,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const SalesReportView: React.FC = () => {
  const { transactions, voidTransaction, openReceiptModal, printerConfig } = useApp();

  const [periodTab, setPeriodTab] = useState<'daily' | 'monthly' | 'yearly' | 'all'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [searchInvoice, setSearchInvoice] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('all');
  const [selectedCashierFilter, setSelectedCashierFilter] = useState<string>('all');

  // Filter Transactions based on Period and Criteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Period filter
      let matchPeriod = true;
      if (periodTab === 'daily') {
        matchPeriod = t.date === selectedDate;
      } else if (periodTab === 'monthly') {
        matchPeriod = t.date.startsWith(selectedMonth);
      } else if (periodTab === 'yearly') {
        matchPeriod = t.date.startsWith(selectedYear);
      }

      // Search Invoice
      const matchSearch =
        t.invoiceNumber.toLowerCase().includes(searchInvoice.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(searchInvoice.toLowerCase()) ||
        t.items.some((i) => i.name.toLowerCase().includes(searchInvoice.toLowerCase()));

      // Payment Method
      const matchPayment =
        selectedPaymentFilter === 'all' ? true : t.paymentMethod === selectedPaymentFilter;

      // Cashier
      const matchCashier =
        selectedCashierFilter === 'all' ? true : t.cashierId === selectedCashierFilter;

      return matchPeriod && matchSearch && matchPayment && matchCashier;
    });
  }, [
    transactions,
    periodTab,
    selectedDate,
    selectedMonth,
    selectedYear,
    searchInvoice,
    selectedPaymentFilter,
    selectedCashierFilter,
  ]);

  // Distinct Cashiers for Filter Dropdown
  const cashiersList = useMemo(() => {
    const map = new Map<string, string>();
    transactions.forEach((t) => map.set(t.cashierId, t.cashierName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [transactions]);

  // Aggregate Metrics for this filtered view
  const summary: ReportSummary = useMemo(() => {
    const completed = filteredTransactions.filter((t) => t.status === 'completed');
    const totalRevenue = completed.reduce((sum, t) => sum + t.total, 0);
    const totalProfit = completed.reduce((sum, t) => sum + t.profit, 0);
    const totalTransactions = completed.length;
    const totalItemsSold = completed.reduce((sum, t) => sum + t.totalQty, 0);
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const cashRevenue = completed
      .filter((t) => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.total, 0);
    const qrisRevenue = completed
      .filter((t) => t.paymentMethod === 'qris')
      .reduce((sum, t) => sum + t.total, 0);
    const otherRevenue = totalRevenue - cashRevenue - qrisRevenue;

    let periodLabel = 'Semua Riwayat';
    if (periodTab === 'daily') periodLabel = `Harian (${selectedDate})`;
    else if (periodTab === 'monthly') periodLabel = `Bulanan (${selectedMonth})`;
    else if (periodTab === 'yearly') periodLabel = `Tahunan (${selectedYear})`;

    return {
      periodLabel,
      totalRevenue,
      totalTransactions,
      totalItemsSold,
      totalProfit,
      averageOrderValue,
      cashRevenue,
      qrisRevenue,
      otherRevenue,
    };
  }, [filteredTransactions, periodTab, selectedDate, selectedMonth, selectedYear]);

  // Void confirmation handler
  const handleVoid = (t: Transaction) => {
    const reason = prompt(
      `Batalkan Transaksi #${t.invoiceNumber} senilai Rp ${t.total.toLocaleString('id-ID')}?\nMasukkan alasan pembatalan:`,
      'Pelanggan ganti pesanan / salah input'
    );
    if (reason) {
      voidTransaction(t.id, reason);
    }
  };

  const handleExportExcel = () => {
    exportToExcel(
      filteredTransactions,
      summary,
      printerConfig,
      `Laporan_Penjualan_${periodTab}_${printerConfig.storeName.replace(/\s+/g, '_')}`
    );
  };

  const handleExportPdf = () => {
    exportToPDF(
      filteredTransactions,
      summary,
      printerConfig,
      `Laporan_Penjualan_${periodTab}_${printerConfig.storeName.replace(/\s+/g, '_')}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Export Actions */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Laporan Penjualan &amp; Rekapitulasi
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
              {summary.periodLabel}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Data real-time pencatatan transaksi, omset penjualan minuman, laba bersih, dan ekspor berkala.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            id="export-excel-btn"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition active:scale-98 shadow-xs"
            title="Download Spreadsheet Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            id="export-pdf-btn"
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition active:scale-98 shadow-xs"
            title="Download Dokumen PDF Resmi"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setPeriodTab('daily')}
              className={`px-4 py-2 rounded-lg transition ${
                periodTab === 'daily'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Harian (Per Jam)
            </button>
            <button
              onClick={() => setPeriodTab('monthly')}
              className={`px-4 py-2 rounded-lg transition ${
                periodTab === 'monthly'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bulanan (Per Hari)
            </button>
            <button
              onClick={() => setPeriodTab('yearly')}
              className={`px-4 py-2 rounded-lg transition ${
                periodTab === 'yearly'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tahunan (Per Bulan)
            </button>
            <button
              onClick={() => setPeriodTab('all')}
              className={`px-4 py-2 rounded-lg transition ${
                periodTab === 'all'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semua Periode
            </button>
          </div>

          {/* Date / Month / Year Picker */}
          <div className="flex items-center gap-2">
            {periodTab === 'daily' && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-gray-800 font-semibold outline-hidden cursor-pointer"
                />
              </div>
            )}

            {periodTab === 'monthly' && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-gray-800 font-semibold outline-hidden cursor-pointer"
                />
              </div>
            )}

            {periodTab === 'yearly' && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-gray-800 font-semibold outline-hidden cursor-pointer"
                >
                  {['2024', '2025', '2026', '2027'].map((y) => (
                    <option key={y} value={y}>
                      Tahun {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Filter Row: Search, Payment Method, Cashier */}
        <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              placeholder="Cari no. invoice, kasir, atau minuman..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 shrink-0">Metode:</span>
            <select
              value={selectedPaymentFilter}
              onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium outline-hidden"
            >
              <option value="all">Semua Metode Bayar</option>
              <option value="cash">Tunai (Cash)</option>
              <option value="qris">QRIS</option>
              <option value="debit">Debit / Transfer</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 shrink-0">Kasir:</span>
            <select
              value={selectedCashierFilter}
              onChange={(e) => setSelectedCashierFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium outline-hidden"
            >
              <option value="all">Semua Petugas Kasir</option>
              {cashiersList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase">Total Omset Penjualan</div>
          <div className="text-xl font-extrabold text-red-600 mt-1">
            Rp {summary.totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            Dari {summary.totalTransactions} transaksi
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase">Total Laba Bersih (Margin)</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">
            Rp {summary.totalProfit.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            Setelah dipotong HPP bahan baku
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase">Minuman Terjual</div>
          <div className="text-xl font-extrabold text-gray-900 mt-1">
            {summary.totalItemsSold} Cup
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            Rata-rata: Rp {Math.round(summary.averageOrderValue).toLocaleString('id-ID')} /order
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase">Rincian Pembayaran</div>
          <div className="text-xs font-bold text-gray-800 mt-1">
            Tunai: Rp {summary.cashRevenue.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
            QRIS: Rp {summary.qrisRevenue.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">
            Daftar Transaksi ({filteredTransactions.length} Rekaman)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Petugas Kasir</th>
                <th className="py-3 px-4">Minuman Dipesan</th>
                <th className="py-3 px-4 text-center">Metode</th>
                <th className="py-3 px-4 text-right">Total Bayar</th>
                <th className="py-3 px-4 text-right">Laba</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    Tidak ada data transaksi untuk periode ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-gray-50/70 transition ${
                      t.status === 'refunded' ? 'opacity-60 bg-red-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {t.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      <div>{t.date}</div>
                      <div className="text-[10px] text-gray-400">{t.time}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {t.cashierName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs space-y-0.5">
                        {t.items.map((item, idx) => (
                          <div key={idx} className="text-gray-700 truncate">
                            <span className="font-semibold text-gray-900">{item.name}</span>{' '}
                            <span className="text-[10px] text-gray-500">
                              [{item.variant}] x{item.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.paymentMethod === 'cash'
                            ? 'bg-red-50 text-red-700'
                            : t.paymentMethod === 'qris'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900 whitespace-nowrap">
                      Rp {t.total.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600 whitespace-nowrap">
                      Rp {t.profit.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesai</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                          <Ban className="w-3 h-3" />
                          <span>Batal</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openReceiptModal(t)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-gray-100 transition"
                          title="Cetak Ulang Struk Thermal"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {t.status === 'completed' && (
                          <button
                            onClick={() => handleVoid(t)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Batalkan / Void Transaksi"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
