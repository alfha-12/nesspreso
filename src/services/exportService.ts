import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction, PrinterConfig } from '../types';

export interface ReportSummary {
  periodLabel: string;
  totalRevenue: number;
  totalTransactions: number;
  totalItemsSold: number;
  totalProfit: number;
  averageOrderValue: number;
  cashRevenue: number;
  qrisRevenue: number;
  otherRevenue: number;
}

export function exportToExcel(
  transactions: Transaction[],
  summary: ReportSummary,
  storeConfig: PrinterConfig,
  fileNamePrefix: string = 'Laporan_Penjualan_NicePresso'
) {
  // 1. Sheet Ringkasan
  const summaryData = [
    ['LAPORAN PENJUALAN MINUMAN - ' + storeConfig.storeName.toUpperCase()],
    ['Periode:', summary.periodLabel],
    ['Tanggal Dibuat:', new Date().toLocaleString('id-ID')],
    [''],
    ['RINGKASAN KINERJA', 'NILAI'],
    ['Total Omset (Gross Revenue)', `Rp ${summary.totalRevenue.toLocaleString('id-ID')}`],
    ['Total Laba Bersih (Net Profit)', `Rp ${summary.totalProfit.toLocaleString('id-ID')}`],
    ['Total Transaksi Selesai', `${summary.totalTransactions} transaksi`],
    ['Total Minuman Terjual', `${summary.totalItemsSold} cup`],
    ['Rata-rata Nilai Transaksi (AOV)', `Rp ${Math.round(summary.averageOrderValue).toLocaleString('id-ID')}`],
    ['Pendapatan Tunai (Cash)', `Rp ${summary.cashRevenue.toLocaleString('id-ID')}`],
    ['Pendapatan QRIS', `Rp ${summary.qrisRevenue.toLocaleString('id-ID')}`],
    ['Pendapatan Non-Tunai Lainnya', `Rp ${summary.otherRevenue.toLocaleString('id-ID')}`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // 2. Sheet Transaksi Detail
  const transactionsHeader = [
    'No',
    'No. Invoice',
    'Tanggal',
    'Waktu',
    'Nama Kasir',
    'Rincian Minuman',
    'Total Cup',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'Total Bayar (Rp)',
    'Laba Bersih (Rp)',
    'Metode Bayar',
    'Status',
  ];

  const transactionsRows = transactions.map((t, idx) => {
    const itemsDescription = t.items
      .map((item) => `${item.name} [${item.variant}] x${item.qty}`)
      .join('; ');

    return [
      idx + 1,
      t.invoiceNumber,
      t.date,
      t.time,
      t.cashierName,
      itemsDescription,
      t.totalQty,
      t.subtotal,
      t.discount,
      t.total,
      t.profit,
      t.paymentMethod.toUpperCase(),
      t.status === 'completed' ? 'Selesai' : 'Dibatalkan',
    ];
  });

  const transactionsSheet = XLSX.utils.aoa_to_sheet([
    transactionsHeader,
    ...transactionsRows,
  ]);

  // 3. Sheet Penjualan Per Menu
  const productAggregation: Record<string, { name: string; qty: number; revenue: number }> = {};
  transactions.forEach((t) => {
    if (t.status === 'completed') {
      t.items.forEach((item) => {
        if (!productAggregation[item.name]) {
          productAggregation[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        productAggregation[item.name].qty += item.qty;
        productAggregation[item.name].revenue += item.subtotal;
      });
    }
  });

  const productRows = Object.values(productAggregation)
    .sort((a, b) => b.qty - a.qty)
    .map((p, idx) => [idx + 1, p.name, p.qty, p.revenue, Math.round(p.revenue / (p.qty || 1))]);

  const productSheet = XLSX.utils.aoa_to_sheet([
    ['No', 'Nama Menu Minuman', 'Total Terjual (Cup)', 'Total Omset (Rp)', 'Harga Rata-rata (Rp)'],
    ...productRows,
  ]);

  // Create Workbook & Append Sheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Detail Transaksi');
  XLSX.utils.book_append_sheet(workbook, productSheet, 'Performa Menu');

  // Generate and download
  const dateStamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStamp}.xlsx`);
}

export function exportToPDF(
  transactions: Transaction[],
  summary: ReportSummary,
  storeConfig: PrinterConfig,
  fileNamePrefix: string = 'Laporan_Penjualan_NicePresso'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Store Brand Header
  doc.setFillColor(220, 38, 38); // Red brand theme
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(storeConfig.storeName.toUpperCase() + ' - POS & BEVERAGE SYSTEM', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Laporan Penjualan Resmi | Real-Time Financial Analytics', 14, 18);
  doc.text(new Date().toLocaleDateString('id-ID', { dateStyle: 'full' }), 196, 18, { align: 'right' });

  // Period and Subtitle
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ringkasan Penjualan (${summary.periodLabel})`, 14, 34);

  // Summary Metrics Cards (Table format)
  const summaryBoxData = [
    [
      `Total Omset:\nRp ${summary.totalRevenue.toLocaleString('id-ID')}`,
      `Laba Bersih:\nRp ${summary.totalProfit.toLocaleString('id-ID')}`,
      `Total Transaksi:\n${summary.totalTransactions} Order`,
      `Minuman Terjual:\n${summary.totalItemsSold} Cup`,
      `AOV (Avg Basket):\nRp ${Math.round(summary.averageOrderValue).toLocaleString('id-ID')}`,
    ],
  ];

  autoTable(doc, {
    startY: 38,
    head: [],
    body: summaryBoxData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 4,
      fillColor: [248, 250, 252],
      textColor: [17, 24, 39],
      lineColor: [229, 231, 235],
      lineWidth: 0.3,
    },
  });

  // Transactions Table
  const tableData = transactions.map((t, idx) => {
    const itemsSummary = t.items.map((i) => `${i.name} (${i.qty})`).join(', ');
    return [
      String(idx + 1),
      t.invoiceNumber,
      `${t.date}\n${t.time}`,
      t.cashierName,
      itemsSummary,
      t.paymentMethod.toUpperCase(),
      `Rp ${t.total.toLocaleString('id-ID')}`,
      `Rp ${t.profit.toLocaleString('id-ID')}`,
    ];
  });

  const lastTableY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Daftar Rincian Transaksi', 14, lastTableY);

  autoTable(doc, {
    startY: lastTableY + 3,
    head: [['No', 'No. Invoice', 'Waktu', 'Kasir', 'Menu Minuman', 'Metode', 'Total', 'Laba']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 24 },
      3: { cellWidth: 26 },
      4: { cellWidth: 50 },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
    },
  });

  // Page Numbers
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Halaman ${i} dari ${totalPages} - ${storeConfig.storeName} POS System`,
      105,
      290,
      { align: 'center' }
    );
  }

  const dateStamp = new Date().toISOString().split('T')[0];
  doc.save(`${fileNamePrefix}_${dateStamp}.pdf`);
}
