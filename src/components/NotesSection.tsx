// Orang 2: ganti kerangka ini dengan state, pencarian, NoteForm, dan NoteCard.
export function NotesSection() {
  return (
    <section className="panel" aria-labelledby="notes-title">
      <span className="eyebrow">TAHAP 1 · DI PERANGKAT INI</span>
      <h2 id="notes-title">Ruang untuk ide sehari-hari</h2>
      <p className="section-description">Catatan pribadi yang tersimpan di browsermu.</p>
      <div className="empty-state"><h3>Papan catatan sedang disiapkan</h3><p>Form, pencarian, dan daftar catatan akan hadir di sini.</p></div>
    </section>
  )
}
