# Web Deposit System

Sistem web untuk mengelola deposit/setoran.

## 🚀 Fitur

- Manajemen deposit/setoran
- Riwayat transaksi
- Dashboard admin

## 📋 Prasyarat

Sebelum memulai, pastikan sistem Anda telah memiliki:

- Node.js (versi 14.x atau lebih tinggi)
- NPM atau Yarn
- Database (MySQL/PostgreSQL)
- Web browser modern

## 💻 Instalasi

1. Clone repository
```bash
git clone https://github.com/username/web-deposit.git
cd web-deposit
```

2. Install dependencies
```bash
npm install
# atau
yarn install
```

3. Konfigurasi environment
```bash
cp .env.example .env
```
Edit file `.env` sesuai dengan konfigurasi database dan sistem Anda.

4. Jalankan migrasi database
```bash
npm run migrate
# atau
yarn migrate
```

5. Jalankan aplikasi
```bash
npm run dev
# atau
yarn dev
```

## 🔧 Konfigurasi

Buka file `.env` dan sesuaikan dengan kebutuhan:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=deposit_db

JWT_SECRET=your_jwt_secret
```

## 👥 Akun Default
