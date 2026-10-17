let voice = null
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
const pick = () => {
  const v = synth?.getVoices?.() || []
  voice = v.find(x => /en-GB/i.test(x.lang)) || v.find(x => /^en/i.test(x.lang)) || null
}
if (synth) { pick(); synth.onvoiceschanged = pick }

export function speak(text) {
  if (!synth) return
  try {
    synth.cancel()
    const u = new SpeechSynthesisUtterance(String(text).replace(/_{3,}/g, 'blank').replace(/[…+]/g, ' '))
    u.lang = 'en-GB'; u.rate = 0.9
    if (voice) u.voice = voice
    synth.speak(u)
  } catch { /* ses desteklenmiyorsa sessiz geç */ }
}
