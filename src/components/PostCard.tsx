import type { Post } from '../types/post'

interface PostCardProps {
  post: Post
  onDelete: (id: number) => void
  isDeleting?: boolean
}

export function PostCard({ post, onDelete, isDeleting = false }: PostCardProps) {
  return (
    <article className="card">
      <h3>{post.title}</h3>
      <p>{post.content ?? 'Tanpa isi'}</p>
      <p>Penulis: {post.author.name ?? 'Anonim'}</p>
      <span className="badge">{post.published ? 'Terbit' : 'Draft'}</span>
      <p>Views: {post.views}</p>
      <p>{new Date(post.createdAt).toLocaleDateString('id-ID')}</p>
      <button
        className="button button-danger"
        disabled={isDeleting}
        onClick={() => onDelete(post.id)}
      >
        {isDeleting ? 'Menghapus...' : 'Hapus'}
      </button>
    </article>
  )
}
