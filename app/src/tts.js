// Konuşma: tarayıcının sesi; en doğal İngilizce sesi seçer, Türkçe etiketleri okumaz.
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|junior|organ|pipe|princess|ralph|trinoids|whisper|zarvox|fred|kathy|superstar|wobble|jester/i
const GOOD = /premium|enhanced|natural|neural|online|google uk english|daniel|serena|kate|martha|arthur|oliver|libby|sonia|ryan|samantha|karen|moira/i

/** Ses puanı: İngiliz aksanı > diğer İngilizce; "premium/neural" gibi kaliteli adlar öne, yenilik sesleri ve "compact" sona. */
export function rankVoice(v) {
  if (!/^en/i.test(v.lang)) return -1
  let s = /en[-_]GB/i.test(v.lang) ? 100 : /en[-_](AU|IE|ZA)/i.test(v.lang) ? 60 : 50
  if (GOOD.test(v.name)) s += 30
  if (/compact/i.test(v.name)) s -= 20
  if (NOVELTY.test(v.name)) s -= 80
  if (v.localService === false) s += 5
  return s
}
export const bestVoice = voices => voices.map(v => [rankVoice(v), v]).filter(([s]) => s >= 0).sort((a, b) => b[0] - a[0])[0]?.[1] || null

// Türkçe dilbilgisi etiketleri ve semboller okunmaz ("Sounds + SIFAT!" → "Sounds")
const TR_TAGS = /\b(SIFAT|FİİL|İSİM|ZARF|ÖZNE|NESNE)\b/g
export const speakable = t => String(t).replace(TR_TAGS, ' ').replace(/_{3,}/g, 'blank').replace(/[…+]/g, ' ').replace(/\s+/g, ' ').trim()

export const canSpeak = Boolean(synth)

let voice = null
const pick = () => { voice = bestVoice(synth?.getVoices?.() || []) }
if (synth) { pick(); synth.onvoiceschanged = pick }

export function speak(text) {
  if (!synth) return
  try {
    if (!voice) pick()
    synth.cancel()
    const u = new SpeechSynthesisUtterance(speakable(text))
    u.lang = voice?.lang || 'en-GB'; u.rate = 0.88
    if (voice) u.voice = voice
    synth.speak(u)
  } catch { /* ses desteklenmiyorsa sessiz geç */ }
}
