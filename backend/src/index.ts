import 'dotenv/config'
import prisma from './config/prisma'
import { createApp } from './app'

const port = Number(process.env.PORT || 3000)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT harus berupa angka antara 1 sampai 65535.')
}
const server = createApp(prisma).listen(port, () => {
  console.log(`Backend berjalan di http://localhost:${port}`)
})
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Backend gagal dijalankan: port sedang dipakai.'
    : `Backend gagal dijalankan (${error.code || 'UNKNOWN'}). Periksa izin membuka port.`)
  void prisma.$disconnect().finally(() => process.exit(1))
})

let shuttingDown = false
function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  server.close(() => {
    void prisma.$disconnect().then(() => process.exit(0))
  })
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
