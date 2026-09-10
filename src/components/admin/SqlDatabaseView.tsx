import React, { useState } from 'react';
import {
  Database,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  Server,
  Layers,
  Sparkles,
  Search,
  BookOpen,
} from 'lucide-react';

export const SqlDatabaseView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'seed' | 'queries' | 'guide'>('schema');

  const sqlFullText = `-- ============================================================================
-- NICE PRESSO - Point of Sale (POS) & Real-Time Beverage Inventory Database
-- Database: nicepresso_pos
-- Kompatibel: MySQL 5.7+ / MySQL 8.0 / MariaDB / PostgreSQL / SQLite
-- Dibuat untuk dibuka di Visual Studio Code (VS Code) & diimpor ke phpMyAdmin / MySQL
-- ============================================================================

CREATE DATABASE IF NOT EXISTS \`nicepresso_pos\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`nicepresso_pos\`;

-- 1. TABEL USERS (1 Admin & 1 Kasir)
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NULL,
  \`pin\` VARCHAR(10) NULL,
  \`role\` ENUM('admin', 'cashier') NOT NULL DEFAULT 'cashier',
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`last_active\` DATETIME NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL KATEGORI
DROP TABLE IF EXISTS \`categories\`;
CREATE TABLE \`categories\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`display_order\` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL MENU MINUMAN & STOK REAL-TIME
DROP TABLE IF EXISTS \`menu_items\`;
CREATE TABLE \`menu_items\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`category\` VARCHAR(50) NOT NULL,
  \`price\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`cost_price\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`stock\` INT NOT NULL DEFAULT 0,
  \`min_stock_alert\` INT NOT NULL DEFAULT 10,
  \`is_available\` TINYINT(1) NOT NULL DEFAULT 1,
  \`badge\` VARCHAR(50) NULL,
  \`has_ice_hot_option\` TINYINT(1) NOT NULL DEFAULT 1,
  \`has_sugar_option\` TINYINT(1) NOT NULL DEFAULT 1,
  \`description\` TEXT NULL,
  \`image_url\` VARCHAR(500) NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_menu_category\` (\`category\`),
  KEY \`idx_menu_stock\` (\`stock\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL TOPPING MINUMAN
DROP TABLE IF EXISTS \`toppings\`;
CREATE TABLE \`toppings\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`price\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`is_available\` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL TRANSAKSI PENJUALAN (HEADER STRUK)
DROP TABLE IF EXISTS \`transactions\`;
CREATE TABLE \`transactions\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`invoice_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`transaction_date\` DATE NOT NULL,
  \`transaction_time\` TIME NOT NULL,
  \`timestamp_unix\` BIGINT NOT NULL,
  \`cashier_id\` VARCHAR(50) NOT NULL,
  \`cashier_name\` VARCHAR(100) NOT NULL,
  \`total_qty\` INT NOT NULL DEFAULT 1,
  \`subtotal\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`discount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`tax\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`total\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`total_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`profit\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`payment_method\` ENUM('cash', 'qris', 'debit') NOT NULL DEFAULT 'cash',
  \`cash_amount_received\` DECIMAL(12,2) NULL,
  \`change_given\` DECIMAL(12,2) NULL,
  \`status\` ENUM('completed', 'refunded', 'cancelled') NOT NULL DEFAULT 'completed',
  \`void_reason\` VARCHAR(255) NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_trx_date\` (\`transaction_date\`),
  KEY \`idx_trx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. TABEL RINCIAN ITEM TRANSAKSI
DROP TABLE IF EXISTS \`transaction_items\`;
CREATE TABLE \`transaction_items\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`transaction_id\` VARCHAR(50) NOT NULL,
  \`menu_item_id\` VARCHAR(50) NOT NULL,
  \`item_name\` VARCHAR(150) NOT NULL,
  \`price\` DECIMAL(12,2) NOT NULL,
  \`cost_price\` DECIMAL(12,2) NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT 1,
  \`variant\` VARCHAR(50) NOT NULL DEFAULT 'Ice',
  \`sugar_level\` VARCHAR(50) NOT NULL DEFAULT 'Normal (100%)',
  \`ice_level\` VARCHAR(50) NOT NULL DEFAULT 'Normal Ice',
  \`toppings_text\` VARCHAR(255) NULL,
  \`subtotal\` DECIMAL(12,2) NOT NULL,
  \`notes\` VARCHAR(255) NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_item_trx\` (\`transaction_id\`),
  CONSTRAINT \`fk_trx_items_trx\` FOREIGN KEY (\`transaction_id\`) REFERENCES \`transactions\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TABEL BUKU LOG STOK (AUDIT TRAIL)
DROP TABLE IF EXISTS \`stock_logs\`;
CREATE TABLE \`stock_logs\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`menu_item_id\` VARCHAR(50) NOT NULL,
  \`menu_item_name\` VARCHAR(150) NOT NULL,
  \`prev_stock\` INT NOT NULL,
  \`change_qty\` INT NOT NULL,
  \`new_stock\` INT NOT NULL,
  \`reason\` ENUM('sale', 'restock', 'adjustment', 'waste') NOT NULL,
  \`notes\` VARCHAR(255) NULL,
  \`updated_by\` VARCHAR(100) NOT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. TABEL PENGATURAN PRINTER STRUK THERMAL
DROP TABLE IF EXISTS \`printer_settings\`;
CREATE TABLE \`printer_settings\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`store_name\` VARCHAR(100) NOT NULL DEFAULT 'NICE PRESSO',
  \`store_address\` VARCHAR(255) NOT NULL DEFAULT 'Jl. Boulevard Raya No. 42, Kota',
  \`store_phone\` VARCHAR(50) NOT NULL DEFAULT '0812-3456-7890',
  \`paper_width\` VARCHAR(20) NOT NULL DEFAULT '58mm',
  \`auto_print_on_checkout\` TINYINT(1) NOT NULL DEFAULT 1,
  \`footer_message\` TEXT NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INSERT DATA AWAL (SEED)
INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`is_active\`) VALUES
('user-admin-1', 'Owner Admin', 'admin@nicepresso.com', 'admin123', 'admin', 1),
('user-cashier-1', 'Kasir Nice Presso', 'kasir@nicepresso.com', NULL, 'cashier', 1);

INSERT INTO \`menu_items\` (\`id\`, \`name\`, \`category\`, \`price\`, \`cost_price\`, \`stock\`, \`min_stock_alert\`, \`is_available\`, \`badge\`) VALUES
('np-01', 'Americano Classic', 'Coffee', 5000.00, 2000.00, 45, 10, 1, '5K'),
('np-02', 'Aren Latte', 'Coffee', 8000.00, 3800.00, 35, 10, 1, '8K'),
('np-03', 'Choco Blast Crumb', 'Choco Series', 8000.00, 3900.00, 6, 10, 1, '8K'),
('np-04', 'Caramel Cocoa', 'Choco Series', 8000.00, 3900.00, 25, 10, 1, '8K'),
('np-05', 'Roasted Hazelnut Cocoa', 'Choco Series', 8000.00, 4000.00, 30, 10, 1, '8K'),
('np-06', 'Classic Matcha Latte', 'Tea & Latte', 10000.00, 4800.00, 18, 10, 1, '10K'),
('np-07', 'Red Velvet Latte', 'Tea & Latte', 10000.00, 4900.00, 22, 10, 1, '10K'),
('np-08', 'Taro Cream Latte', 'Tea & Latte', 10000.00, 4800.00, 15, 10, 1, '10K'),
('np-09', 'Earl Grey Milk Tea', 'Tea & Latte', 8000.00, 3600.00, 28, 10, 1, '8K'),
('np-10', 'Classic Choco Malt', 'Special Flavors', 8000.00, 3900.00, 40, 10, 1, '8K New'),
('np-11', 'Choco Mocha Malt', 'Special Flavors', 10000.00, 5000.00, 20, 10, 1, '10K New'),
('np-12', 'Avocado Choco Malt', 'Special Flavors', 10000.00, 5200.00, 14, 10, 1, '10K New'),
('np-13', 'Roasted Almond Choco', 'Special Flavors', 10000.00, 5100.00, 5, 10, 1, '10K New');`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlFullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlFullText], { type: 'text/sql;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'database.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-red-50 text-red-600">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-gray-950">Skema Database SQL (database.sql)</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              VS Code Ready
            </span>
          </div>
          <p className="text-xs text-gray-600">
            File <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-red-600">/database.sql</code> telah dibuat di root direktori project. Anda dapat membukanya langsung di <strong>Visual Studio Code</strong> atau mengimpornya ke MySQL / phpMyAdmin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="copy-sql-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Semua SQL'}</span>
          </button>

          <button
            id="download-sql-btn"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-xs active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Unduh database.sql</span>
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
            <FileCode className="w-4 h-4 text-red-600" />
            <span>Lokasi File</span>
          </div>
          <div className="font-mono text-xs font-bold text-gray-900 truncate">
            ./database.sql
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Folder root aplikasi</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
            <Server className="w-4 h-4 text-blue-600" />
            <span>DBMS Kompatibel</span>
          </div>
          <div className="text-xs font-bold text-gray-900">
            MySQL 5.7+ / 8.0 / MariaDB
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Juga mendukung PostgreSQL &amp; SQLite</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Tabel Relasional</span>
          </div>
          <div className="text-xs font-bold text-gray-900">
            8 Tabel Terstruktur
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Users, Menu, Trx, Logs, Toppings</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Akun Default</span>
          </div>
          <div className="text-xs font-bold text-gray-900">
            1 Admin &amp; 1 Kasir
          </div>
          <div className="text-[10px] text-gray-400 mt-1">admin@nicepresso.com / kasir</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50/70 px-4 pt-3 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === 'schema'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Struktur Tabel (DDL)
          </button>
          <button
            onClick={() => setActiveTab('seed')}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === 'seed'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Data Awal (Insert Seed)
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === 'queries'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Query Analitik Laporan
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Panduan Buka di VS Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-600 flex items-center justify-between">
                <span>Skema relasional otomatis untuk menyimpan data menu, cup, harga modal, penjualan kasir, dan audit stok:</span>
                <span className="text-[11px] font-mono text-gray-400">InnoDB UTF8MB4</span>
              </div>
              <div className="bg-gray-950 text-gray-100 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-all">
                <pre>{sqlFullText.split('-- INSERT DATA AWAL (SEED)')[0]}</pre>
              </div>
            </div>
          )}

          {activeTab === 'seed' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Data awal lengkap mencakup 1 Akun Admin, 1 Akun Kasir, 13 Varian Menu Minuman Nice Presso (Americano 5K, Aren Latte 8K, Choco Series, Matcha, Red Velvet, dll.), Topping, dan Pengaturan Struk:
              </p>
              <div className="bg-gray-950 text-gray-100 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-all">
                <pre>{'-- INSERT DATA AWAL (SEED)\n' + sqlFullText.split('-- INSERT DATA AWAL (SEED)')[1]}</pre>
              </div>
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Kumpulan query SQL siap pakai untuk menganalisis performa penjualan kasir yang dapat dijalankan di MySQL / phpMyAdmin:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-red-600" />
                    <span>1. Total Omset &amp; Laba Hari Ini</span>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
{`SELECT 
  DATE(transaction_date) AS tanggal,
  COUNT(id) AS total_transaksi,
  SUM(total_qty) AS cup_terjual,
  SUM(total) AS omset,
  SUM(profit) AS estimasi_laba
FROM transactions
WHERE transaction_date = CURDATE()
  AND status = 'completed';`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-600" />
                    <span>2. Top 5 Minuman Terlaris</span>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
{`SELECT 
  item_name,
  SUM(quantity) AS total_terjual,
  SUM(subtotal) AS total_pendapatan
FROM transaction_items
GROUP BY item_name
ORDER BY total_terjual DESC
LIMIT 5;`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-blue-600" />
                    <span>3. Peringatan Stok Menipis</span>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
{`SELECT 
  name,
  category,
  stock AS sisa_stok,
  min_stock_alert AS batas_minimal
FROM menu_items
WHERE stock <= min_stock_alert 
  AND is_available = 1
ORDER BY stock ASC;`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                    <span>4. Rekap Per Metode Bayar</span>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
{`SELECT 
  payment_method,
  COUNT(id) AS jumlah_transaksi,
  SUM(total) AS total_penerimaan
FROM transactions
WHERE status = 'completed'
GROUP BY payment_method;`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 space-y-2 text-xs">
                <h3 className="font-bold text-red-950 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-red-600" />
                  <span>Cara Membuka &amp; Menjalankan di Visual Studio Code (VS Code)</span>
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mt-2">
                  <li>
                    <strong>Buka Folder Project di VS Code</strong>: Jalankan <code className="bg-white px-1.5 py-0.5 rounded border border-red-200 font-mono">code .</code> di terminal atau klik <em>File &gt; Open Folder</em>.
                  </li>
                  <li>
                    <strong>Cari File <code className="bg-white px-1.5 py-0.5 rounded border border-red-200 font-mono">database.sql</code></strong>: File ini langsung berada di root folder proyek Anda.
                  </li>
                  <li>
                    <strong>Ekstensi Berguna di VS Code</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-gray-600">
                      <li><strong>SQLTools</strong> atau <strong>Database Client JDBC</strong> (oleh cweijan) untuk koneksi langsung ke database lokal/remote.</li>
                      <li><strong>MySQL Syntax Highlighter</strong> untuk pewarnaan sintaks SQL yang rapi.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Impor ke phpMyAdmin / XAMPP / Laragon</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-gray-600">
                      <li>Buka phpMyAdmin di browser (<code className="bg-white px-1 py-0.5 rounded font-mono">http://localhost/phpmyadmin</code>).</li>
                      <li>Klik tab <strong>Import</strong> di bagian atas.</li>
                      <li>Pilih file <code className="bg-white px-1 py-0.5 rounded font-mono">database.sql</code> dan klik tombol <strong>Go / Kirim</strong>.</li>
                      <li>Database <code className="bg-white px-1 py-0.5 rounded font-mono">nicepresso_pos</code> beserta 8 tabel dan seluruh data seed akan otomatis terbentuk!</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
