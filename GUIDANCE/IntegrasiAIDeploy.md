# Panduan Integrasi & Deployment Fitur AI Komprehensif di Vercel (Serverless)

## Pendahuluan
Banyak developer mengalami kendala saat men-deploy aplikasi dengan fitur AI (seperti analisis laporan keuangan atau chatbot) ke Vercel. Seringkali fitur AI berjalan dengan sempurna di lingkungan lokal maupun Google AI Studio, tetapi mengalami kegagalan (seperti error **504 Gateway Timeout**, **403 Forbidden/CORS**, atau **500 Internal Server Error**) setelah di-deploy ke Vercel Serverless.

Dokumen ini menjelaskan secara teknis dan mendalam mengapa arsitektur aplikasi ini berhasil berjalan dengan sempurna di Vercel Serverless, serta panduan praktis untuk mereplikasi arsitektur ini ke aplikasi Anda yang lain.

---

## 1. Analisis Masalah: Mengapa Aplikasi Lain Sering Gagal di Vercel?

Ada tiga penyebab utama mengapa integrasi AI pada aplikasi buatan mandiri sering gagal saat di-deploy ke Vercel:

1. **Memanggil API AI Langsung dari Browser (Client-Side Calls)**
   * **Masalah:** Menggunakan API Key (Gemini, Groq, OpenAI) langsung pada kode React/Vite di browser.
   * **Akibat:** 
     * **CORS Blocked:** Provider AI memblokir panggilan langsung dari browser demi keamanan.
     * **Kebocoran API Key:** Kunci API dapat dengan mudah diintip oleh siapa saja melalui tab *Network* di Inspect Element browser.
     * **Environment Variable Kosong:** Variabel lingkungan tanpa awalan `VITE_` tidak akan di-bundle ke browser oleh Vite, sehingga nilainya terbaca sebagai `undefined`.

2. **Salah Memahami Konsep Serverless (Traditional Server vs Serverless)**
   * **Masalah:** Membuat server Node.js/Express tradisional (`server.ts` di root) yang berjalan terus-menerus dan menggunakan port binding (`app.listen(3000)`).
   * **Akibat:** Vercel **tidak menjalankan server latar belakang** secara terus-menerus. Vercel adalah platform serverless yang mengeksekusi kode berdasarkan *request on-demand* (menggunakan AWS Lambda di belakang layar). Segala bentuk instruksi `app.listen()` akan sepenuhnya diabaikan dalam mode produksi Vercel.

3. **Masalah Timeout Eksekusi (Gateway Timeout 504)**
   * **Masalah:** Menunggu model AI menyelesaikan seluruh paragraf jawaban baru kemudian mengirimkannya sekaligus ke pengguna.
   * **Akibat:** Vercel Hobby Plan memiliki batas waktu eksekusi fungsi serverless maksimal **10 detik** (Pro Plan maksimal 15-300 detik). Proses pembuatan teks panjang oleh AI sering kali membutuhkan waktu lebih dari 10 detik, sehingga Vercel langsung menghentikan koneksi secara sepihak dan memunculkan error 504.

---

## 2. Solusi & Arsitektur Sukses di Aplikasi Ini

Aplikasi ini menggunakan kombinasi arsitektur **Modular Monolith** yang dirancang khusus agar kompatibel dengan lingkungan kontainer (Google Cloud Run/AI Studio) maupun lingkungan Serverless (Vercel):

```
                       ┌──────────────────────┐
                       │   React UI (Vite)    │
                       └──────────┬───────────┘
                                  │
                   POST /api/ai/analyze-report
                   (Event-Stream / SSE)
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │       Vercel Serverless Function         │
             │           (/api/index.ts)                │
             └────────────────────┬─────────────────────┘
                                  │
                           Membaca API Key dari
                           process.env (Aman)
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │  AI Provider (Groq)  │
                       └──────────────────────┘
```

### Pilar 1: Server-Side API Proxying (Keamanan & CORS)
* **Penerapan:** Semua logika pemanggilan API AI diletakkan di sisi server (`src/logic/services/aiService.ts` dan `/api/index.ts`).
* **Keuntungan:** Browser hanya memanggil endpoint lokal `/api/ai/analyze-report`. API Key dibaca dengan aman dari lingkungan server (`process.env.GROQ_API_KEY`) tanpa pernah bocor ke browser. CORS tidak lagi menjadi masalah karena pemanggilan API dilakukan dari server-ke-server.

