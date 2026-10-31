// Veli bağlantısı: kod üretimi ve adres işlemleri (saf kısım, testli).
export function makeToken(bytes = globalThis.crypto) {
  const a = new Uint8Array(18)
  bytes.getRandomValues(a)
  return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_') // 24 karakter, adrese uygun
}
export const shareUrl = (origin, token) => `${origin}/#veli=${token}`
/** Yapıştırılan bağlantıdan ya da çıplak koddan kodu çıkarır. */
export const extractToken = text => {
  const s = (text || '').trim()
  const m = /veli=([A-Za-z0-9_-]{20,64})/.exec(s) || /^([A-Za-z0-9_-]{20,64})$/.exec(s)
  return m ? m[1] : null
}
export const parseToken = hash => {
  const m = /^#veli=([A-Za-z0-9_-]{20,64})$/.exec(hash || '')
  return m ? m[1] : null
}

/** Uzak özeti (parent_report çıktısı) rapor motorunun beklediği duruma çevirir. */
export function remoteToState(r) {
  return {
    progress: { items: r.items || {}, log: r.log || [] },
    daily: r.daily || {}, doneDays: r.doneDays || {}, unitQuiz: r.unitQuiz || {}, weekly: r.weekly || {},
    profile: { nick: r.nick || '', group: r.group || '' },
  }
}
