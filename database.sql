-- ============================================================================
-- NICE PRESSO - Point of Sale (POS) & Real-Time Beverage Inventory Database
-- Database: nicepresso_pos
-- Description: Skema database relasional lengkap untuk sistem kasir minuman,
--              stok otomatis, pencatatan HPP/laba, transaksi, dan audit log.
-- Kompatibel: MySQL 5.7+ / MySQL 8.0 / MariaDB / PostgreSQL / SQLite
-- Dibuat untuk dibuka di Visual Studio Code (VS Code) & diimpor ke phpMyAdmin / MySQL
-- ============================================================================

-- 1. BUAT DATABASE (Jika menggunakan MySQL / MariaDB)
CREATE DATABASE IF NOT EXISTS `nicepresso_pos` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nicepresso_pos`;

-- ============================================================================
-- 2. STRUKTUR TABEL
-- ============================================================================

-- Tabel Pengguna (Admin & Kasir)
-- Sistem ini dirancang untuk 1 Owner Admin dan 1 Kasir Utama
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NULL,
  `pin` VARCHAR(10) NULL,
  `role` ENUM('admin', 'cashier') NOT NULL DEFAULT 'cashier',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_active` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel Kategori Minuman
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel Menu Minuman (Katalog Produk & Stok Real-Time)
DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `cost_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `min_stock_alert` INT NOT NULL DEFAULT 10,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `badge` VARCHAR(50) NULL,
  `has_ice_hot_option` TINYINT(1) NOT NULL DEFAULT 1,
  `has_sugar_option` TINYINT(1) NOT NULL DEFAULT 1,
  `description` TEXT NULL,
  `image_url` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_menu_category` (`category`),
  KEY `idx_menu_stock` (`stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel Topping Minuman
DROP TABLE IF EXISTS `toppings`;
CREATE TABLE `toppings` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel Transaksi Penjualan (Header Struk)
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` VARCHAR(50) NOT NULL,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `transaction_date` DATE NOT NULL,
  `transaction_time` TIME NOT NULL,
  `timestamp_unix` BIGINT NOT NULL,
  `cashier_id` VARCHAR(50) NOT NULL,
  `cashier_name` VARCHAR(100) NOT NULL,
  `total_qty` INT NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `profit` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('cash', 'qris', 'debit') NOT NULL DEFAULT 'cash',
  `cash_amount_received` DECIMAL(12,2) NULL,
  `change_given` DECIMAL(12,2) NULL,
  `status` ENUM('completed', 'refunded', 'cancelled') NOT NULL DEFAULT 'completed',
  `void_reason` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trx_date` (`transaction_date`),
  KEY `idx_trx_status` (`status`),
  KEY `idx_trx_cashier` (`cashier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel Rincian Item Transaksi (Detail Cup, Varian Gula/Es/Topping)
DROP TABLE IF EXISTS `transaction_items`;
CREATE TABLE `transaction_items` (
  `id` VARCHAR(50) NOT NULL,
  `transaction_id` VARCHAR(50) NOT NULL,
  `menu_item_id` VARCHAR(50) NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `cost_price` DECIMAL(12,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `variant` VARCHAR(50) NOT NULL DEFAULT 'Ice',
  `sugar_level` VARCHAR(50) NOT NULL DEFAULT 'Normal (100%)',
  `ice_level` VARCHAR(50) NOT NULL DEFAULT 'Normal Ice',
  `toppings_text` VARCHAR(255) NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `notes` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_item_trx` (`transaction_id`),
  KEY `idx_item_menu` (`menu_item_id`),
  CONSTRAINT `fk_trx_items_trx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel Buku Log Stok (Audit Trail Pengurangan Penjualan, Restock & Waste)
DROP TABLE IF EXISTS `stock_logs`;
CREATE TABLE `stock_logs` (
  `id` VARCHAR(50) NOT NULL,
  `menu_item_id` VARCHAR(50) NOT NULL,
  `menu_item_name` VARCHAR(150) NOT NULL,
  `prev_stock` INT NOT NULL,
  `change_qty` INT NOT NULL,
  `new_stock` INT NOT NULL,
  `reason` ENUM('sale', 'restock', 'adjustment', 'waste') NOT NULL,
  `notes` VARCHAR(255) NULL,
  `updated_by` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stock_log_menu` (`menu_item_id`),
  KEY `idx_stock_log_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel Log Aktivitas Kasir & Admin
DROP TABLE IF EXISTS `cashier_activities`;
CREATE TABLE `cashier_activities` (
  `id` VARCHAR(50) NOT NULL,
  `cashier_id` VARCHAR(50) NOT NULL,
  `cashier_name` VARCHAR(100) NOT NULL,
  `action` ENUM('login', 'logout', 'sale', 'void', 'shift_start', 'shift_end') NOT NULL,
  `details` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12,2) NULL,
  `invoice_number` VARCHAR(50) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_act_cashier` (`cashier_id`),
  KEY `idx_act_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel Konfigurasi Printer Thermal Bluetooth & Profil Outlet
DROP TABLE IF EXISTS `printer_settings`;
CREATE TABLE `printer_settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `store_name` VARCHAR(100) NOT NULL DEFAULT 'NICE PRESSO',
  `store_address` VARCHAR(255) NOT NULL DEFAULT 'Jl. Boulevard Raya No. 42, Kota',
  `store_phone` VARCHAR(50) NOT NULL DEFAULT '0812-3456-7890',
  `paper_width` VARCHAR(20) NOT NULL DEFAULT '58mm',
  `auto_print_on_checkout` TINYINT(1) NOT NULL DEFAULT 1,
  `footer_message` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 3. DATA AWAL (SEED DATA)
-- ============================================================================

-- Data Pengguna: 1 Owner Admin dan 1 Kasir Utama Saja
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `pin`, `role`, `is_active`, `created_at`, `last_active`) VALUES
('user-admin-1', 'Owner Admin', 'admin@nicepresso.com', 'admin123', NULL, 'admin', 1, '2026-01-01 08:00:00', NOW()),
('user-cashier-1', 'Kasir Nice Presso', 'kasir@nicepresso.com', NULL, '1234', 'cashier', 1, '2026-01-02 08:00:00', NOW());

-- Data Kategori Minuman
INSERT INTO `categories` (`id`, `name`, `display_order`) VALUES
('cat-1', 'Coffee', 1),
('cat-2', 'Choco Series', 2),
('cat-3', 'Tea & Latte', 3),
('cat-4', 'Special Flavors', 4);

-- Data Menu Minuman Lengkap (Katalog Nice Presso)
INSERT INTO `menu_items` (`id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock_alert`, `is_available`, `badge`, `has_ice_hot_option`, `has_sugar_option`, `description`, `image_url`) VALUES
('np-01', 'Americano Classic', 'Coffee', 5000.00, 2000.00, 45, 10, 1, '5K', 1, 1, 'Espresso murni aromatik dipadukan dengan air dingin/panas segar khas Nice Presso.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80'),
('np-02', 'Aren Latte', 'Coffee', 8000.00, 3800.00, 35, 10, 1, '8K', 1, 1, 'Perpaduan kopi espresso kental dengan susu segar dan manis legit gula aren asli.', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop&q=80'),
('np-03', 'Choco Blast Crumb', 'Choco Series', 8000.00, 3900.00, 6, 10, 1, '8K', 1, 1, 'Cokelat lumer pekat dengan taburan remah cokelat krispi melimpah.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=80'),
('np-04', 'Caramel Cocoa', 'Choco Series', 8000.00, 3900.00, 25, 10, 1, '8K', 1, 1, 'Kombinasi harum sirup karamel gurih dengan cokelat kental creamy.', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80'),
('np-05', 'Roasted Hazelnut Cocoa', 'Choco Series', 8000.00, 4000.00, 30, 10, 1, '8K', 1, 1, 'Aroma kacang hazelnut panggang premium menyatu dengan cokelat lembut.', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80'),
('np-06', 'Classic Matcha Latte', 'Tea & Latte', 10000.00, 4800.00, 18, 10, 1, '10K', 1, 1, 'Bubuk matcha hijau asli Uji Jepang berpadu susu murni lembut dan wangi.', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80'),
('np-07', 'Red Velvet Latte', 'Tea & Latte', 10000.00, 4900.00, 22, 10, 1, '10K', 1, 1, 'Sensasi rasa kue red velvet manis gurih dengan warna merah menggoda.', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400&auto=format&fit=crop&q=80'),
('np-08', 'Taro Cream Latte', 'Tea & Latte', 10000.00, 4800.00, 15, 10, 1, '10K', 1, 1, 'Manis lembut khas umbi taro ungu berpadu susu kental creamy.', 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=400&auto=format&fit=crop&q=80'),
('np-09', 'Earl Grey Milk Tea', 'Tea & Latte', 8000.00, 3600.00, 28, 10, 1, '8K', 1, 1, 'Teh hitam bergamot aromatik bercampur susu lembut menyegarkan.', 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=400&auto=format&fit=crop&q=80'),
('np-10', 'Classic Choco Malt', 'Special Flavors', 8000.00, 3900.00, 40, 10, 1, '8K New', 1, 1, 'Rasa cokelat malt klasik legendaris yang manis dan berenergi.', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&auto=format&fit=crop&q=80'),
('np-11', 'Choco Mocha Malt', 'Special Flavors', 10000.00, 5000.00, 20, 10, 1, '10K New', 1, 1, 'Perpaduan seimbang kopi mocca harum dengan cokelat malt mantap.', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=80'),
('np-12', 'Avocado Choco Malt', 'Special Flavors', 10000.00, 5200.00, 14, 10, 1, '10K New', 1, 1, 'Kesegaran alpukat creamy dengan swirl cokelat malt tebal nikmat.', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&auto=format&fit=crop&q=80'),
('np-13', 'Roasted Almond Choco', 'Special Flavors', 10000.00, 5100.00, 5, 10, 1, '10K New', 1, 1, 'Cokelat kental harum dengan cita rasa kacang almond sangrai yang gurih.', 'https://images.unsplash.com/photo-1610889556528-9a770e32644f?w=400&auto=format&fit=crop&q=80');

-- Data Topping Minuman
INSERT INTO `toppings` (`id`, `name`, `price`, `is_available`) VALUES
('top-1', 'Boba Pearl', 3000.00, 1),
('top-2', 'Grass Jelly (Cincau)', 2000.00, 1),
('top-3', 'Cheese Foam', 3000.00, 1),
('top-4', 'Choco Crumb', 2000.00, 1),
('top-5', 'Extra Shot Espresso', 3000.00, 1);

-- Data Pengaturan Printer Struk
INSERT INTO `printer_settings` (`store_name`, `store_address`, `store_phone`, `paper_width`, `auto_print_on_checkout`, `footer_message`) VALUES
('NICE PRESSO', 'Jl. Boulevard Raya No. 42, Kota', '0812-3456-7890', '58mm', 1, 'Terima kasih atas kunjungan Anda!\nFollow IG: @nicepresso.id\nWiFi: NicePressoPass');

-- Contoh Transaksi Penjualan dari Kasir (Otomatis Masuk ke Data Admin)
INSERT INTO `transactions` (`id`, `invoice_number`, `transaction_date`, `transaction_time`, `timestamp_unix`, `cashier_id`, `cashier_name`, `total_qty`, `subtotal`, `discount`, `tax`, `total`, `total_cost`, `profit`, `payment_method`, `cash_amount_received`, `change_given`, `status`) VALUES
('trx-001', 'NP-20260909-0001', '2026-09-09', '09:15:20', 1788941720000, 'user-cashier-1', 'Kasir Nice Presso', 2, 16000.00, 0.00, 0.00, 16000.00, 7600.00, 8400.00, 'cash', 20000.00, 4000.00, 'completed'),
('trx-002', 'NP-20260909-0002', '2026-09-09', '10:45:10', 1788947110000, 'user-cashier-1', 'Kasir Nice Presso', 3, 27000.00, 2000.00, 0.00, 25000.00, 11600.00, 13400.00, 'qris', NULL, NULL, 'completed'),
('trx-003', 'NP-20260909-0003', '2026-09-09', '14:20:00', 1788960000000, 'user-cashier-1', 'Kasir Nice Presso', 1, 10000.00, 0.00, 0.00, 10000.00, 4800.00, 5200.00, 'cash', 10000.00, 0.00, 'completed');

-- Detail Item Transaksi
INSERT INTO `transaction_items` (`id`, `transaction_id`, `menu_item_id`, `item_name`, `price`, `cost_price`, `quantity`, `variant`, `sugar_level`, `ice_level`, `toppings_text`, `subtotal`, `notes`) VALUES
('item-1', 'trx-001', 'np-02', 'Aren Latte', 8000.00, 3800.00, 2, 'Ice', 'Normal (100%)', 'Normal Ice', 'Boba Pearl', 16000.00, 'Gula aren pisah sedikit'),
('item-2', 'trx-002', 'np-03', 'Choco Blast Crumb', 8000.00, 3900.00, 2, 'Ice', 'Less Sugar (70%)', 'Less Ice', 'Choco Crumb', 16000.00, 'Remah cokelat ekstra'),
('item-3', 'trx-002', 'np-01', 'Americano Classic', 5000.00, 2000.00, 1, 'Hot', 'No Sugar (0%)', 'No Ice', NULL, 5000.00, 'Panas double shot'),
('item-4', 'trx-003', 'np-06', 'Classic Matcha Latte', 10000.00, 4800.00, 1, 'Ice', 'Normal (100%)', 'Normal Ice', NULL, 10000.00, NULL);

-- Log Pengurangan Stok Otomatis Transaksi
INSERT INTO `stock_logs` (`id`, `menu_item_id`, `menu_item_name`, `prev_stock`, `change_qty`, `new_stock`, `reason`, `notes`, `updated_by`, `created_at`) VALUES
('sl-01', 'np-02', 'Aren Latte', 37, -2, 35, 'sale', 'Penjualan kasir #NP-20260909-0001', 'Kasir Nice Presso', '2026-09-09 09:15:20'),
('sl-02', 'np-03', 'Choco Blast Crumb', 8, -2, 6, 'sale', 'Penjualan kasir #NP-20260909-0002', 'Kasir Nice Presso', '2026-09-09 10:45:10'),
('sl-03', 'np-01', 'Americano Classic', 46, -1, 45, 'sale', 'Penjualan kasir #NP-20260909-0002', 'Kasir Nice Presso', '2026-09-09 10:45:10'),
('sl-04', 'np-06', 'Classic Matcha Latte', 19, -1, 18, 'sale', 'Penjualan kasir #NP-20260909-0003', 'Kasir Nice Presso', '2026-09-09 14:20:00');

-- ============================================================================
-- 4. CONTOH QUERY SQL BERGUNA UNTUK ANALISIS DASHBOARD ADMIN
-- ============================================================================

-- Query A: Menghitung Total Omset, Total Cup, dan Estimasi Laba Bersih Hari Ini
-- SELECT 
--   DATE(transaction_date) AS tanggal,
--   COUNT(id) AS total_transaksi,
--   SUM(total_qty) AS total_cup_terjual,
--   SUM(total) AS total_omset,
--   SUM(total_cost) AS total_hpp,
--   SUM(profit) AS estimasi_laba_bersih
-- FROM transactions
-- WHERE transaction_date = CURDATE() AND status = 'completed'
-- GROUP BY DATE(transaction_date);

-- Query B: 5 Minuman Terlaris (Top 5 Best-Selling Drinks)
-- SELECT 
--   item_name,
--   SUM(quantity) AS total_terjual,
--   SUM(subtotal) AS total_pendapatan
-- FROM transaction_items
-- GROUP BY item_name
-- ORDER BY total_terjual DESC
-- LIMIT 5;

-- Query C: Peringatan Stok Minuman Menipis di Bawah Batas Minimum
-- SELECT 
--   id,
--   name AS nama_minuman,
--   category AS kategori,
--   stock AS sisa_stok,
--   min_stock_alert AS batas_minimum
-- FROM menu_items
-- WHERE stock <= min_stock_alert AND is_available = 1
-- ORDER BY stock ASC;

-- Query D: Rekapitulasi Pendapatan Berdasarkan Metode Pembayaran (Tunai vs QRIS vs Debit)
-- SELECT 
--   payment_method,
--   COUNT(id) AS jumlah_transaksi,
--   SUM(total) AS total_uang_masuk
-- FROM transactions
-- WHERE status = 'completed'
-- GROUP BY payment_method;
