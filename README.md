# Challenge Modul 5 — Kelompok C08

Kerangka proyek **Orang 1**: Vite + React + TypeScript, CSS sederhana, backend
Express + Prisma + Neon, dan service pemanggil API. Backend mengambil model
`User`/`Post` dari `Praktikum_Bab04/Chall4` dengan format respons Modul 4.

**Komponen Tahap 1 milik Orang 2 dan UI Tahap 2 milik Orang 3 masih berupa
kerangka.** Aplikasi saat ini menampilkan dua bagian yang bisa dipilih, bukan
demo fitur catatan/post yang sudah selesai.

## Menjalankan proyek

Gunakan Node.js **22.12 atau lebih baru**; Node 24 LTS sesuai modul juga bisa.
Jalankan semua perintah berikut dari root proyek.

```bash
npm install
cp .env.example .env
cp backend/.env.example backend/.env
```

Jika file `.env` sudah ada, gunakan file tersebut dan jangan menimpanya. Isi
`backend/.env` dengan URL database Neon. `DATABASE_URL` memakai host pooled;
`DATABASE_URL_UNPOOLED` memakai host direct untuk migrasi. File `.env` di root
hanya berisi `VITE_API_URL=http://localhost:3000/api`.

Untuk database kosong, jalankan satu kali:

```bash
npm run db:migrate
npm run db:seed
```

Migrasi membuat tabel `User`, `Post`, indeks, dan relasi penulis. Seed hanya
memastikan akun penulis `kelompok.c08@example.test` tersedia; tidak menambah
contoh post atau menghapus data. Akun ini bukan fitur login.

**Jika database sudah berisi tabel Modul 4**, periksa kecocokan schema sebelum
migrasi. Jangan reset database. Jika schema persis sama, baseline migrasi awal
dapat dicatat dengan `prisma migrate resolve --applied 20261120000000_init_posts`
dari folder `backend`, kemudian jalankan seed. Jangan baseline schema yang
belum sesuai.

```bash
npm run dev:all
```

Frontend: <http://localhost:5173>. Backend: <http://localhost:3000>.
Tes koneksi server dan Neon: <http://localhost:3000/health>.

Untuk menjalankan terminal terpisah, gunakan `npm run dev` untuk frontend dan
`npm run dev:server` untuk backend. Matikan keduanya dengan Ctrl+C.

`npm install` menghasilkan Prisma Client secara otomatis. Jika schema berubah,
jalankan `npm run db:generate` lagi.

## Batas tanggung jawab

| Pemilik | File | Pekerjaan |
| --- | --- | --- |
| Orang 1 | `src/App.tsx`, `src/index.css`, konfigurasi root | Kerangka dan navigasi aplikasi |
| Orang 1 | `src/types/post.ts`, `src/services/postService.ts` | Kontrak data dan fetch API |
| Orang 1 | `backend/` | Express, CORS, Prisma, migrasi, seed |
| Orang 2 | `src/types/note.ts`, `src/hooks/useLocalStorage.ts` | Tipe Note dan penyimpanan lokal |
| Orang 2 | `NoteForm.tsx`, `NoteCard.tsx`, `NotesSection.tsx` | Seluruh fitur catatan lokal |
| Orang 3 | `PostForm.tsx`, `PostCard.tsx`, `PostsSection.tsx` | Form, kartu, loading/error, dan pencarian API |

Semua komponen memakai **named export**, misalnya `export function NotesSection()`.
Komponen anggota lain disediakan sebagai placeholder agar proyek tetap bisa
di-build selama pengerjaan paralel. Kedua section tetap mounted ketika berpindah
bagian; state form tidak di-reset oleh navigasi.

CSS bersama yang bisa dipakai: `panel`, `eyebrow`, `section-description`, `form`,
`button`, `button-danger`, `search-input`, `card-grid`, `card`, `badge`,
`empty-state`, `error-message`, dan `loading-message`.

## Kontrak service untuk Orang 3

Import fungsi dari `src/services/postService.ts`, dan tipe dari
`src/types/post.ts`. Service sudah mengambil `json.data` dari envelope backend.
**Jangan mengambil `.data` lagi pada hasil service.**

| Fungsi | Input | Hasil |
| --- | --- | --- |
| `getPosts(search?, signal?)` | Kata kunci judul; optional AbortSignal | `Promise<Post[]>` |
| `createPost(input)` | `{ title, content?, authorId? }` | `Promise<Post>` dari database |
| `deletePost(id)` | ID numerik | `Promise<void>` |

`Post` memiliki `id`, `title`, `content`, `published`, `views`, `authorId`,
`author: { id, name, email }`, `createdAt`, dan `updatedAt`. `content` dan nama
penulis bisa `null`. Tanggal dikirim sebagai string JSON.

`authorId` dapat dikosongkan pada form sederhana: backend menggunakan akun
kelompok yang dibuat seed. ID penulis dari Modul 4 juga tetap didukung.
Judul wajib diisi, maksimal 200 karakter; isi maksimal 10.000 karakter.

Contoh pemakaian di handler milik Orang 3:

```tsx
const created = await createPost({ title, content })
setPosts(previous => [created, ...previous])

await deletePost(id)
setPosts(previous => previous.filter(post => post.id !== id))
```

