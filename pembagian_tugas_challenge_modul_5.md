# Pembagian Tugas & Alur Kerja Kelompok — Challenge Modul 5

> **Stack:** Vite + React + TypeScript + Express & Neon (Modul 4)  
> **Format Pengumpulan:** Video penjelasan kode hasil akhir  
> **Format Nama File Video:** `NamaKelompok_Asistensi_Modul5_NamaAsisten`  
> **Deadline:** Jumat, pukul 23:59

---

## 1. Strategi Kolaborasi (*Zero-Conflict Architecture*)

Agar ketiga anggota kelompok dapat bekerja secara paralel tanpa mengalami *merge conflict* di Git:
1. **Orang 1** menyiapkan seluruh kerangka proyek Vite (`react-ts`), struktur folder, styling dasar (`index.css`), *routing* tampilan di `App.tsx`, serta menyalakan backend Modul 4 dan membuat fungsi pemanggil API (`postService.ts`).
2. **Orang 2** fokus mengisi seluruh logika dan komponen **Tahap 1 (Papan Catatan Lokal)** di dalam file yang sudah disediakan.
3. **Orang 3** fokus mengisi seluruh komponen UI **Tahap 2 (Integrasi REST API)** dengan langsung memanggil fungsi API yang telah dibuat oleh Orang 1.

---

## 2. Pembagian Tugas Per Anggota

### 👤 Orang 1: Project Architect, Backend & API Service Lead
**Fokus:** Setup proyek Vite, konfigurasi Backend Modul 4, dan jembatan `fetch` API.

* **File & Folder Tanggung Jawab:**
  * Repo Backend Modul 4 (`src/index.ts`)
  * `src/index.css` & `src/App.tsx`
  * `src/types/post.ts`
  * `src/services/postService.ts`
  * *(Membuatkan file kerangka kosong untuk Orang 2 dan Orang 3)*
* **Checklist Tugas:**
  - [ ] Menyalakan server Express + Neon dari Modul 4 dan memasang middleware `cors({ origin: "http://localhost:5173" })`.
  - [ ] Menginisiasi proyek Vite (`npm create vite@latest ... -- --template react-ts`) dan membuat folder `src/types`, `src/hooks`, `src/services`, dan `src/components`.
  - [ ] Menulis CSS dasar di `src/index.css` dan menyiapkan navigasi tab/bagian di `src/App.tsx` yang memanggil `<NotesSection />` dan `<PostsSection />`.
  - [ ] Mendefinisikan `interface Post` di `src/types/post.ts`.
  - [ ] Membuat fungsi `fetch` (`getPosts`, `createPost`, `deletePost`, serta dukungan parameter `?search=`) di `src/services/postService.ts` (atau menggunakan *fallback* `https://jsonplaceholder.typicode.com/posts` jika backend belum siap).
  - [ ] Melakukan `git push` pertama agar Orang 2 dan Orang 3 bisa langsung bekerja.

---

### 👤 Orang 2: Frontend Lokal & State Lead (Tahap 1)
**Fokus:** Membangun aplikasi papan catatan lokal menggunakan `useState`, *controlled form*, `.filter()`, dan `localStorage`.

* **File & Folder Tanggung Jawab:**
  * `src/types/note.ts`
  * `src/hooks/useLocalStorage.ts`
  * `src/components/NoteForm.tsx`
  * `src/components/NoteCard.tsx`
  * `src/components/NotesSection.tsx`
* **Checklist Tugas:**
  - [ ] Membuat `interface Note` (`id`, `title`, `content`, `category`) di `src/types/note.ts`.
  - [ ] Membuat *custom hook* `useLocalStorage` di `src/hooks/useLocalStorage.ts` agar data catatan tetap tersimpan saat browser di-*refresh*.
  - [ ] Membuat komponen *controlled form* tambah catatan (`value` & `onChange` dengan tipe event React) di `src/components/NoteForm.tsx`.
  - [ ] Membuat komponen kartu catatan yang menerima props (`read-only`) serta tombol hapus di `src/components/NoteCard.tsx`.
  - [ ] Merangkai state `notes`, penambahan/penghapusan data secara *immutable*, dan fitur pencarian berdasarkan judul menggunakan `.filter()` di dalam `src/components/NotesSection.tsx`.

---

### 👤 Orang 3: Frontend Full-Stack UI Lead (Tahap 2)
**Fokus:** Menghubungkan antarmuka React ke REST API menggunakan `useEffect`, menangani status *loading/error*, dan memperbarui UI secara *real-time*.

