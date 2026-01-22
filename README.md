# Duns Warung Kopi

![Logo](public/logo.svg)

Website warung kopi modern dengan menu kopi, minuman, makanan, serta PPOB. Pembayaran via QRIS / e-wallet, lalu pelanggan bisa upload bukti pembayaran langsung.

## Fitur
- Landing page profesional + menu catalog
- Keranjang belanja + checkout sederhana
- PPOB dengan admin fee 5%
- Upload bukti pembayaran (Cloudinary)
- Notifikasi pesanan ke Telegram admin
- Admin panel untuk kategori, produk, dan status pesanan
- Turso (SQLite serverless) + Next.js (Vercel-ready)
- Responsive + bottom navigation pada mobile

## Teknologi
- Next.js (App Router)
- Turso + @libsql/client
- TypeScript
- Cloudinary (upload bukti)
- Telegram Bot API (notifikasi)

## Struktur Folder
- `app/` UI + API Routes
- `app/api/*` backend endpoint
- `schema.sql` skema database
- `scripts/` init & seed data
- `public/` logo + qris image

## Setup Lokal
1. Install dependencies:
   ```bash
   npm install
   ```
2. Buat database Turso:
   - Buat database di Turso
   - Ambil `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN`
3. Buat Cloudinary:
   - Daftar akun Cloudinary
   - Ambil `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
4. Buat Telegram Bot:
   - Buat bot di @BotFather
   - Dapatkan `BOT_TOKEN`
   - Tambahkan bot ke group admin
   - Dapatkan `TELEGRAM_CHAT_ID` (lihat README bagian Telegram)
5. Copy env:
   ```bash
   cp .env.example .env.local
   ```
6. Isi `.env.local`:
   - `ADMIN_KEY` untuk akses admin panel
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = 6287881753955
   - `NEXT_PUBLIC_QRIS_IMAGE` = `/qris.png`
   - `NEXT_PUBLIC_EWALLET_INFO` isi nomor DANA/OVO/GoPay
   - `CLOUDINARY_*` sesuai akun
   - `TELEGRAM_*` sesuai bot
7. Inisialisasi database:
   ```bash
   npm run db:init
   ```
8. Seed data:
   ```bash
   npm run db:seed
   ```
9. Jalankan dev:
   ```bash
   npm run dev
   ```

Buka `http://localhost:3000` untuk storefront dan `http://localhost:3000/admin` untuk admin.

## Setup QRIS Image
- Simpan gambar QRIS di `public/qris.png` (replace file yang ada).
- Atau simpan dengan nama lain, lalu set `NEXT_PUBLIC_QRIS_IMAGE=/nama-file.png` di `.env.local`.

## Deploy ke Vercel
1. Push repo ke GitHub
2. Import project di Vercel
3. Tambahkan Environment Variables sesuai `.env.example`
4. Deploy

Checklist ENV di Vercel:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `ADMIN_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_QRIS_IMAGE`
- `NEXT_PUBLIC_EWALLET_INFO`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Cara Pakai Admin
- Masuk ke `/admin`
- Masukkan `ADMIN_KEY`
- Tambah kategori dan produk
- Update status pesanan delivery secara manual

## Upload Bukti Pembayaran
- Pelanggan bisa upload bukti pembayaran di checkout
- File dikirim ke Cloudinary
- Link bukti muncul di Admin panel

## Telegram Chat ID
Cara cek `chat_id` group:
1. Tambahkan bot ke group
2. Kirim pesan di group
3. Buka:
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
   ```
4. Ambil nilai `chat.id`

## API Singkat (Opsional)
- `GET /api/categories` list kategori
- `POST /api/categories` (admin) tambah kategori
- `GET /api/products` list produk
- `POST /api/products` (admin) tambah produk
- `PUT /api/products/[id]` (admin) update produk
- `DELETE /api/products/[id]` (admin) hapus produk
- `POST /api/orders` buat pesanan + notif Telegram
- `PATCH /api/orders/[id]` (admin) update status
- `POST /api/proof` upload bukti ke Cloudinary

## PPOB
- Produk PPOB menggunakan admin fee 5% (default)
- Nominal diinput langsung di card PPOB
- Admin fee bisa diubah per produk melalui admin panel

## Roadmap (Opsional)
- Notifikasi WhatsApp otomatis
- Tracking delivery
