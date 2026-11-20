import assert from 'node:assert/strict'
import { IncomingMessage, ServerResponse, type RequestListener } from 'node:http'
import { Socket } from 'node:net'
import { test } from 'node:test'
import type { PrismaClient } from '../src/generated/prisma/client'
import { createApp } from '../src/app'

const author = { id: 7, name: 'C08', email: 'kelompok.c08@example.test' }
const posts: Array<Record<string, unknown>> = []
let unavailable = false
let nextId = 1
const prisma = {
  $queryRaw: async () => {
    if (unavailable) throw new Error('Sensitive database details must never be sent')
    return [{ value: 1 }]
  },
  user: { findUnique: async () => author },
  post: {
    findMany: async ({ where }: { where: { title?: { contains: string } } }) => {
      if (unavailable) throw new Error('Sensitive database details must never be sent')
      return posts.filter(post => String(post.title).toLowerCase().includes((where.title?.contains || '').toLowerCase())).toReversed()
    },
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const post = { ...data, id: nextId++, author, published: false, views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      posts.push(post)
      return post
    },
    delete: async ({ where }: { where: { id: number } }) => {
      const index = posts.findIndex(post => post.id === where.id)
      if (index === -1) throw { code: 'P2025' }
      return posts.splice(index, 1)[0]
    },
  },
} as unknown as PrismaClient

const app = createApp(prisma)

// Jalankan middleware Express dalam proses tanpa membuka port atau memakai Neon.
function inject(path: string, options: RequestInit = {}): Promise<Response> {
  return new Promise((resolve, reject) => {
    const req = new IncomingMessage(new Socket())
    req.url = path
    req.method = options.method || 'GET'
    const headers = new Headers(options.headers)
    if (options.body) headers.set('content-length', String(Buffer.byteLength(String(options.body))))
    headers.forEach((value, key) => { req.headers[key] = value })
    const res = new ServerResponse(req)
    res.end = ((chunk?: unknown) => {
      const responseHeaders = new Headers()
      for (const [key, value] of Object.entries(res.getHeaders())) {
        if (value !== undefined) responseHeaders.set(key, String(value))
      }
      resolve(new Response(res.statusCode === 204 ? null : String(chunk ?? ''), { status: res.statusCode, headers: responseHeaders }))
      return res
    }) as typeof res.end
    // Express menambahkan properti Request/Response saat middleware berjalan.
    try { (app as unknown as RequestListener)(req, res) } catch (error) { reject(error) }
    if (options.body) req.push(Buffer.from(String(options.body)))
    req.push(null)
  })
}

test('CORS preflight mengizinkan React, JSON, dan DELETE', async () => {
  const response = await inject(`/api/posts`, {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'DELETE', 'Access-Control-Request-Headers': 'content-type' },
  })
  assert.equal(response.status, 204)
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173')
  assert.match(response.headers.get('access-control-allow-methods') || '', /DELETE/)
  assert.match(response.headers.get('access-control-allow-headers') || '', /content-type/)
})

test('alur POST → GET/search → DELETE mengikuti envelope Modul 4', async () => {
  const created = await inject(`/api/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: '  Belajar React  ', content: 'TypeScript' }) })
  assert.equal(created.status, 201)
  const json = await created.json()
  assert.equal(json.status, true)
  assert.equal(json.data.title, 'Belajar React')
  assert.equal(json.data.author.id, 7)
  assert.equal('password' in json.data.author, false)
  const list = await (await inject(`/api/posts?search=REACT`)).json()
  assert.equal(list.data.length, 1)
  assert.equal(list.metadata.totalItems, 1)
  const empty = await (await inject(`/api/posts?search=tidak-ada`)).json()
  assert.deepEqual(empty.data, [])
  const deleted = await inject(`/api/posts/${json.data.id}`, { method: 'DELETE' })
  assert.equal(deleted.status, 200)
  assert.equal((await deleted.json()).data, null)
  assert.deepEqual((await (await inject(`/api/posts`)).json()).data, [])
})

test('judul kosong, tipe content salah, dan ID author salah menghasilkan 400', async () => {
  for (const data of [{ title: ' ' }, { title: 'Valid', content: 42 }, { title: 'Valid', authorId: true }]) {
    const response = await inject(`/api/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    assert.equal(response.status, 400)
    assert.equal((await response.json()).status, false)
  }
})

test('query array dan ID pecahan ditolak', async () => {
  assert.equal((await inject(`/api/posts?search=a&search=b`)).status, 400)
  assert.equal((await inject(`/api/posts/1.5`, { method: 'DELETE' })).status, 400)
})

test('post yang tidak ditemukan menghasilkan 404', async () => {
  const response = await inject(`/api/posts/99999`, { method: 'DELETE' })
  assert.equal(response.status, 404)
  assert.equal((await response.json()).message, 'Post tidak ditemukan')
})

test('JSON rusak menghasilkan 400 dan JSON error', async () => {
  const response = await inject(`/api/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })
  assert.equal(response.status, 400)
  assert.equal((await response.json()).status, false)
})

test('health dan GET yang gagal tidak membocorkan detail database', async () => {
  assert.equal((await inject(`/health`)).status, 200)
  unavailable = true
  try {
    for (const path of ['/health', '/api/posts']) {
      const response = await inject(`${path}`)
      assert.equal(response.status, 503)
      const body = await response.text()
      assert.match(body, /Database belum dapat diakses/)
      assert.doesNotMatch(body, /Sensitive database details/)
    }
  } finally { unavailable = false }
})
