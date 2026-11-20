// lgsingilizce.app sunucusu: statik dosyaları Cloudflare verir; bu dosya yalnız akşam hatırlatmasını gönderir.
// Cron: her gün 17.00 UTC = 20.00 İstanbul (wrangler.jsonc → triggers). Bildirim içerik taşımaz (boş push);
// metni telefondaki public/push-sw.js yazar. Gizli değerler: VAPID_PRIVATE_JWK, PUSH_SECRET (wrangler secret).

const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const enc = s => new TextEncoder().encode(s)

async function vapidHeader(endpoint, env, key) {
  const aud = new URL(endpoint).origin
  const head = b64u(enc(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const body = b64u(enc(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT })))
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc(`${head}.${body}`))
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${env.VAPID_PUBLIC}`
}

async function rpc(env, fn, args) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_ANON, Authorization: `Bearer ${env.SUPABASE_ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`${fn}: ${r.status} ${await r.text()}`)
  return r.status === 204 ? null : r.json()
}

export async function sendReminders(env, all = false) {
  const key = await crypto.subtle.importKey('jwk', JSON.parse(env.VAPID_PRIVATE_JWK), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const targets = await rpc(env, 'push_targets', { p_secret: env.PUSH_SECRET, p_all: all })
  let sent = 0, gone = 0, failed = 0
  for (const { endpoint } of targets) {
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { Authorization: await vapidHeader(endpoint, env, key), TTL: '10800', Urgency: 'normal', 'Content-Length': '0' } })
      if (r.status === 404 || r.status === 410) { gone++; await rpc(env, 'push_prune', { p_secret: env.PUSH_SECRET, p_endpoint: endpoint }) }
      else if (r.ok) sent++
      else failed++
    } catch { failed++ }
  }
  return { targets: targets.length, sent, gone, failed }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    // Deneme gönderimi: yalnız gizli anahtarı bilen çağırabilir (POST /api/push-test, Authorization: Bearer <PUSH_SECRET>)
    if (url.pathname === '/api/push-test') {
      if (req.method !== 'POST' || req.headers.get('Authorization') !== `Bearer ${env.PUSH_SECRET}`) return new Response('yetkisiz', { status: 401 })
      return Response.json(await sendReminders(env, url.searchParams.get('all') === '1'))
    }
    return env.ASSETS.fetch(req)
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendReminders(env).then(r => console.log('hatırlatma', JSON.stringify(r))))
  },
}
