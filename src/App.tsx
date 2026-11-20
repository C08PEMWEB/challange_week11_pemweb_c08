import { useState } from 'react'
import { NotesSection } from './components/NotesSection'
import { PostsSection } from './components/PostsSection'

export default function App() {
  const [section, setSection] = useState<'notes' | 'posts'>('notes')

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="eyebrow">KELOMPOK C08 · MODUL 5</span>
        <h1>Papan Catatan<span>.</span></h1>
        <p>Simpan ide di perangkatmu, bagikan cerita lewat post.</p>
      </header>
      <nav className="section-nav" aria-label="Bagian aplikasi">
        <button type="button" aria-pressed={section === 'notes'} onClick={() => setSection('notes')}>
          <span className="nav-number">01</span> Catatan lokal
        </button>
        <button type="button" aria-pressed={section === 'posts'} onClick={() => setSection('posts')}>
          <span className="nav-number">02</span> Post bersama
        </button>
      </nav>
      <main id="main-content">
        {/* Tetap mounted saat pindah bagian agar state form tidak hilang. */}
        <div hidden={section !== 'notes'}><NotesSection /></div>
        <div hidden={section !== 'posts'}><PostsSection /></div>
      </main>
      <footer className="app-footer">Praktikum Pemrograman Web · React + TypeScript</footer>
    </div>
  )
}
