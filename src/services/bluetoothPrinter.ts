import { Transaction, PrinterConfig } from '../types';

// Standard ESC/POS Command Constants
const ESC = 0x1b;
const GS = 0x1d;

export class BluetoothThermalPrinter {
  private device: any = null;
  private characteristic: any = null;
  private isConnecting: boolean = false;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public async connect(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: 'Web Bluetooth API tidak didukung di browser ini. Gunakan Google Chrome di Android/Desktop dengan HTTPS.',
      };
    }

    try {
      this.isConnecting = true;
      // Request device - searching for thermal printer services or any bluetooth device
      const navAny = navigator as any;
      const device = await navAny.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Common thermal printer service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
          '0000ae00-0000-1000-8000-00805f9b34fb',
          '0000ff00-0000-1000-8000-00805f9b34fb',
        ],
      });

      this.device = device;
      const server = await device.gatt.connect();

      // Find primary service and writable characteristic
      const services = await server.getPrimaryServices();
      let writeChar: any = null;

      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              writeChar = char;
              break;
            }
          }
          if (writeChar) break;
        } catch {
          // continue checking next service
        }
      }

      if (!writeChar) {
        throw new Error('Karakteristik penulisan data printer tidak ditemukan pada perangkat.');
      }

      this.characteristic = writeChar;
      this.isConnecting = false;

      return {
        success: true,
        deviceName: device.name || 'Thermal Printer Bluetooth',
      };
    } catch (err: any) {
      this.isConnecting = false;
      return {
        success: false,
        error: err?.message || 'Gagal menyambungkan printer bluetooth.',
      };
    }
  }

  public disconnect(): void {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }

  public isConnected(): boolean {
    return !!(this.device && this.device.gatt && this.device.gatt.connected && this.characteristic);
  }

  // Generate ESC/POS byte array for transaction receipt
  public generateReceiptBytes(trx: Transaction, config: PrinterConfig): Uint8Array {
    const bytes: number[] = [];
    const encoder = new TextEncoder();

    // Helper functions
    const pushBytes = (...b: number[]) => bytes.push(...b);
    const pushText = (text: string) => {
      const encoded = encoder.encode(text);
      for (let i = 0; i < encoded.length; i++) {
        bytes.push(encoded[i]);
      }
    };
    const pushLine = (text: string = '') => {
      pushText(text);
      pushBytes(0x0a); // LF
    };

    const maxChars = config.paperWidth === '80mm' ? 48 : 32;

    // Center alignment helper
    const padCenter = (text: string) => {
      if (text.length >= maxChars) return text.substring(0, maxChars);
      const leftPad = Math.floor((maxChars - text.length) / 2);
      return ' '.repeat(leftPad) + text;
    };

    // Two column row helper (Label, Value)
    const formatRow = (left: string, right: string) => {
      const availableSpaces = maxChars - left.length - right.length;
      if (availableSpaces <= 0) {
        return left.substring(0, maxChars - right.length - 1) + ' ' + right;
      }
      return left + ' '.repeat(availableSpaces) + right;
    };

    const divider = '='.repeat(maxChars);
    const thinDivider = '-'.repeat(maxChars);

    // 1. Initialize Printer
    pushBytes(ESC, 0x40);

    // 2. Header (Center, Bold, Double Height for Store Name)
    pushBytes(ESC, 0x61, 0x01); // Align center
    pushBytes(ESC, 0x45, 0x01); // Bold on
    pushBytes(GS, 0x21, 0x11);  // Double size
    pushLine(config.storeName || 'NICE PRESSO');
    pushBytes(GS, 0x21, 0x00);  // Normal size
    pushBytes(ESC, 0x45, 0x00); // Bold off

    pushLine(config.storeAddress || 'Coffee & Beverage Store');
    if (config.storePhone) {
      pushLine(`Telp: ${config.storePhone}`);
    }
    pushBytes(ESC, 0x61, 0x00); // Align left
    pushLine(divider);

    // 3. Metadata
    pushLine(formatRow('No. Struk:', trx.invoiceNumber));
    pushLine(formatRow('Tanggal  :', `${trx.date} ${trx.time}`));
    pushLine(formatRow('Kasir    :', trx.cashierName));
    pushLine(formatRow('Metode   :', trx.paymentMethod.toUpperCase()));
    pushLine(thinDivider);

    // 4. Items List
    trx.items.forEach((item) => {
      // Item name and variant
      const variantStr = `[${item.variant}]`;
      pushBytes(ESC, 0x45, 0x01); // Bold on
      pushLine(`${item.name} ${variantStr}`);
      pushBytes(ESC, 0x45, 0x00); // Bold off

      // Item customization detail if any
      const customParts: string[] = [];
      if (item.sugarLevel && !item.sugarLevel.includes('100%')) {
        customParts.push(item.sugarLevel.split(' ')[0]);
      }
      if (item.iceLevel && !item.iceLevel.includes('Normal')) {
        customParts.push(item.iceLevel);
      }
      if (item.toppings && item.toppings.length > 0) {
        customParts.push(item.toppings.map(t => `+${t.name}`).join(', '));
      }

      if (customParts.length > 0) {
        pushLine(` * ${customParts.join(' | ')}`);
      }

      // Qty x Price = Subtotal
      const qtyPriceStr = ` ${item.qty} x Rp ${item.price.toLocaleString('id-ID')}`;
      const subtotalStr = `Rp ${item.subtotal.toLocaleString('id-ID')}`;
      pushLine(formatRow(qtyPriceStr, subtotalStr));
    });

    pushLine(thinDivider);

    // 5. Totals
    pushLine(formatRow('Total Item', `${trx.totalQty} cup`));
    pushLine(formatRow('Subtotal', `Rp ${trx.subtotal.toLocaleString('id-ID')}`));

    if (trx.discount > 0) {
      pushLine(formatRow('Diskon', `-Rp ${trx.discount.toLocaleString('id-ID')}`));
    }
    if (trx.tax > 0) {
      pushLine(formatRow('PB1/Pajak', `Rp ${trx.tax.toLocaleString('id-ID')}`));
    }

    pushBytes(ESC, 0x45, 0x01); // Bold on
    pushBytes(GS, 0x21, 0x01);  // Double height
    pushLine(formatRow('TOTAL BAYAR', `Rp ${trx.total.toLocaleString('id-ID')}`));
    pushBytes(GS, 0x21, 0x00);  // Normal size
    pushBytes(ESC, 0x45, 0x00); // Bold off

    if (trx.paymentMethod === 'cash') {
      const received = trx.cashAmountReceived || trx.total;
      const change = trx.changeGiven || (received - trx.total);
      pushLine(formatRow('Tunai', `Rp ${received.toLocaleString('id-ID')}`));
      pushLine(formatRow('Kembalian', `Rp ${change.toLocaleString('id-ID')}`));
    } else {
      pushLine(formatRow('Status Bayar', 'LUNAS (QRIS/EDC)'));
    }

    pushLine(divider);

    // 6. Footer (Centered)
    pushBytes(ESC, 0x61, 0x01); // Center
    const footerLines = (config.footerMessage || 'Terima Kasih!\nSelamat Menikmati').split('\n');
    footerLines.forEach(line => pushLine(line));
    pushLine('Simpan struk ini sebagai bukti.');
    pushLine();

    // 7. Feed and Cut paper
    pushBytes(0x0a, 0x0a, 0x0a, 0x0a); // 4 line feeds
    pushBytes(GS, 0x56, 0x41, 0x10);    // Paper cut

    return new Uint8Array(bytes);
  }

  // Print raw buffer via Bluetooth
  public async printTransaction(trx: Transaction, config: PrinterConfig): Promise<{ success: boolean; error?: string }> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'Printer Bluetooth belum terhubung. Silakan sambungkan di Pengaturan Printer.',
      };
    }

    try {
      const receiptData = this.generateReceiptBytes(trx, config);
      
      // Bluetooth characteristic write limits (typically 20-512 bytes per chunk)
      const chunkSize = 100;
      for (let i = 0; i < receiptData.length; i += chunkSize) {
        const chunk = receiptData.slice(i, i + chunkSize);
        if (this.characteristic.writeValueWithResponse) {
          await this.characteristic.writeValueWithResponse(chunk);
        } else {
          await this.characteristic.writeValue(chunk);
        }
        // Small delay between chunks to prevent buffer overrun
        await new Promise((r) => setTimeout(r, 35));
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Gagal mengirim perintah cetak ke printer bluetooth.',
      };
    }
  }

  // Test Print
  public async testPrint(config: PrinterConfig): Promise<{ success: boolean; error?: string }> {
    const dummyTrx: Transaction = {
      id: 'test-print',
      invoiceNumber: 'TEST-0001',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('id-ID'),
      timestamp: Date.now(),
      cashierId: 'test',
      cashierName: 'Admin POS',
      items: [
        {
          cartId: 'c1',
          menuItemId: 'np-01',
          name: 'Americano Classic',
          price: 5000,
          costPrice: 2000,
          qty: 1,
          variant: 'Ice',
          sugarLevel: 'Normal (100%)',
          iceLevel: 'Normal Ice',
          toppings: [],
          subtotal: 5000,
        },
      ],
      totalQty: 1,
      subtotal: 5000,
      discount: 0,
      tax: 0,
      total: 5000,
      totalCost: 2000,
      profit: 3000,
      paymentMethod: 'cash',
      cashAmountReceived: 10000,
      changeGiven: 5000,
      status: 'completed',
    };

    return this.printTransaction(dummyTrx, config);
  }
}

export const bluetoothPrinterService = new BluetoothThermalPrinter();
