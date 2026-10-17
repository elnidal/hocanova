// Supabase anonim girişi/şifre girişi için Cloudflare Turnstile. İsteğe bağlı: site anahtarı yoksa hiçbir şey yüklenmez.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY
export const captchaEnabled = Boolean(SITE_KEY)

let scriptPromise
const loadScript = () => (scriptPromise ??= new Promise((resolve, reject) => {
  if (window.turnstile) return resolve()
  const s = document.createElement('script')
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  s.async = true
  s.onload = () => resolve()
  s.onerror = () => { scriptPromise = undefined; reject(new Error('Doğrulama (CAPTCHA) yüklenemedi')) }
  document.head.appendChild(s)
}))

/** Tek kullanımlık jeton döndürür; CAPTCHA kapalıysa undefined. Çoğu kişide görünmez çalışır. */
export async function getCaptchaToken() {
  if (!captchaEnabled) return undefined
  await loadScript()
  return new Promise((resolve, reject) => {
    const box = document.createElement('div')
    box.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:50'
    document.body.appendChild(box)
    let id
    const done = fn => value => { try { window.turnstile.remove(id) } catch { /* yoksay */ } box.remove(); fn(value) }
    id = window.turnstile.render(box, {
      sitekey: SITE_KEY,
      appearance: 'interaction-only',
      callback: done(resolve),
      'error-callback': done(() => reject(new Error('Doğrulama (CAPTCHA) başarısız'))),
      'timeout-callback': done(() => reject(new Error('Doğrulama (CAPTCHA) zaman aşımına uğradı'))),
    })
  })
}
