# 🧠 Skema Umum Integrasi AI (Production-Ready)

Dokumen ini menjelaskan arsitektur standar untuk mengintegrasikan Fitur AI ke dalam aplikasi full-stack agar bekerja dengan presisi tinggi, aman, dan modular.

## 1. Alur Arsitektur (Data Flow)

1. **Capture Context (Frontend):** Mengambil state aplikasi saat ini (data tabel, form, atau riwayat).
2. **Secure Request (API Layer):** Mengirim data ke API Route backend (API Key TIDAK BOLEH ada di frontend).
3. **Prompt Wrapping (Backend Service):** Menggabungkan input user dengan "System Instruction" yang ketat.
4. **AI Processing (Gemini API):** Model melakukan reasoning dan menghasilkan output (rekomendasi: format JSON).
5. **Reactive UI (Frontend):** Render hasil AI ke dalam komponen spesifik (Chart, Badge, atau Rekomendasi Teks).

---

## 2. Struktur File Standar

### Sisi Backend (Logic & Security)
- `server.ts`: Entry point API, menangani routing `/api/ai`.
- `src/logic/services/aiService.ts`: 
    - Inisialisasi SDK AI (Gemini/OpenAI).
    - Definisi `systemInstruction` (instruksi agar AI tahu tugasnya).
    - Logika parsing output (memastikan AI mengembalikan JSON yang valid).
- `.env`: Menyimpan `GEMINI_API_KEY` (Sangat Rahasia).

### Sisi Frontend (Interaction)
- `src/logic/hooks/useAI.ts`: Hook untuk menangani state `fetching`, `streaming`, dan `response`.
- `src/ui/components/common/AIChat.tsx`: Komponen chat terapung atau widget insight.
- `src/ui/components/elements/LoadingAI.tsx`: Animasi pulse/shimmer saat AI sedang "berpikir".

---

## 3. Strategi "AI Sempurna" (Tips & Trik)

### A. Gunakan JSON Schema
Jangan biarkan AI menjawab dengan teks bebas. Selalu tambahkan instruksi:
> "Kembalikan jawaban HANYA dalam format JSON dengan struktur: { status: string, message: string, data: [] }"

### B. Context Injection
AI bekerja lebih baik jika tahu sekelilingnya. Kirimkan metadata seperti:
- Siapa user yang sedang login (Role/Peran).
- Jam/Waktu saat ini (Context Time).
- Data yang sedang dilihat di layar (Active View).

### C. Error Handling & Fallback
AI bisa gagal atau "halusinasi". Selalu siapkan:
- Timeout handling (jika AI terlalu lama menjawab).
- Filter kata-kata kasar/sensitif (Safety Settings).
- Default value jika JSON yang dikembalikan korup/rusak.

---

## 4. Implementasi Modular
Untuk aplikasi masa depan, pastikan logika AI diletakkan di folder `src/logic/` agar bisa dipindah-pindah antar project tanpa merusak UI. Gunakan TypeScript (`types.ts`) untuk mendefinisikan kontrak antara apa yang diminta user dan apa yang bisa dijawab AI.
