import { useEffect, useState } from 'react'
import { getPosts } from '../services/postService'
import type { Post } from '../types/post'
import { PostCard } from './PostCard'

export function PostsSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError(null)

    const loadPosts = async () => {
      try {
        const result = await getPosts(undefined, controller.signal)
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
  }, [])

  return (
    <section className="panel" aria-labelledby="posts-title">
      <span className="eyebrow">TAHAP 2 · TERSIMPAN DI CLOUD</span>
      <h2 id="posts-title">Cerita yang bisa dibagikan</h2>
      <p className="section-description">Post bersama yang tersimpan melalui server.</p>

      {isLoading ? (
        <p className="loading-message">Memuat post...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : posts.length === 0 ? (
        <p className="empty-state">Belum ada post.</p>
      ) : posts.length > 0 ? (
        <div className="card-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={() => {}} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
