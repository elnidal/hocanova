// Görsel okuma: tablo, grafik, afiş ve not köklerini düz metinden çizilebilir bir yapıya çevirir. Saf fonksiyon, testli.
// İçerik değişmez; yalnız uygun soru köklerine uygulanır, gerisi eskisi gibi metin olarak kalır.

const VISUAL_PROMPT = /\b(note|poster|brochure|leaflet|menu|chart|table|timetable|advert|notice|list|memo|forecast|survey|price list|rules|card|programme|schedule|results?)\b/i
const NUM = /^(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(%|percent|students?|points?|minutes?|min)?$/i

const clean = s => String(s ?? '').replace(/<\/?(en|u)>/g, '')

/** Uygun mu? Boşluklu, ifade belirteçli ya da diyalog tamamlama kökleri görsel olmaz. */
export function visualEligible(q) {
  if (!q?.stem || q.type === 'dialogue_complete' || q.listen) return false
  const s = clean(q.stem)
  if (/_{3,}|\{U\d+-\d+/.test(s)) return false
  if (!s.includes('\n')) return false
  return q.type === 'table_graph' || ['S03', 'S06', 'S08'].includes(q.stem_id) || VISUAL_PROMPT.test(clean(q.prompt))
}

const isTitle = l => !/:\s/.test(l) || l === l.toUpperCase() || /\?/.test(l) || /^[^:]+\s[–-]\s[^:]+$/.test(l)

/** null ya da { kind: 'grid'|'checks'|'chart'|'card', title?, ... } */
export function parseVisual(q) {
  if (!visualEligible(q)) return null
  let lines = clean(q.stem).split('\n').map(l => l.trim()).filter(Boolean).map(l => l.replace(/\s*…+\s*/g, ': '))
  // Hizalı tablo: her satır 2+ boşlukla aynı sayıda sütuna bölünür
  const cols = lines.map(l => l.split(/\s{2,}/))
  if (cols.length >= 3 && cols[0].length >= 3 && cols.every(c => c.length === cols[0].length)) return { kind: 'grid', head: cols[0], rows: cols.slice(1) }

  let title = null
  if (lines.length > 2 && isTitle(lines[0])) { title = lines[0]; lines = lines.slice(1) }
  const kv = lines.map(l => { const m = /^([^:·]{1,40}):\s+(.+)$/.exec(l); return m ? [m[1], m[2]] : null })

  // ✓/✗ çizelgesi: "İş: Ad ✓ · Ad ✗"
  if (kv.every(Boolean) && kv.every(([, v]) => /[✓✗]/.test(v) && v.includes('·'))) {
    const rows = kv.map(([k, v]) => [k, v.split('·').map(c => c.trim()).map(c => [c.replace(/\s*[✓✗]\s*$/, ''), c.trim().endsWith('✓')])])
    const names = rows[0][1].map(([n]) => n)
    if (rows.every(r => r[1].length === names.length)) return { kind: 'checks', title, names, rows: rows.map(([k, c]) => [k, c.map(x => x[1])]) }
  }

  // Grafik: en az 3 "Etiket: sayı birim" satırı, hepsi aynı birimde
  if (kv.length >= 3 && kv.every(Boolean)) {
    const nums = kv.map(([, v]) => NUM.exec(v))
    const unit = nums[0]?.[2]?.toLowerCase().replace(/s$/, '') || ''
    if (nums.every(n => n && (n[2]?.toLowerCase().replace(/s$/, '') || '') === unit)) {
      const bars = kv.map(([k, v], i) => ({ label: k, value: +nums[i][1].replace(/,/g, ''), text: v }))
      return { kind: 'chart', title, bars, max: Math.max(...bars.map(b => b.value)) || 1 }
    }
  }

  // Afiş / not / liste: anahtar–değer satırları ve düz satırlar
  return { kind: 'card', title, rows: lines.map((l, i) => (kv[i] ? { k: kv[i][0], v: kv[i][1] } : { t: l })) }
}
