import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, Check, AlertCircle, RefreshCw, X } from 'lucide-react';
import jsPDF from 'jspdf';

export const ReceiptModal: React.FC = () => {
  const { receiptModalTrx, closeReceiptModal, printerConfig, printViaBluetooth } = useApp();
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  if (!receiptModalTrx) return null;

  const trx = receiptModalTrx;
  const is58mm = printerConfig.paperWidth === '58mm';

  // Handle native browser print formatted for thermal roll
  const handleBrowserPrint = () => {
    window.print();
  };

  // Handle Bluetooth thermal print
  const handleBluetoothPrint = async () => {
    setIsPrinting(true);
    setPrintStatus(null);
    try {
      const res = await printViaBluetooth(trx);
      if (res.success) {
        setPrintStatus('Struk berhasil dicetak ke printer Bluetooth!');
        setTimeout(() => setPrintStatus(null), 4000);
      } else {
        setPrintStatus(`Perhatian: ${res.error || 'Printer Bluetooth belum terhubung'}`);
      }
    } catch (err: any) {
      setPrintStatus(`Gagal cetak: ${err?.message || 'Error tidak diketahui'}`);
    } finally {
      setIsPrinting(false);
    }
  };

  // Handle PDF Download of the receipt
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [is58mm ? 58 : 80, 160],
    });

    const pageWidth = is58mm ? 58 : 80;
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text(printerConfig.storeName, pageWidth / 2, 8, { align: 'center' });

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.text(printerConfig.storeAddress, pageWidth / 2, 13, { align: 'center' });
    if (printerConfig.storePhone) {
      doc.text(`Telp: ${printerConfig.storePhone}`, pageWidth / 2, 17, { align: 'center' });
    }

    doc.text('-'.repeat(is58mm ? 32 : 44), pageWidth / 2, 21, { align: 'center' });
    doc.text(`No: ${trx.invoiceNumber}`, 4, 25);
    doc.text(`Tgl: ${trx.date} ${trx.time}`, 4, 29);
    doc.text(`Kasir: ${trx.cashierName}`, 4, 33);
    doc.text(`Metode: ${trx.paymentMethod.toUpperCase()}`, 4, 37);
    doc.text('-'.repeat(is58mm ? 32 : 44), pageWidth / 2, 41, { align: 'center' });

    let y = 45;
    trx.items.forEach((item) => {
      doc.setFont('courier', 'bold');
      doc.text(`${item.name} [${item.variant}]`, 4, y);
      y += 3.5;
      doc.setFont('courier', 'normal');
      doc.text(`${item.qty} x Rp ${item.price.toLocaleString('id-ID')}`, 4, y);
      doc.text(`Rp ${item.subtotal.toLocaleString('id-ID')}`, pageWidth - 4, y, { align: 'right' });
      y += 4.5;
    });

    doc.text('-'.repeat(is58mm ? 32 : 44), pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setFont('courier', 'bold');
    doc.text('TOTAL:', 4, y);
    doc.text(`Rp ${trx.total.toLocaleString('id-ID')}`, pageWidth - 4, y, { align: 'right' });
    y += 4.5;

    if (trx.paymentMethod === 'cash') {
      doc.setFont('courier', 'normal');
      doc.text('Tunai:', 4, y);
      doc.text(`Rp ${(trx.cashAmountReceived || trx.total).toLocaleString('id-ID')}`, pageWidth - 4, y, { align: 'right' });
      y += 4;
      doc.text('Kembalian:', 4, y);
      doc.text(`Rp ${(trx.changeGiven || 0).toLocaleString('id-ID')}`, pageWidth - 4, y, { align: 'right' });
      y += 5;
    }

    doc.text('-'.repeat(is58mm ? 32 : 44), pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    const footerLines = printerConfig.footerMessage.split('\n');
    footerLines.forEach((fl) => {
      doc.text(fl, pageWidth / 2, y, { align: 'center' });
      y += 3.5;
    });

    doc.save(`Struk_${trx.invoiceNumber}.pdf`);
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Struk Pembayaran Thermal</h3>
              <p className="text-xs text-gray-500">Format roll {printerConfig.paperWidth}</p>
            </div>
          </div>
          <button
            id="close-receipt-btn"
            onClick={closeReceiptModal}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Print Status Feedback */}
        {printStatus && (
          <div
            className={`my-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
              printStatus.includes('berhasil')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {printStatus.includes('berhasil') ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{printStatus}</span>
          </div>
        )}

        {/* Realistic Thermal Receipt Paper Preview */}
        <div className="my-4 max-h-[380px] overflow-y-auto rounded-xl bg-gray-100 p-4 border border-gray-200 flex justify-center">
          <div
            id="thermal-receipt-printable"
            className={`bg-white p-5 shadow-sm font-mono text-[11px] leading-tight text-gray-900 border-t-4 border-t-red-600 ${
              is58mm ? 'w-[260px]' : 'w-[320px]'
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-gray-300">
              <div className="font-extrabold text-sm tracking-wide text-red-600">
                {printerConfig.storeName}
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">{printerConfig.storeAddress}</div>
              {printerConfig.storePhone && (
                <div className="text-[10px] text-gray-600">Telp: {printerConfig.storePhone}</div>
              )}
            </div>

            {/* Meta */}
            <div className="py-2 space-y-0.5 text-[10px] border-b border-dashed border-gray-300">
              <div className="flex justify-between">
                <span>No. Struk</span>
                <span className="font-semibold">{trx.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span>{trx.date} {trx.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{trx.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode</span>
                <span className="font-semibold uppercase">{trx.paymentMethod}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-2 space-y-2 border-b border-dashed border-gray-300">
              {trx.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>
                      {item.name} [{item.variant}]
                    </span>
                  </div>
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="text-[9px] text-gray-500 pl-2">
                      + {item.toppings.map((t) => t.name).join(', ')}
                    </div>
                  )}
                  {item.sugarLevel && !item.sugarLevel.includes('100%') && (
                    <div className="text-[9px] text-gray-500 pl-2">
                      Gula: {item.sugarLevel.split(' ')[0]}
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 text-[10px]">
                    <span>
                      {item.qty} x Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-gray-900 font-medium">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-gray-300">
              <div className="flex justify-between text-gray-600">
                <span>Total Item ({trx.totalQty} cup)</span>
                <span>Rp {trx.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {trx.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Diskon</span>
                  <span>-Rp {trx.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-200">
                <span>TOTAL AKHIR</span>
                <span className="text-red-700">Rp {trx.total.toLocaleString('id-ID')}</span>
              </div>
              {trx.paymentMethod === 'cash' ? (
                <>
                  <div className="flex justify-between text-gray-600 text-[10px]">
                    <span>Tunai</span>
                    <span>Rp {(trx.cashAmountReceived || trx.total).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold text-[10px]">
                    <span>Kembalian</span>
                    <span>Rp {(trx.changeGiven || 0).toLocaleString('id-ID')}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-emerald-600 text-[10px]">
                  <span>Status Pembayaran</span>
                  <span className="font-semibold">LUNAS ({trx.paymentMethod.toUpperCase()})</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-2 text-[9px] text-gray-500 whitespace-pre-line leading-relaxed">
              {printerConfig.footerMessage}
              <div className="mt-1 text-gray-400">--- Simpan struk ini ---</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          <button
            id="thermal-bluetooth-print-btn"
            onClick={handleBluetoothPrint}
            disabled={isPrinting}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 active:scale-98 transition shadow-xs disabled:opacity-50"
          >
            {isPrinting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            <span>Cetak Bluetooth</span>
          </button>

          <button
            id="browser-print-receipt-btn"
            onClick={handleBrowserPrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 active:scale-98 transition shadow-xs"
          >
            <Printer className="w-4 h-4 text-gray-300" />
            <span>Print Browser</span>
          </button>

          <button
            id="download-receipt-pdf-btn"
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 active:scale-98 transition"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Unduh PDF</span>
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            id="finish-receipt-btn"
            onClick={closeReceiptModal}
            className="text-xs text-gray-500 hover:text-gray-800 font-medium py-1 px-4"
          >
            Tutup &amp; Lanjutkan Transaksi Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
};
