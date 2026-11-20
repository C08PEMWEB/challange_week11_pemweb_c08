import { useState, type FormEvent } from 'react'
import type { Note } from '../types/note'

interface NoteFormProps {
  onAdd: (note: Omit<Note, 'id'>) => void
}

export function NoteForm({ onAdd }: NoteFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Pribadi')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim() || !content.trim()) return

    onAdd({
      title: title.trim(),
      content: content.trim(),
      category,
    })

    setTitle('')
    setContent('')
    setCategory('Pribadi')
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Judul catatan
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Masukkan judul catatan"
          required
        />
      </label>

      <label>
        Isi catatan
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Tuliskan ide atau catatanmu..."
          required
        />
      </label>

      <label>
        Kategori
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="Pribadi">Pribadi</option>
          <option value="Kuliah">Kuliah</option>
          <option value="Pekerjaan">Pekerjaan</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </label>

      <button className="button" type="submit">
        + Tambahkan Catatan
      </button>
    </form>
  )
}