### Pilar 2: Struktur Serverless Routing Vercel (`vercel.json`)
Untuk menjembatani perbedaan antara server Express lokal dan arsitektur Serverless Vercel, kita menggunakan file konfigurasi `vercel.json` di root proyek:

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

* **Cara Kerja:**
  1. Setiap request yang mengarah ke `/api/*` secara otomatis diarahkan ke file `/api/index.ts`.
  2. Vercel akan mengekstrak `/api/index.ts` sebagai fungsi serverless tunggal.
  3. Di dalam `/api/index.ts`, kita mengabaikan `app.listen()` dan langsung mengekspor aplikasi Express (`export default app;`). Vercel akan menangani port binding secara internal.
  4. Request selain `/api` akan diarahkan ke `/index.html` untuk disajikan sebagai Single Page Application (SPA).

### Pilar 3: Streaming Data (Server-Sent Events) untuk Mengatasi Timeout
Untuk menghindari batas timeout 10 detik pada Vercel, aplikasi ini menggunakan teknik **Streaming (Server-Sent Events / SSE)**:

```typescript
// Header wajib pada response Express di /api/index.ts
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
```

* **Cara Kerja:** Server langsung memancarkan potongan kata (token) segera setelah AI memproduksinya, menggunakan perintah `res.write()`. Karena ada aktivitas lalu lintas data yang terus mengalir dari server ke browser sejak detik pertama, Vercel mendeteksi bahwa koneksi dalam keadaan aktif dan **tidak akan memicu timeout**, meskipun total durasi pembuatan analisis memakan waktu lebih dari 10 detik.

---

## 3. Panduan Langkah Demi Langkah Mengintegrasikan AI pada Proyek Lain

Jika Anda ingin membuat aplikasi baru atau memindahkan fitur AI dari aplikasi lain agar sukses berjalan di Vercel, ikuti langkah-langkah terstruktur berikut:

### Langkah 1: Pisahkan Logika AI ke Server-Side Service
Buat sebuah file service khusus di server Anda (misalnya `aiService.ts`) untuk menangani pemanggilan ke API AI:

```typescript
import { config } from '../utils/config.js';

export const aiService = {
  async streamAnalysis(prompt: string): Promise<ReadableStream<Uint8Array>> {
    const apiKey = process.env.GROQ_API_KEY; // Ambil aman di server
    if (!apiKey) throw new Error('API Key tidak terkonfigurasi.');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        stream: true, // WAJIB TRUE untuk mengaktifkan streaming
      }),
    });

    if (!response.ok) throw new Error('Gagal menghubungi AI Provider.');
    return response.body as ReadableStream<Uint8Array>;
  }
};
```

### Langkah 2: Buat Handler Express dengan Dukungan SSE (Streaming)
Hubungkan service tersebut ke rute Express di `/api/index.ts` agar dapat diakses oleh frontend:

```typescript
app.post("/api/ai/stream", express.json(), async (req, res) => {
  try {
    const { prompt } = req.body;
    const stream = await aiService.streamAnalysis(prompt);

    // Set header agar browser tahu ini adalah event-stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      // Teruskan potongan teks langsung ke browser
      res.write(chunk);
    }

    res.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
```

### Langkah 3: Konfigurasi Entrypoint Hibrida (`server.ts` & `/api/index.ts`)
Gunakan rute Express di dalam folder `/api` untuk serverless, tetapi buat pembungkus `server.ts` di root untuk pengembangan lokal:

**Isi `/api/index.ts` (Hanya rute dan konfigurasi aplikasi, tanpa listen):**
```typescript
import express from "express";
const app = express();

// Daftarkan rute API Anda di sini...
app.post("/api/ai/stream", ...);

export default app; // Ekspor agar dibaca oleh Vercel atau server.ts
```

**Isi `server.ts` (Hanya digunakan untuk mode lokal/kontainer):**
```typescript
import app from "./api/index";
import { createServer as createViteServer } from "vite";

async function start() {
  // Mount Vite middleware jika dalam mode pengembangan lokal
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }
  
  app.listen(3000, "0.0.0.0", () => {
    console.log("Server lokal berjalan di port 3000");
  });
}
start();
```

### Langkah 4: Tulis Konsumsi Stream pada Sisi React (Frontend)
Pada sisi React, gunakan API browser `fetch` standar untuk membaca data stream secara realtime (tidak bisa menggunakan Axios karena Axios mengumpulkan semua response sebelum menyajikannya):

