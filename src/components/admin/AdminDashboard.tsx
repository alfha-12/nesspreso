import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  Coffee,
  AlertTriangle,
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const {
    transactions,
    cashierActivities,
    lowStockAlerts,
    menuItems,
    setActiveView,
  } = useApp();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const thisMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
  const thisYearPrefix = todayStr.substring(0, 4); // YYYY

  // Completed transactions
  const validTransactions = useMemo(
    () => transactions.filter((t) => t.status === 'completed'),
    [transactions]
  );

  // Revenue Metrics
  const todayTransactions = useMemo(
    () => validTransactions.filter((t) => t.date === todayStr),
    [validTransactions, todayStr]
  );
  const todayRevenue = useMemo(
    () => todayTransactions.reduce((sum, t) => sum + t.total, 0),
    [todayTransactions]
  );
  const todayProfit = useMemo(
    () => todayTransactions.reduce((sum, t) => sum + t.profit, 0),
    [todayTransactions]
  );
  const todayCups = useMemo(
    () => todayTransactions.reduce((sum, t) => sum + t.totalQty, 0),
    [todayTransactions]
  );

  const monthTransactions = useMemo(
    () => validTransactions.filter((t) => t.date.startsWith(thisMonthPrefix)),
    [validTransactions, thisMonthPrefix]
  );
  const monthRevenue = useMemo(
    () => monthTransactions.reduce((sum, t) => sum + t.total, 0),
    [monthTransactions]
  );

  const yearTransactions = useMemo(
    () => validTransactions.filter((t) => t.date.startsWith(thisYearPrefix)),
    [validTransactions, thisYearPrefix]
  );
  const yearRevenue = useMemo(
    () => yearTransactions.reduce((sum, t) => sum + t.total, 0),
    [yearTransactions]
  );

  // Hourly Sales Data for Today's Chart
  const hourlyData = useMemo(() => {
    const hoursMap: Record<number, number> = {};
    for (let h = 8; h <= 21; h++) {
      hoursMap[h] = 0;
    }
    todayTransactions.forEach((t) => {
      const hour = parseInt(t.time.split(':')[0], 10);
      if (hoursMap[hour] !== undefined) {
        hoursMap[hour] += t.total;
      }
    });

    return Object.keys(hoursMap).map((hourKey) => {
      const h = Number(hourKey);
      return {
        hour: `${String(h).padStart(2, '0')}:00`,
        omset: hoursMap[h],
      };
    });
  }, [todayTransactions]);

  // Top 5 Best-Selling Beverages
  const topDrinks = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};
    validTransactions.forEach((t) => {
      t.items.forEach((item) => {
        if (!counts[item.name]) {
          counts[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        counts[item.name].qty += item.qty;
        counts[item.name].revenue += item.subtotal;
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [validTransactions]);

  // Payment Method Breakdown
  const paymentData = useMemo(() => {
    const counts: Record<string, number> = { cash: 0, qris: 0, other: 0 };
    validTransactions.forEach((t) => {
      if (t.paymentMethod === 'cash') counts.cash += t.total;
      else if (t.paymentMethod === 'qris') counts.qris += t.total;
      else counts.other += t.total;
    });

    return [
      { name: 'Tunai (Cash)', value: counts.cash, color: '#dc2626' },
      { name: 'QRIS', value: counts.qris, color: '#2563eb' },
      { name: 'Debit/Transfer', value: counts.other, color: '#10b981' },
    ].filter((p) => p.value > 0);
  }, [validTransactions]);

  const COLORS = ['#dc2626', '#ea580c', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Greeting and Actions */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Dashboard Operasional &amp; Keuangan
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pantau penjualan minuman harian, bulanan, tahunan, aktivitas kasir, dan inventori stok.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-go-reports-btn"
            onClick={() => setActiveView('reports')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition active:scale-98 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-300" />
            <span>Buka Laporan Lengkap</span>
          </button>

          <button
            id="dash-go-pos-btn"
            onClick={() => setActiveView('pos')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition active:scale-98 shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Buka Terminal Kasir</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Omset Hari Ini
            </span>
            <div className="text-xl font-extrabold text-gray-900 mt-1">
              Rp {todayRevenue.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{todayTransactions.length} transaksi selesai</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Omset Bulan Ini */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Omset Bulan Ini
            </span>
            <div className="text-xl font-extrabold text-gray-900 mt-1">
              Rp {monthRevenue.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {monthTransactions.length} order bulan ini
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Omset Tahun Ini */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Omset Tahun Ini
            </span>
            <div className="text-xl font-extrabold text-gray-900 mt-1">
              Rp {yearRevenue.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Tahun {thisYearPrefix} berjalan
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Stok Menipis Alert Card */}
        <div
          onClick={() => setActiveView('stock')}
          className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            lowStockAlerts.length > 0
              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
              : 'bg-white border-gray-200'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Peringatan Stok
            </span>
            <div className="text-xl font-extrabold text-amber-900 mt-1">
              {lowStockAlerts.length} Menu Menipis
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
              <span>Klik untuk restock bahan</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">Estimasi Laba Bersih Hari Ini</div>
            <div className="text-base font-extrabold text-gray-900">
              Rp {todayProfit.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">Minuman Terjual Hari Ini</div>
            <div className="text-base font-extrabold text-gray-900">
              {todayCups} Cup Terjual
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">Total Varian Menu Aktif</div>
            <div className="text-base font-extrabold text-gray-900">
              {menuItems.length} Minuman Terdaftar
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Hourly Sales Trend Area Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Grafik Tren Penjualan Hari Ini (Per Jam)
              </h3>
              <p className="text-xs text-gray-500">Omset pendapatan berdasarkan jam transaksi</p>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
              Total: Rp {todayRevenue.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Omset']}
                  labelFormatter={(label) => `Pukul ${label}`}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="omset"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOmset)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 Cols: Top 5 Best-Selling Beverages */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Top 5 Menu Paling Laris</h3>
            <p className="text-xs text-gray-500">Minuman dengan kuantitas penjualan tertinggi</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDrinks} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#4b5563"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                  tickFormatter={(name) => (name.length > 14 ? `${name.substring(0, 14)}...` : name)}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} cup`, 'Terjual']}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="qty" radius={[0, 6, 6, 0]}>
                  {topDrinks.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cashier Activities Timeline */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gray-100 text-gray-800">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Aktivitas Kasir &amp; Audit Log Real-Time
              </h3>
              <p className="text-xs text-gray-500">
                Pemantauan interaksi kasir: sesi login, penjualan, dan penutupan shift
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('cashiers')}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>Kelola Akses Kasir</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1 text-xs">
          {cashierActivities.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Belum ada catatan aktivitas kasir.</div>
          ) : (
            cashierActivities.slice(0, 10).map((act) => {
              const timeFormatted = new Date(act.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const dateFormatted = new Date(act.timestamp).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <div key={act.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        act.action === 'sale'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.action === 'login'
                          ? 'bg-blue-100 text-blue-800'
                          : act.action === 'void'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {act.action}
                    </span>
                    <div>
                      <div className="font-bold text-gray-900">{act.cashierName}</div>
                      <div className="text-gray-500 text-[11px]">{act.details}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    {act.amount !== undefined && (
                      <div className="font-extrabold text-gray-900">
                        Rp {act.amount.toLocaleString('id-ID')}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400">
                      {dateFormatted}, {timeFormatted}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
