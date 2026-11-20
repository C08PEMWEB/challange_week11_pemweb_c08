import type { Note } from '../types/note'

interface NoteCardProps {
  note: Note
  onDelete: (id: string) => void
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  return (
    <article className="card">
      <span className="badge">{note.category}</span>

      <h3>{note.title}</h3>

      <p>{note.content}</p>

      <button
        className="button button-danger"
        type="button"
        onClick={() => onDelete(note.id)}
        aria-label={`Hapus catatan ${note.title}`}
      >
        Hapus
      </button>
    </article>
  )
}
