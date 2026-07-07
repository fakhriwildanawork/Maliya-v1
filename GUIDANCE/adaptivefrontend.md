# Adaptive Frontend Guidelines for Native-Like Feel

Dokumen ini berisi panduan untuk merancang antarmuka (UI/UX) web aplikasi agar terasa dan berfungsi layaknya aplikasi native (bawaan) pada perangkat smartphone dan tablet.

## 1. Breakpoints (Titik Henti Resolusi) & Orientasi
Gunakan ukuran viewport standar untuk menentukan tata letak:
*   **Mobile (Compact)**: `< 768px` (Tailwind: default/tanpa prefix)
*   **Tablet Portrait**: `>= 768px` dan `< 1024px` (Tailwind: `md:`). Secara lebar, ini masih terlalu sempit untuk multi-kolom yang rumit (seperti Sidebar + Grid). **Rekomendasi:** Sembunyikan sidebar dan ubah layout dari `md:` menjadi `lg:` untuk kolom utama agar bertindak selayaknya mobile.
*   **Tablet Landscape / Desktop (Wide)**: `>= 1024px` (Tailwind: `lg:` atau `xl:`). Sidebar bisa ditampilkan permanen.

Untuk menangkap ini di React, gunakan hook `useViewport()` yang mengecek:
*   `isCompact`, `isMedium`, `isWide`
*   `isPortrait`, `isLandscape`

## 2. Touch Targets (Area Sentuh)
Aplikasi native sangat memperhatikan kemudahan tap dengan jari.
*   **Ukuran Minimum**: Setiap elemen interaktif (tombol, link, icon) **wajib** memiliki area sentuh minimal **44x44 piksel** (iOS HIG) atau **48x48 piksel** (Material Design).
*   **Jarak Antar Elemen**: Beri jarak (gap/margin) minimal **8px** antar elemen interaktif agar tidak salah sentuh.
*   *Implementasi Tailwind*: Gunakan padding (`p-2`, `p-3`) atau min-height/width (`min-h-[44px] min-w-[44px]`) untuk icon button.

## 3. Typography (Teks & Font)
Ukuran teks harus mudah dibaca tanpa perlu zoom-in di layar kecil.
*   **Body Text (Utama)**: Minimal **16px** (Tailwind: `text-base`). Ini menghindari zoom otomatis pada input form di iOS.
*   **Secondary Text (Sub-label/Keterangan)**: Minimal **12px - 14px** (Tailwind: `text-xs` atau `text-sm`).
*   **Headings**: Sesuaikan skala. Di mobile, heading terlalu besar memakan ruang. Gunakan `text-2xl` atau `text-3xl` di mobile, dan naikkan (`md:text-4xl`) di tablet/desktop.

## 4. Spacing, Margin & Padding (Ruang Kosong)
*   **Margin Layar (Gutter)**: Gunakan padding horizontal **16px** (`px-4`) pada layar mobile kecil, dan **24px** (`px-6` atau `md:px-8`) pada tablet/desktop untuk konten utama.
*   **Sistem Grid 8pt**: Gunakan kelipatan 4 atau 8 untuk padding/margin (contoh: 4px, 8px, 12px, 16px, 24px, 32px) agar proporsional. (Tailwind mematuhi sistem ini secara default: `p-1`, `p-2`, `p-3`, `p-4`, dst).

## 5. Komponen UI & Adaptasinya

### A. Layout & Navigasi
*   **Mobile**: Sembunyikan Sidebar. Gunakan **Bottom Navigation Bar** untuk menu utama, atau **Hamburger Menu** (Drawer/Sheet) untuk opsi tambahan.
*   **Tablet/Desktop**: Gunakan **Sidebar** permanen atau dapat dilipat (collapsible).

### B. Cards & Grid
*   **Mobile**: Tumpuk elemen (Stack) menjadi 1 kolom (`grid-cols-1` atau `flex-col`). Elemen melebar sepenuh layar (full-width minus margin).
*   **Tablet**: Gunakan 2 kolom (`md:grid-cols-2`).
*   **Desktop**: Gunakan 3-4 kolom (`lg:grid-cols-3`, `xl:grid-cols-4`).

### C. Data Tables (Tabel)
Tabel sangat sulit dibaca di mobile.
*   **Sembunyikan Kolom Ekstra**: Di layar kecil, sembunyikan kolom yang kurang penting (`hidden sm:table-cell`). Sisakan info krusial (misal: Nama, Harga).
*   **Ubah ke List View**: Pendekatan terbaik untuk mobile adalah mengubah baris tabel menjadi format "Card" atau "List Item".
*   **Horizontal Scroll**: Jika harus menggunakan tabel, bungkus tabel dalam div dengan `overflow-x-auto` agar bisa digeser ke samping tanpa merusak layout halaman.

### D. Dialogs & Modals
*   **Mobile**: Tampilkan modal secara **Full-screen** (memenuhi layar penuh) atau gunakan **Bottom Sheet** (muncul dari bawah, dapat di-swipe).
*   **Tablet/Desktop**: Gunakan modal **Centered** (mengambang di tengah layar dengan latar belakang gelap/backdrop).

### E. Forms & Inputs
*   **Mobile**: Label diletakkan di **atas** input field (Vertical layout). Lebar input 100% (`w-full`). Gunakan keyboard type yang sesuai (misal `type="number"`, `type="email"`).
*   **Tablet/Desktop**: Bisa menggunakan label di sebelah kiri (Horizontal layout) jika ruang memungkinkan.

## 6. Animasi & Transisi
*   Beri efek *visual feedback* saat tombol disentuh (misal: warna sedikit menggelap dengan `active:bg-gray-200` atau efek *ripple*).
*   Gunakan transisi halus saat membuka menu atau modal (misal `transition-all duration-200 ease-in-out`).

## Referensi Viewport Cepat (Tailwind)
```css
/* Mobile (Default) */
.card { padding: 16px; flex-direction: column; }

/* Tablet (md:) */
@media (min-width: 768px) {
  .card { padding: 24px; flex-direction: row; }
}

/* Desktop (lg:) */
@media (min-width: 1024px) {
  /* Desktop specific adjustments */
}
```
