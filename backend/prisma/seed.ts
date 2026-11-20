import { randomBytes } from 'node:crypto'
import prisma from '../src/config/prisma'

try {
  // Upsert idempotent: tidak menimpa/menghapus user atau post yang sudah ada.
  const author = await prisma.user.upsert({
    where: { email: 'kelompok.c08@example.test' },
    update: {},
    create: { email: 'kelompok.c08@example.test', name: 'Kelompok C08', password: randomBytes(32).toString('hex') },
  })
  console.log(`Penulis kelompok siap (authorId: ${author.id}).`)
} catch {
  console.error('Seed gagal. Periksa koneksi Neon dan jalankan migrasi terlebih dahulu.')
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
