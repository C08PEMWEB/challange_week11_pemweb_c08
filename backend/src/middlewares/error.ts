import type { ErrorRequestHandler } from 'express'
import { HttpError } from '../utils/http-error'

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ status: false, message: error.message })
    return
  }
  if (typeof error === 'object' && error !== null) {
    if ('code' in error && error.code === 'P2025') {
      res.status(404).json({ status: false, message: 'Post tidak ditemukan' })
      return
    }
    if ('code' in error && error.code === 'P2003') {
      res.status(400).json({ status: false, message: 'Penulis tidak valid' })
      return
    }
    if ('status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
      res.status(error.status).json({ status: false, message: 'Request tidak valid. Periksa format dan ukuran JSON.' })
      return
    }
  }
  // Jangan kirim/log error mentah Prisma yang mungkin menyertakan kredensial.
  console.error('Permintaan API gagal. Periksa koneksi dan migrasi database.')
  res.status(503).json({ status: false, message: 'Database belum dapat diakses. Periksa koneksi Neon dan migrasi database.' })
}
