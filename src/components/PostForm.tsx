import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

interface PostFormProps {
  onSubmit: (input: { title: string; content: string }) => Promise<void>
  isSubmitting: boolean
}

export function PostForm({ onSubmit, isSubmitting }: PostFormProps) {
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    try {
      await onSubmit({ title: trimmedTitle, content: content.trim() })
      setTitle('')
      setContent('')
    } catch {
      // Parent handles and displays submission errors; preserve the form values.
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        maxLength={200}
        required
        aria-label="Judul post"
        placeholder="Judul post"
      />
      <textarea
        value={content}
        onChange={handleContentChange}
        maxLength={10000}
        aria-label="Isi post"
        placeholder="Isi post"
      />
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : 'Tambah Post'}
      </button>
    </form>
  )
}
