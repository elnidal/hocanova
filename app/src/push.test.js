import test from 'node:test'
import assert from 'node:assert/strict'

test('worker: VAPID başlığı geçerli ES256 imzası taşır', async () => {
  const { sendReminders } = await import('../worker.js')
  assert.equal(typeof sendReminders, 'function')
  const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])
  const jwk = await crypto.subtle.exportKey('jwk', k.privateKey)
  const pub = Buffer.from(await crypto.subtle.exportKey('raw', k.publicKey)).toString('base64url')
  const calls = []
  globalThis.fetch = async (url, opt) => {
    calls.push([String(url), opt])
    if (String(url).includes('/rpc/push_targets')) return new Response(JSON.stringify([{ endpoint: 'https://push.example.com/abc' }, { endpoint: 'https://push.example.com/gone' }]), { status: 200 })
    if (String(url).includes('/rpc/push_prune')) return new Response(null, { status: 204 })
    return new Response('', { status: String(url).endsWith('/gone') ? 410 : 201 })
  }
  const env = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON: 'anon', VAPID_PUBLIC: pub, VAPID_SUBJECT: 'https://lgsingilizce.app', VAPID_PRIVATE_JWK: JSON.stringify(jwk), PUSH_SECRET: 's' }
  const r = await sendReminders(env)
  assert.deepEqual(r, { targets: 2, sent: 1, gone: 1, failed: 0 })
  const push = calls.find(c => c[0] === 'https://push.example.com/abc')[1]
  const m = /^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/.exec(push.headers.Authorization)
  assert.ok(m)
  assert.equal(m[4], pub)
  const claims = JSON.parse(Buffer.from(m[2], 'base64url').toString())
  assert.equal(claims.aud, 'https://push.example.com')
  const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k.publicKey, Buffer.from(m[3], 'base64url'), new TextEncoder().encode(`${m[1]}.${m[2]}`))
  assert.ok(ok, 'imza doğrulanmalı')
  assert.ok(calls.some(c => c[0].includes('/rpc/push_prune') && JSON.parse(c[1].body).p_endpoint.endsWith('/gone')))
})
