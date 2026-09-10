import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { bluetoothPrinterService } from '../services/bluetoothPrinter';
import { Printer, Bluetooth, CheckCircle2, AlertTriangle, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface PrinterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrinterSettingsModal: React.FC<PrinterSettingsModalProps> = ({ isOpen, onClose }) => {
  const { printerConfig, updatePrinterConfig } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const isBluetoothSupported = bluetoothPrinterService.isSupported();
  const isConnected = bluetoothPrinterService.isConnected();

  const handleConnect = async () => {
    setIsScanning(true);
    setStatusMessage({ type: 'info', text: 'Membuka jendela pencarian printer Bluetooth...' });
    try {
      const res = await bluetoothPrinterService.connect();
      if (res.success) {
        updatePrinterConfig({
          isConnected: true,
          name: res.deviceName || 'Bluetooth POS Printer',
        });
        setStatusMessage({
          type: 'success',
          text: `Berhasil terhubung ke: ${res.deviceName || 'Thermal Printer Bluetooth'}`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Gagal menyambungkan printer. Pastikan Bluetooth aktif dan printer menyala.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan koneksi Bluetooth.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDisconnect = () => {
    bluetoothPrinterService.disconnect();
    updatePrinterConfig({ isConnected: false });
    setStatusMessage({ type: 'info', text: 'Koneksi Bluetooth diputus.' });
  };

  const handleTestPrint = async () => {
    setStatusMessage({ type: 'info', text: 'Mengirim data uji cetak (test print)...' });
    const res = await bluetoothPrinterService.testPrint(printerConfig);
    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Uji cetak berhasil dikirim ke printer!' });
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Gagal mengirim uji cetak. Pastikan printer Bluetooth terhubung.',
      });
    }
  };

  return (
    <div
      id="printer-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Pengaturan Printer Thermal Bluetooth</h3>
              <p className="text-xs text-gray-500">Integrasi cetak struk otomatis kasir POS</p>
            </div>
          </div>
          <button
            id="close-printer-modal-btn"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`my-3 p-3 rounded-xl text-xs flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 animate-spin mt-0.5" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Bluetooth Device Pairing Card */}
        <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-gray-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                }`}
              />
              <div>
                <div className="font-semibold text-sm text-gray-900">
                  {isConnected ? printerConfig.name : 'Belum Ada Printer Terhubung'}
                </div>
                <div className="text-xs text-gray-500">
                  {isConnected
                    ? 'Status: Siap Mencetak Struk Otomatis'
                    : 'Gunakan tombol sambungkan untuk mendeteksi printer Bluetooth'}
                </div>
              </div>
            </div>

            {isConnected ? (
              <button
                id="disconnect-printer-btn"
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-600 hover:bg-red-50 transition"
              >
                Putus Koneksi
              </button>
            ) : (
              <button
                id="connect-bluetooth-printer-btn"
                onClick={handleConnect}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Bluetooth className="w-4 h-4" />
                )}
                <span>Cari Printer</span>
              </button>
            )}
          </div>

          {!isBluetoothSupported && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Browser ini belum mengaktifkan Web Bluetooth. Aplikasi tetap dapat mencetak struk secara sempurna melalui opsi <strong>Print Browser</strong> dan <strong>Download PDF</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Configuration Options */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Paper Width & Auto Print */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Ukuran Kertas Thermal</label>
              <div className="grid grid-cols-2 gap-2">
                {(['58mm', '80mm'] as const).map((width) => (
                  <button
                    key={width}
                    type="button"
                    onClick={() => updatePrinterConfig({ paperWidth: width })}
                    className={`py-2 px-3 rounded-lg font-medium border text-center transition ${
                      printerConfig.paperWidth === width
                        ? 'border-red-600 bg-red-50/50 text-red-700 font-semibold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {width}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Otomatis Cetak Saat Checkout</label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={printerConfig.autoPrintOnCheckout}
                  onChange={(e) => updatePrinterConfig({ autoPrintOnCheckout: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="text-gray-700">Cetak otomatis setelah bayar</span>
              </label>
            </div>
          </div>

          {/* Store Info on Receipt */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Nama Outlet Minuman di Struk</label>
              <input
                type="text"
                value={printerConfig.storeName}
                onChange={(e) => updatePrinterConfig({ storeName: e.target.value })}
                placeholder="Contoh: NICE PRESSO"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Alamat Outlet</label>
                <input
                  type="text"
                  value={printerConfig.storeAddress}
                  onChange={(e) => updatePrinterConfig({ storeAddress: e.target.value })}
                  placeholder="Jl. Raya No..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Nomor Telepon / WA</label>
                <input
                  type="text"
                  value={printerConfig.storePhone}
                  onChange={(e) => updatePrinterConfig({ storePhone: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Pesan Footer Struk</label>
              <textarea
                rows={2}
                value={printerConfig.footerMessage}
                onChange={(e) => updatePrinterConfig({ footerMessage: e.target.value })}
                placeholder="Pesan ucapan terima kasih atau sosial media..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            id="test-print-btn"
            onClick={handleTestPrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Test Print Kertas</span>
          </button>

          <button
            type="button"
            id="save-printer-settings-btn"
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Selesai &amp; Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
