# Panduan Integrasi (Connection Rule)

Dokumen ini menjelaskan prinsip dan pola integrasi standar untuk menghubungkan Frontend (React/Vite) dengan Backend (Express/Supabase) dan Storage (Tigris), sesuai dengan standar **Modular Monolith**.

## 1. Arsitektur Umum
Aplikasi menggunakan arsitektur **Full-Stack Modular Monolith**:
- **Frontend**: React (Vite) dengan Tailwind CSS, menggunakan standar `ui/` (komponen visual murni) dan `modules/` (logika fitur spesifik).
- **Backend (API Layer)**: Express.js (di `server.ts`) yang berjalan dalam satu instance Node.js. Menangani proxy storage Tigris dan sinkronisasi skema database.
- **Database**: PostgreSQL (Supabase). **Frontend berinteraksi langsung** dengan database untuk operasi CRUD menggunakan client `@supabase/supabase-js` yang diinisialisasi di `src/logic/libs/supabase.ts`. Backend `server.ts` hanya terhubung ke database via `pg` driver murni untuk eksekusi skrip sinkronisasi skema SQL.
- **Storage**: Tigris (S3-compatible) yang di-proxy penuh melalui backend untuk mengamankan kredensial bucket.

## 2. Standar Aliran Data (Data Flow)
1. **UI Component (`src/modules/[nama_modul]/...`)**
   Komponen memanggil Custom Hooks (misal: `useTransactions`) untuk mendapatkan data, loading state, dan fungsi mutasi. Komponen **dilarang memanggil supabase client secara langsung**.
2. **Custom Hooks (`src/logic/hooks/use[Entity].ts`)**
   Hooks mengelola state React (seperti `data`, `loading`, `error`) dan memanggil Service Layer. Hooks bertugas sebagai Orchestrator state di frontend.
3. **Service Layer (`src/logic/services/[entity]Service.ts`)**
   Service bertanggung jawab atas operasi data via client `supabase`. Service **wajib** melakukan map data mentah (snake_case dari database) menjadi bentuk TypeScript Interface (camelCase) yang terstruktur rapi.
4. **Backend API (`server.ts`)**
   Endpoint API bertugas menangani aksi spesifik infrastruktur (misal: `POST /api/upload`, `POST /api/sync-database`).
5. **Database (`database/[nama_modul].sql`)**
   Tabel SQL modular dengan standar UUID, audit trail (`created_at`, `updated_at`), dan aturan *idempotent* untuk sync.

## 3. Aturan Sinkronisasi Database
Fitur **Sync Database Now** pada halaman **Settings** memfasilitasi sinkronisasi skema dan migrasi:
- API `/api/sync-database` akan membaca seluruh file `.sql` di folder `database/` dan mengeksekusinya di Supabase.
- Setiap file SQL **wajib** ditulis *idempotent* (gunakan `CREATE TABLE IF NOT EXISTS`, dan gunakan block `DO $$ BEGIN ... END $$;` untuk DROP object lama/migrasi kolom).
- Di akhir eksekusi, server akan menjalankan `NOTIFY pgrst, 'reload schema';` untuk merefresh cache Supabase API, agar perubahan seketika disadari oleh `@supabase/supabase-js` di sisi frontend.

## 4. Pengelolaan Storage (Tigris)
Proses upload file tidak boleh dilakukan langsung ke S3 dari browser:
- Gunakan endpoint internal `/api/upload` (memanfaatkan multer) yang akan meneruskan *buffer* file menggunakan `PutObjectCommand` dari AWS SDK ke Tigris.
- URL gambar harus menggunakan jalur proxy internal seperti `/api/images/[key]` agar file tetap bisa diakses tanpa mengekspos bucket *Private*.
- File sebaiknya dikompresi di sisi client sebelum dikirim ke backend.

## 5. Fetching Center (Lazy Loading vs Full Fetching)
Berdasarkan utilitas di `src/logic/services/fetchingCenter.ts`:
- **Full Fetching / Query All**: Digunakan untuk master data yang sifatnya kecil/konstan (contoh: Wallets, Credit Cards).
- **Lazy Loading**: Wajib untuk list log atau transaksi berjalan (contoh: Transactions). Menggunakan paginasi `.range()` dari Supabase dikombinasikan dengan limit dinamis FetchingCenter.
---
*Dokumen ini merupakan Source of Truth untuk menghubungkan seluruh ekosistem aplikasi agar sesuai dengan best-practice.*
