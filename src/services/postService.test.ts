import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createPost, deletePost, getPosts } from './postService'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

test('getPosts mengirim search yang di-encode dan mengembalikan data saja', async () => {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input))
    assert.equal(url.pathname, '/api/posts')
    assert.equal(url.searchParams.get('search'), 'React & TypeScript')
    return Response.json({ status: true, data: [{ id: 4, title: 'React & TypeScript' }] })
  }
  assert.deepEqual(await getPosts(' React & TypeScript '), [{ id: 4, title: 'React & TypeScript' }])
})

test('getPosts tanpa pencarian tidak mengirim query kosong', async () => {
  globalThis.fetch = async (input) => {
    assert.equal(new URL(String(input)).search, '')
    return Response.json({ status: true, data: [] })
  }
  assert.deepEqual(await getPosts('  '), [])
})

test('createPost mengirim JSON sesuai kontrak backend', async () => {
  globalThis.fetch = async (_input, init) => {
    assert.equal(init?.method, 'POST')
    assert.equal(new Headers(init?.headers).get('Content-Type'), 'application/json')
    assert.deepEqual(JSON.parse(String(init?.body)), { title: 'Baru', content: 'Isi' })
    return Response.json({ status: true, data: { id: 8, title: 'Baru' } }, { status: 201 })
  }
  assert.equal((await createPost({ title: 'Baru', content: 'Isi' })).id, 8)
})

test('deletePost memakai DELETE dan menangani respons sukses tanpa objek post', async () => {
  globalThis.fetch = async (input, init) => {
    assert.equal(new URL(String(input)).pathname, '/api/posts/8')
    assert.equal(init?.method, 'DELETE')
    return Response.json({ status: true, data: null })
  }
  assert.equal(await deletePost(8), undefined)
})

test('pesan backend diteruskan pada HTTP error', async () => {
  globalThis.fetch = async () => Response.json({ status: false, message: 'Post tidak ditemukan' }, { status: 404 })
  await assert.rejects(deletePost(12), /Post tidak ditemukan/)
})

test('server mati menghasilkan pesan yang bisa ditampilkan di UI', async () => {
  globalThis.fetch = async () => { throw new TypeError('fetch failed') }
  await assert.rejects(getPosts(), /Pastikan backend berjalan/)
})

test('cleanup useEffect mempertahankan AbortError', async () => {
  const controller = new AbortController()
  const reason = new DOMException('Dibatalkan', 'AbortError')
  controller.abort(reason)
  globalThis.fetch = async (_input, init) => {
    assert.equal(init?.signal, controller.signal)
    throw reason
  }
  await assert.rejects(getPosts('React', controller.signal), { name: 'AbortError' })
})

test('respons bukan JSON ditolak dengan pesan yang jelas', async () => {
  globalThis.fetch = async () => new Response('<html>Proxy error</html>', { status: 502 })
  await assert.rejects(getPosts(), /bukan JSON/)
})

test('ID delete tidak valid ditolak sebelum fetch', async () => {
  globalThis.fetch = async () => { assert.fail('Tidak boleh memanggil server') }
  await assert.rejects(deletePost(-1), /ID post tidak valid/)
})