Tambahkan `try/catch` untuk menampilkan error serta state pengiriman/penghapusan
agar tombol tidak terpencet ganda. Jika pencarian aktif, pastikan post baru yang
ditampilkan sesuai kata kunci, atau kosongkan pencarian setelah menambah post.

Untuk bonus pencarian, panggil `getPosts(search, controller.signal)` dari
`useEffect(..., [search])`. Cleanup dengan `controller.abort()` dan abaikan
hasil/error dari request lama jika `controller.signal.aborted`. Ini mencegah
hasil pencarian lama menimpa hasil terbaru. Mulai dengan `isLoading = true`,
kosongkan error sebelum request, lalu selesaikan loading hanya untuk request aktif.

## Endpoint backend

| Method | URL | Respons sukses |
| --- | --- | --- |
| GET | `/health` | `{ status: true, message }`; benar-benar menguji database |
| GET | `/api/posts` | `{ status: true, message, data: Post[], metadata: { totalItems } }` |
| GET | `/api/posts?search=react` | Daftar yang judulnya mengandung kata kunci, tanpa membedakan kapital |
| POST | `/api/posts` | HTTP 201, `{ status: true, message, data: Post }` |
| DELETE | `/api/posts/:id` | `{ status: true, message, data: null }` |

Body POST berupa JSON, misalnya:

```json
{ "title": "Belajar React", "content": "Catatan pertemuan hari ini" }
```

Error selalu JSON `{ status: false, message }`. Validasi gagal menghasilkan
400, post tidak ditemukan 404, dan kegagalan database 503. Service melempar
`Error` dengan pesan yang dapat ditampilkan di UI, termasuk saat server mati.

CORS mengizinkan `http://localhost:5173` secara default. Ubah `CLIENT_ORIGIN`
di `backend/.env` bila frontend memakai origin lain. Vite memakai `strictPort`
agar tidak berpindah port dan membuat konfigurasi CORS tidak cocok.

## Verifikasi

```bash
npm run check
npm test
npm run build
```

Tes mencakup service fetch serta middleware/route Express dengan Prisma tiruan,
termasuk CORS, create/search/delete, validasi, error, dan pembatalan request.
Tes tersebut tidak menulis ke Neon. Koneksi database asli tetap harus diperiksa
melalui migrasi, seed, dan `/health` setelah jaringan tersedia.

Untuk demo error pada video, Orang 3 dapat mematikan terminal backend lalu
mengubah pencarian agar `getPosts` dipanggil ulang. UI harus menampilkan pesan
error, bukan terus loading.

## Environment dan Git

`.env`, `.env.*`, `node_modules/`, `dist/`, dan Prisma Client hasil generate
diabaikan Git. Hanya `.env.example` dengan placeholder yang dibagikan.
**Jangan menaruh URL PostgreSQL pada variabel berawalan `VITE_`**, karena variabel
itu masuk bundle browser. Kredensial database hanya ada di `backend/.env`.

Periksa sebelum commit:

```bash
git check-ignore .env backend/.env
git ls-files -- .env backend/.env
```

Perintah pertama seharusnya menampilkan kedua `.env`; perintah kedua harus kosong.

Repo tujuan: <https://github.com/C08PEMWEB/challange_week11_pemweb_c08>.
Karena `origin` sebelumnya mengarah ke repo pribadi, ganti dengan `set-url`,
bukan `remote add origin` yang akan gagal jika nama tersebut sudah ada.

Alur publikasi Orang 1 ke repo organisasi yang masih kosong setelah seluruh
pemeriksaan selesai:

```bash
git remote set-url origin https://github.com/C08PEMWEB/challange_week11_pemweb_c08.git
git switch -c feat/orang-1-setup-backend-api
git add .gitignore .env.example README.md package.json package-lock.json index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts src backend
git diff --cached --stat
git commit -m "feat: setup React, backend Neon, dan post API service"
git switch main
git merge --ff-only feat/orang-1-setup-backend-api
git push -u origin main
git push origin feat/orang-1-setup-backend-api
```

Jika repo tujuan sudah terisi selama pengerjaan, fetch dan periksa riwayat
remote sebelum push. Untuk riwayat yang sama, pull dengan `--ff-only` pada
`main` sebelum merge. Jika fast-forward gagal, integrasikan perubahan anggota
lain terlebih dahulu. Jangan menggunakan force push.
Orang 2 dan Orang 3 dapat membuat branch masing-masing dari `main` setelah setup
Orang 1 tersedia.

## Alur penjelasan video Orang 1

1. Tunjukkan struktur `types`, `hooks`, `services`, `components`, dan `backend`.
2. Jelaskan `main.tsx`, navigasi state di `App.tsx`, serta pembagian komponen.
3. Tunjukkan backend yang menyala, endpoint `/health`, dan middleware CORS di
   `backend/src/app.ts`. Kredensial `.env` tidak perlu ditampilkan.
4. Jelaskan model Prisma `User`/`Post` dan tipe `Post` di frontend.
5. Jelaskan GET dengan `URLSearchParams`, POST JSON, DELETE berdasarkan ID,
   pembacaan `json.data`, serta error handling pada `postService.ts`.
6. Lanjutkan ke demo Tahap 1 oleh Orang 2 dan Tahap 2 oleh Orang 3 setelah selesai.

Video berupa penjelasan kode hasil akhir, sesuai pengumuman terbaru.
Format nama: `NamaKelompok_Asistensi_Modul5_NamaAsisten`.
