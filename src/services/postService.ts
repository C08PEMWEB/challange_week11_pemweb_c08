import type { ApiResponse, CreatePostInput, Post } from '../types/post'

const API_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: options.signal ?? AbortSignal.timeout(15_000),
    })
  } catch (error) {
    // Abort dari cleanup useEffect harus tetap bisa dikenali oleh pemanggil.
    if (options.signal?.aborted) throw error
    throw new Error('Tidak dapat menghubungi server. Pastikan backend berjalan di port 3000.')
  }

  let json: ApiResponse<T>
  try {
    json = await response.json() as ApiResponse<T>
  } catch {
    throw new Error(`Respons server bukan JSON yang valid (HTTP ${response.status}).`)
  }
  if (!response.ok || json.status !== true) {
    throw new Error(json.message || `Permintaan gagal (HTTP ${response.status}).`)
  }
  return json.data
}

// Return langsung Post[], bukan envelope { status, message, data }.
export function getPosts(search = '', signal?: AbortSignal): Promise<Post[]> {
  const query = new URLSearchParams()
  if (search.trim()) query.set('search', search.trim())
  return request<Post[]>(`/posts${query.size ? `?${query}` : ''}`, { signal })
}

export function createPost(input: CreatePostInput): Promise<Post> {
  return request<Post>('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function deletePost(id: number): Promise<void> {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('ID post tidak valid.')
  await request<null>(`/posts/${id}`, { method: 'DELETE' })
}