* **File & Folder Tanggung Jawab:**
  * `src/components/PostForm.tsx`
  * `src/components/PostCard.tsx`
  * `src/components/PostsSection.tsx`
* **Checklist Tugas:**
  - [ ] Membuat form tambah post baru (`POST /api/posts`) di `src/components/PostForm.tsx`.
  - [ ] Membuat tampilan kartu post beserta tombol hapus (`DELETE /api/posts/:id`) di `src/components/PostCard.tsx`.
  - [ ] Mengelola 3 state utama (`posts`, `isLoading`, `error`) di `src/components/PostsSection.tsx` untuk menampilkan indikator *loading* dan pesan *error* jika server Express mati.
  - [ ] Memastikan aksi tambah (`POST`) dan hapus (`DELETE`) langsung memperbarui state `posts` di UI tanpa perlu *refresh* halaman.
  - [ ] *(Bonus)* Menambahkan input pencarian yang memicu pengambilan data ke backend dengan query `?search=...` menggunakan `useEffect(..., [search])`.

---

## 3. Peta Struktur Folder Proyek

```text
src/
├── types/
│   ├── note.ts              # [Orang 2] Interface Note
│   └── post.ts              # [Orang 1] Interface Post
├── hooks/
│   └── useLocalStorage.ts   # [Orang 2] Custom hook penyimpanan lokal
├── services/
│   └── postService.ts       # [Orang 1] Fungsi fetch GET, POST, DELETE, Search
├── components/
│   ├── NoteForm.tsx         # [Orang 2] Form tambah catatan
│   ├── NoteCard.tsx         # [Orang 2] Kartu catatan + tombol hapus
│   ├── NotesSection.tsx     # [Orang 2] Kontainer utama Tahap 1
│   ├── PostForm.tsx         # [Orang 3] Form tambah post ke API
│   ├── PostCard.tsx         # [Orang 3] Kartu post + tombol hapus API
│   └── PostsSection.tsx     # [Orang 3] Kontainer utama Tahap 2
├── App.tsx                  # [Orang 1] Pembungkus utama (Tahap 1 & Tahap 2)
├── index.css                # [Orang 1] Styling sederhana aplikasi
└── main.tsx                 # Entry point Vite
```

---

## 4. Alur Eksekusi Git

1. **Inisiasi (Orang 1):** Membuat repo, menyiapkan struktur folder di atas beserta kerangka `App.tsx`, lalu `git push origin main`.
2. **Pengerjaan Paralel (Orang 2 & Orang 3):** Melakukan `git clone`, menjalankan `npm install` & `npm run dev`, lalu mengerjakan file masing-masing tanpa menyentuh file milik anggota lain.
3. **Penggabungan (Semua Anggota):** Setelah selesai, masing-masing melakukan `git add .`, `git commit`, dan `git push` (disarankan memakai *branch* terpisah seperti `feat/tahap-1` dan `feat/tahap-2` lalu di-*merge* ke `main`).

---

## 5. Pembagian Segmen Video Penjelasan Kode

Karena penilaian berupa **video penjelasan kode hasil akhir** (bukan *live coding*), berikut pembagian presentasi agar durasi merata dan seluruh poin rubrik terpenuhi:

1. **Segmen 1 — Orang 1 (Arsitektur Proyek, Backend & Service API):**
   * Menunjukkan struktur folder proyek (`types`, `hooks`, `services`, `components`) dan `App.tsx`.
   * Menunjukkan terminal backend Modul 4 yang menyala beserta konfigurasi `cors`.
   * Menjelaskan kode `post.ts` dan fungsi `fetch` (`GET`, `POST`, `DELETE`, `?search=`) di `postService.ts`.
2. **Segmen 2 — Orang 2 (Demo & Penjelasan Kode Tahap 1):**
   * Mendemokan tambah catatan, pencarian judul, hapus catatan, dan *refresh* browser (membuktikan `localStorage` bekerja).
   * Menjelaskan `interface Note`, cara kerja `useLocalStorage`, konsep *controlled form* & *lifting state up* di `NoteForm.tsx` dan `NoteCard.tsx`, serta filter pencarian dengan `.filter()`.
3. **Segmen 3 — Orang 3 (Demo & Penjelasan Kode Tahap 2):**
   * Mendemokan tambah post (`POST`), hapus post (`DELETE`), pencarian *real-time* (`?search=`), serta simulasi mematikan server backend untuk menampilkan pesan *error* dan *loading*.
   * Menjelaskan manajemen 3 state (`posts`, `isLoading`, `error`), pembaruan state *immutable* tanpa *refresh*, serta penggunaan `useEffect(..., [search])` di `PostsSection.tsx`.