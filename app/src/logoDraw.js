// HikayEnglish logosunu canvas'a çizer (paylaşım kartı ve marka dosyaları için). Arayüzdeki Logo.jsx ile aynı renk mantığı.
import { OWL, OWL_DEFS } from './owlArt.js'

export const FONT = '"Bricolage Grotesque Variable","Trebuchet MS",system-ui,sans-serif'
export const LIGHT = { a: '#1B1E3A', e: '#F0614A', c: '#3B4BD8' }   // açık zemin
export const DARK = { a: '#FFFFFF', e: '#FF8A75', c: '#A9B3FF' }    // koyu zemin

const PARTS = [['Hikay', 'a', 1], ['E', 'e', 1.12], ['nglish', 'c', 1]]

function star(ctx, cx, cy, r, color) {
  ctx.fillStyle = color; ctx.beginPath()
  const pts = [[0, -1], [.2, -.2], [1, 0], [.2, .2], [0, 1], [-.2, .2], [-1, 0], [-.2, -.2]]
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * r, cy + y * r) : ctx.moveTo(cx + x * r, cy + y * r)))
  ctx.closePath(); ctx.fill()
}

/** Yazı logosu: (x, y) taban çizgisi; align 'left' | 'center'. Genişliği döndürür. */
export function drawWordmark(ctx, x, y, size, colors = LIGHT, align = 'left') {
  const widths = PARTS.map(([t, , k]) => { ctx.font = `800 ${size * k}px ${FONT}`; return ctx.measureText(t).width })
  const total = widths.reduce((a, b) => a + b, 0)
  let cx = align === 'center' ? x - total / 2 : x
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  PARTS.forEach(([t, key, k], i) => {
    ctx.font = `800 ${size * k}px ${FONT}`; ctx.fillStyle = colors[key]; ctx.fillText(t, cx, y)
    if (key === 'e') star(ctx, cx + widths[i] + size * 0.02, y - size * 0.82, size * 0.2, '#FFC93C')
    cx += widths[i]
  })
  return total
}

const tileSvg = (rounded, scale = 1) => {
  const t = ((1 - scale) * 50).toFixed(1)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${OWL_DEFS}<rect width="100" height="100" ${rounded ? 'rx="24"' : ''} fill="url(#novaBg)"/><g transform="translate(${t} ${t}) scale(${scale})">${OWL}</g></svg>`
}
/** Baykuş kutusu (degrade zeminli); rounded=false: tam kare (profil fotoğrafı için). */
export const owlTile = (rounded = true, scale = 1) => new Promise((res, rej) => {
  const img = new Image(); img.onload = () => res(img); img.onerror = rej
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(tileSvg(rounded, scale))
})
