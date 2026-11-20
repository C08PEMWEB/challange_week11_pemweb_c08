import { useState } from 'react'
import { NoteForm } from './NoteForm'
import { NoteCard } from './NoteCard'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Note } from '../types/note'

export function NotesSection() {
  const [notes, setNotes] = useLocalStorage<Note[]>('c08-notes', [])
  const [search, setSearch] = useState('')

  function handleAdd(noteData: Omit<Note, 'id'>) {
    const newNote: Note = {
      id: crypto.randomUUID(),
      ...noteData,
    }

    setNotes((previousNotes) => [newNote, ...previousNotes])
  }

  function handleDelete(id: string) {
    setNotes((previousNotes) =>
      previousNotes.filter((note) => note.id !== id)
    )
  }

  const filteredNotes = notes.filter((note) => {
    const keyword = search.toLowerCase()

    return (
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword) ||
      note.category.toLowerCase().includes(keyword)
    )
  })

  return (
    <section className="panel" aria-labelledby="notes-title">
      <span className="eyebrow">TAHAP 1 · DI PERANGKAT INI</span>

      <h2 id="notes-title">Ruang untuk ide sehari-hari</h2>

      <p className="section-description">
        Catatan pribadi yang tersimpan di browsermu.
      </p>

      <NoteForm onAdd={handleAdd} />

      <input
        className="search-input"
        type="search"
        placeholder="Cari judul, isi, atau kategori catatan..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Cari catatan"
      />

      <div className="notes-info">
        <h3>Daftar Catatan</h3>
        <p>{filteredNotes.length} catatan ditemukan</p>
      </div>

      {filteredNotes.length > 0 ? (
        <div className="card-grid">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>
            {search ? 'Catatan tidak ditemukan' : 'Belum ada catatan'}
          </h3>
          <p>
            {search
              ? 'Coba gunakan kata kunci pencarian lainnya.'
              : 'Tambahkan catatan pertamamu menggunakan form di atas.'}
          </p>
        </div>
      )}
    </section>
  )
}
