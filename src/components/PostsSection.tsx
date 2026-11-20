// Orang 3: ganti kerangka ini. Gunakan getPosts/createPost/deletePost dari service.
export function PostsSection() {
  return (
    <section className="panel" aria-labelledby="posts-title">
      <span className="eyebrow">TAHAP 2 · TERSIMPAN DI CLOUD</span>
      <h2 id="posts-title">Cerita yang bisa dibagikan</h2>
      <p className="section-description">Post bersama yang tersimpan melalui server.</p>
      <div className="empty-state"><h3>Ruang post sedang disiapkan</h3><p>Form, pencarian, dan daftar post akan hadir di sini.</p></div>
    </section>
  )
}
