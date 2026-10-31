// Adres taşıma (hocanova.netlify.app → lgsingilizce.app): eski adresteki tarayıcı verisi (ilerleme + Supabase oturumu)
// URL'nin # kısmında yeni adrese taşınır. # sunucuya gitmez. Eski adresteki taşıma sayfası: migrate/index.html (aynı biçim).

export const PREFIX = '#tasi='
const APP_KEY = 'hikayenglish.lgs.app.v1'

const toB64u = bytes => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }
const fromB64u = str => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer())

/** { data: {anahtar: değer}, hash: '#ogretmen' } → 'g…' (gzip) ya da 'r…' (sıkıştırmasız) */
export async function encode(payload) {
  const raw = new TextEncoder().encode(JSON.stringify(payload))
  if (typeof CompressionStream === 'function') return 'g' + toB64u(await pipe(raw, new CompressionStream('gzip')))
  return 'r' + toB64u(raw)
}

export async function decode(str) {
  const bytes = fromB64u(str.slice(1))
  const raw = str[0] === 'g' ? await pipe(bytes, new DecompressionStream('gzip')) : bytes
  return JSON.parse(new TextDecoder().decode(raw))
}

const savedAt = v => { try { return JSON.parse(v)?.savedAt || 0 } catch { return 0 } }

/** Gelen veri yazılmalı mı? Bu cihazda bu adreste hiç ilerleme yoksa ya da gelen daha yeniyse. */
export function shouldApply(incoming, current) {
  if (!incoming?.[APP_KEY]) return false
  return current == null || savedAt(incoming[APP_KEY]) > savedAt(current)
}

/** Açılışta: #tasi= varsa veriyi yazar ve özgün # ile sayfayı yeniden açar. true dönerse uygulama başlatılmaz. */
export async function applyMigration(loc = location, storage = localStorage) {
  if (!loc.hash.startsWith(PREFIX)) return false
  let target = loc.pathname + loc.search
  try {
    const { data = {}, hash = '' } = await decode(loc.hash.slice(PREFIX.length))
    if (shouldApply(data, storage.getItem(APP_KEY))) for (const [k, v] of Object.entries(data)) storage.setItem(k, v)
    target += hash
  } catch { /* bozuk veri: uygulamayı normal aç */ }
  loc.replace(target)
  // Yalnız # değişirse tarayıcı sayfayı yeniden yüklemez; veriyle temiz açılış için yeniden yükle
  if (loc.reload && target.includes('#')) loc.reload()
  return true
}