```typescript
const handleAskAI = async () => {
  setResult(""); // Reset hasil sebelumnya
  
  const response = await fetch('/api/ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: "Analisis data saya" }),
  });

  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    // Masukkan token teks ke state secara progresif
    setResult((prev) => prev + chunk);
  }
};
```

---

## 4. Langkah Penting saat Deploy di Dashboard Vercel

Setelah kode siap dan diunggah ke repositori Anda (GitHub), selesaikan langkah berikut di dashboard Vercel agar integrasi berfungsi:

1. **Konfigurasikan Environment Variables**
   * Masuk ke proyek Anda di Dashboard Vercel.
   * Pilih menu **Settings** -> **Environment Variables**.
   * Masukkan nama kunci API yang sama persis seperti yang digunakan di server (misalnya `GROQ_API_KEY` atau `GEMINI_API_KEY`) beserta nilai kuncinya.
   * Tekan tombol **Save**.

2. **Perhatikan Case-Sensitivity File**
   * Vercel men-deploy aplikasi Anda pada lingkungan berbasis **Linux** yang bersifat *case-sensitive* (membedakan huruf besar dan kecil).
   * Pastikan semua instruksi impor path file di typescript sesuai persis dengan nama fisiknya di folder proyek.
   * *Contoh:* `import { aiService } from "./aiService"` akan error di Vercel jika nama filenya adalah `AIService.ts`.

3. **Lakukan Redeploy**
   * Setiap kali Anda mengubah atau menambahkan Environment Variables baru, Anda **wajib melakukan redeploy** (memicu build ulang di Vercel) agar nilai kunci API yang baru didaftarkan dapat terbaca oleh Serverless Functions.

---

## 5. Solusi Khusus Error Vercel Serverless (ESM Module Resolution)

Saat men-deploy ke Vercel dengan arsitektur hibrida (Express.js), Anda mungkin akan menemukan error seperti ini pada logs Vercel:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server' imported from /var/task/api/index.js
code: 'ERR_MODULE_NOT_FOUND',
url: 'file:///var/task/server'
```

### Penyebab Akar Masalah (Root Cause)
Error ini disebabkan oleh sistem resolusi modul (Module Resolution) dari Node.js dalam mode ESM (ECMAScript Modules). Pada mode ESM yang ketat, Node.js mensyaratkan bahwa semua _relative imports_ lokal **harus diakhiri dengan ekstensi `.js`** secara eksplisit pada impornya, **meskipun file aslinya adalah `.ts`**.

Walaupun pada pengembangan lokal (`tsx` atau `ts-node`) ekstensi ini bisa diabaikan, namun Vercel mem-build kode ke JavaScript native ESM, di mana import path `/server` dianggap sebagai sebuah direktori tanpa `index.js`, atau dianggap bukan file JavaScript yang sah tanpa ekstensi.

### Cara Memperbaikinya
Setiap kali Anda mengimpor module atau file internal proyek ke dalam endpoint API atau `server.ts` (terutama yang akan diekspor sebagai fungsi Vercel di folder `/api/`), pastikan Anda **selalu menambahkan ekstensi `.js` atau ekstensi eksplisit** pada file impor.

**Contoh Salah (Bisa berjalan lokal, gagal di Vercel):**
```typescript
// di dalam api/index.ts
import app from "../server"; 

// di dalam server.ts
import { analyzeReceipt } from "./src/logic/services/aiService";
```

**Contoh Benar (Bisa berjalan lokal dan sukses di Vercel):**
```typescript
// di dalam api/index.ts
import app from "../server.js"; 

// di dalam server.ts
import { analyzeReceipt } from "./src/logic/services/aiService.js";
```

### Ringkasan Aturan ESM di Vercel
1. Pada bagian server-side (`/api` atau `server.ts`), impor antar-file `.ts` **harus** ditulis menggunakan ekstensi `.js`.
2. Jangan menambahkan ekstensi `.js` pada library pihak ketiga (misalnya `import express from "express";`). Ekstensi hanya ditujukan pada file buatan lokal (`./` atau `../`).
3. Konfigurasi `package.json` Anda kemungkinan menggunakan `"type": "module"`, sehingga aturan impor ESM modern ini diterapkan oleh Vercel.

---

Dengan memahami dan menerapkan pola **Server-Side API Proxying**, konfigurasi routing hibrida melalui **`vercel.json`**, teknik **Streaming (Event-Stream)**, dan resolusi modul **ESM yang ketat**, aplikasi Anda akan dijamin berjalan dengan lancar tanpa kendala batas performa maupun masalah keamanan di platform Vercel Serverless!
