// Bentuk data mengikuti Post + relasi User pada backend Modul 4.
export interface Post {
  id: number
  title: string
  content: string | null
  published: boolean
  views: number
  authorId: number
  author: { id: number; name: string | null; email: string }
  createdAt: string
  updatedAt: string
}

export interface CreatePostInput {
  title: string
  content?: string | null
  // Jika kosong, backend memakai penulis kelompok yang dibuat oleh db:seed.
  authorId?: number
}

export interface ApiResponse<T> {
  status: boolean
  message: string
  data: T
  metadata?: { totalItems: number }
}
