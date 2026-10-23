// Paylaşılabilir sonuç kartı (Instagram hikâyesi boyutu 1080x1920): canvas ile çizilir, kişisel bilgi içermez.
const OWL = '<polygon points="22,40 27,14 42,30" fill="#9A6236"/><polygon points="78,40 73,14 58,30" fill="#9A6236"/><ellipse cx="50" cy="60" rx="31" ry="32" fill="#9A6236"/><ellipse cx="50" cy="74" rx="18" ry="15" fill="#F3D9B1"/><path d="M43 72q3 3 6 0M51 72q3 3 6 0M47 80q3 3 6 0" fill="none" stroke="#C9A27A" stroke-width="2" stroke-linecap="round"/><circle cx="38" cy="50" r="11" fill="#fff" stroke="#1B1E3A" stroke-width="3"/><circle cx="62" cy="50" r="11" fill="#fff" stroke="#1B1E3A" stroke-width="3"/><path d="M49 49h2" stroke="#1B1E3A" stroke-width="3" stroke-linecap="round"/><circle cx="39" cy="51" r="4.5" fill="#1B1E3A"/><circle cx="61" cy="51" r="4.5" fill="#1B1E3A"/><circle cx="40.5" cy="49.3" r="1.4" fill="#fff"/><circle cx="62.5" cy="49.3" r="1.4" fill="#fff"/><polygon points="45.5,60 54.5,60 50,67" fill="#FFC93C" stroke="#E0A419" stroke-width="1" stroke-linejoin="round"/>'
const owlImage = () => new Promise((res, rej) => {
  const img = new Image()
  img.onload = () => res(img); img.onerror = rej
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${OWL}</svg>`)
})

/** Kartın metinleri (saf, testli). from/to: yüzde ya da null. */
export function cardText({ kind, title, from, to }) {
  if (kind === 'weekly') return { head: 'Bu haftanın Cuma quiz\'i', big: `%${to}`, sub: '10 soruda başarım', foot: title }
  if (from != null) return { head: `${title} tamam!`, big: `%${from} → %${to}`, sub: to > from ? `${to - from} puan ilerledim` : 'Çalışmaya devam!', foot: 'Ünite giriş testi → çıkış testi' }
  return { head: `${title}`, big: `%${to}`, sub: 'Ünite son testi', foot: '' }
}

function wrap(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = ''
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w } else line = t
  }
  if (line) ctx.fillText(line, x, y)
}

export async function drawCard(opts) {
  const t = cardText(opts)
  try { await document.fonts.load('800 80px "Bricolage Grotesque Variable"') } catch { /* yedek yazı tipi */ }
  const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3B4BD8'); g.addColorStop(1, '#1B1E5A')
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  x.fillStyle = 'rgba(255,255,255,.06)'; for (const [cx, cy, r] of [[900, 300, 260], [120, 1500, 340], [980, 1700, 180]]) { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill() }
  const owl = await owlImage(); x.drawImage(owl, W / 2 - 170, 250, 340, 340)
  x.textAlign = 'center'; x.fillStyle = '#fff'
  const F = '"Bricolage Grotesque Variable","Trebuchet MS",system-ui,sans-serif'
  x.font = `800 74px ${F}`; wrap(x, t.head, W / 2, 760, 900, 88)
  let fs = 190; x.font = `800 ${fs}px ${F}`
  while (x.measureText(t.big).width > 880 && fs > 90) { fs -= 6; x.font = `800 ${fs}px ${F}` } // taşmasın
  x.fillStyle = '#FFC93C'; x.fillText(t.big, W / 2, 1060)
  x.font = `700 62px ${F}`; x.fillStyle = '#fff'; x.fillText(t.sub, W / 2, 1180)
  if (t.foot) { x.font = `600 44px ${F}`; x.fillStyle = 'rgba(255,255,255,.7)'; wrap(x, t.foot, W / 2, 1300, 880, 56) }
  x.font = `800 60px ${F}`; x.fillStyle = '#fff'; x.fillText('HikayEnglish · LGS Kelime Koçu', W / 2, 1690)
  x.font = `600 40px ${F}`; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText('Günde 10 dakika, LGS İngilizce kelimeleri', W / 2, 1760)
  return new Promise(res => c.toBlob(res, 'image/png'))
}

/** Paylaşmaya değer mi? Gerileme ya da düşük sonuç için kart önerilmez. */
export const worthSharing = ({ kind, from, to }) => (kind === 'post' && from != null ? to > from : to >= 50)
