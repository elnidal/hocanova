// Sınıf kodu: okunur etiket + tahmin edilmesi zor sonek. 0/O, 1/I/L yok.
// Sunucudaki class_code_prefix / class_code_suffix ile aynı kural (supabase/class_goal_codes.sql).

export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const CODE_SUFFIX_LEN = 4
export const CODE_MAX = 12

export function classLabelPrefix(name) {
  const raw = String(name || '').replace(/[^0-9A-Za-z]/g, '').toUpperCase().slice(0, 4)
  return raw || 'SINIF'
}

export function isSafeSuffix(suffix) {
  const s = String(suffix || '')
  return s.length === CODE_SUFFIX_LEN && [...s].every(c => CODE_ALPHABET.includes(c))
}

/** İsim + güvenli sonek. Sonek uygun değilse null. */
export function classCodeFrom(name, suffix) {
  const s = String(suffix || '').toUpperCase()
  if (!isSafeSuffix(s)) return null
  const code = `${classLabelPrefix(name)}-${s}`
  if (code.length > CODE_MAX || !/^[A-Z0-9-]{3,12}$/.test(code)) return null
  return code
}

/** Kısa (8A) ya da belirsiz karakterli kodlar. İki okul aynı kodu paylaşabilir. */
export function codeLooksGuessable(code) {
  return !/^[A-Z0-9]{1,6}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(String(code || '').toUpperCase())
}

export function randomSuffix(randomUnit = Math.random) {
  let out = ''
  for (let i = 0; i < CODE_SUFFIX_LEN; i++) {
    const n = Math.floor(Number(randomUnit()) * CODE_ALPHABET.length)
    out += CODE_ALPHABET[Math.min(CODE_ALPHABET.length - 1, Math.max(0, n))]
  }
  return out
}

export function makeClassCode(name, randomUnit = Math.random) {
  return classCodeFrom(name, randomSuffix(randomUnit))
}

/** İşlev veritabanında yok. Ağ hatası ve "yetkisiz" bu değildir. */
export function isMissingRpc(error) {
  if (!error) return false
  const code = String(error.code || '')
  const msg = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`
  if (code === 'PGRST202' || code === '42883') return true
  return /could not find the function|schema cache|does not exist/i.test(msg)
}
