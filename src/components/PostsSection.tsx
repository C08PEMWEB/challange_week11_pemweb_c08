import { useEffect, useState } from 'react'
import type React from 'react'
import { createPost, deletePost, getPosts } from '../services/postService'
import type { Post } from '../types/post'
import { PostCard } from './PostCard'
import { PostForm } from './PostForm'

export function PostsSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const handleCreate = async (input: { title: string; content: string }) => {
    setIsSubmitting(true)
    setActionError(null)
    try {
      const created = await createPost(input)
      if (search !== '') {
        setSearch('')
      } else {
        setPosts((previousPosts) => [created, ...previousPosts])
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (deletingId !== null) return
    setDeletingId(id)
    setActionError(null)
    try {
      await deletePost(id)
      setPosts((previousPosts) => previousPosts.filter((post) => post.id !== id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError(null)

    const loadPosts = async () => {
      try {
        const result = await getPosts(search, controller.signal)
        if (controller.signal.aborted) return
        setPosts(result)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadPosts()
    return () => controller.abort()
  }, [search])

  return (
    <section className="panel" aria-labelledby="posts-title">
      <span className="eyebrow">TAHAP 2 · TERSIMPAN DI CLOUD</span>
      <h2 id="posts-title">Cerita yang bisa dibagikan</h2>
      <p className="section-description">Post bersama yang tersimpan melalui server.</p>
      <PostForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
      {actionError && <p className="error-message">{actionError}</p>}
      <input
        className="search-input"
        placeholder="Cari judul post..."
        value={search}
        onChange={handleSearchChange}
      />

      {isLoading ? (
        <p className="loading-message">Memuat post...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : posts.length === 0 ? (
        <p className="empty-state">
          {search !== '' ? 'Tidak ada post yang cocok.' : 'Belum ada post.'}
        </p>
      ) : posts.length > 0 ? (
        <div className="card-grid">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              isDeleting={deletingId === post.id}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
