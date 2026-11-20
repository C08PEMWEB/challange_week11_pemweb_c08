import { Router } from 'express'
import type { PrismaClient } from '../generated/prisma/client'
import { HttpError } from '../utils/http-error'
import { parseId } from '../utils/parse'
import { sendSuccess } from '../utils/response'

const authorSelect = { select: { id: true, name: true, email: true } }
const DEFAULT_AUTHOR_EMAIL = 'kelompok.c08@example.test'

export function createPostRouter(prisma: PrismaClient) {
  const router = Router()

  router.get('/', async (req, res) => {
    if (req.query.search !== undefined && typeof req.query.search !== 'string') {
      throw new HttpError(400, 'Search harus berupa teks')
    }
    const search = (req.query.search || '').trim()
    if (search.length > 200) throw new HttpError(400, 'Pencarian maksimal 200 karakter')
    const posts = await prisma.post.findMany({
      where: search ? { title: { contains: search, mode: 'insensitive' } } : {},
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { author: authorSelect },
    })
    sendSuccess(res, 200, 'Berhasil mengambil data posts', posts, { totalItems: posts.length })
  })

  router.post('/', async (req, res) => {
    const { title, content, authorId } = req.body ?? {}
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
      throw new HttpError(400, 'Judul wajib diisi dan maksimal 200 karakter')
    }
    if (content !== undefined && content !== null && (typeof content !== 'string' || content.length > 10000)) {
      throw new HttpError(400, 'Isi post harus berupa teks maksimal 10000 karakter')
    }
    // Tetap mendukung authorId dari Modul 4. Tanpa authorId, gunakan akun seed.
    const author = await prisma.user.findUnique({
      where: authorId !== undefined ? { id: parseId(authorId) } : { email: DEFAULT_AUTHOR_EMAIL },
    })
    if (!author) {
      throw new HttpError(400, authorId !== undefined ? 'Penulis tidak ditemukan' : 'Penulis kelompok belum tersedia. Jalankan npm run db:seed.')
    }
    const post = await prisma.post.create({
      data: { title: title.trim(), content: typeof content === 'string' ? content.trim() : null, authorId: author.id },
      include: { author: authorSelect },
    })
    sendSuccess(res, 201, 'Post berhasil dibuat', post)
  })

  router.delete('/:id', async (req, res) => {
    await prisma.post.delete({ where: { id: parseId(req.params.id) } })
    sendSuccess(res, 200, 'Post berhasil dihapus', null)
  })
  return router
}
