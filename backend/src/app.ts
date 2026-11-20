import express from 'express'
import cors from 'cors'
import { createPostRouter } from './controllers/posts'
import { errorHandler } from './middlewares/error'
import type { PrismaClient } from './generated/prisma/client'

// Dependency injection memungkinkan tes API tanpa menulis ke database asli.
export function createApp(prisma: PrismaClient) {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
  app.use(express.json({ limit: '32kb' }))

  app.get('/health', async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: true, message: 'Server dan database OK' })
  })
  app.use('/api/posts', createPostRouter(prisma))
  app.use((_req, res) => {
    res.status(404).json({ status: false, message: 'Endpoint tidak ditemukan' })
  })
  app.use(errorHandler)
  return app
}
