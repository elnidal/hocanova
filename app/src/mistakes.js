// Yanlış defteri: cevap kaydından yanlış yapılan sorular. Saf fonksiyon, testli.

/**
 * Her soru için son yanlış; sonradan aynı soru doğru yapıldıysa ya da kelime "biliyor" olduysa fixed=true.
 * Dönen liste: önce düzelmemişler, sonra en yeni yanlış önce.
 */
export function mistakeList(p) {
  const byQ = new Map()
  for (const e of p.log || []) {
    if (!e.qid || e.kind === 'flash') continue
    const cur = byQ.get(e.qid)
    if (!e.ok) byQ.set(e.qid, { qid: e.qid, itemId: e.id, t: e.t, chosen: e.ch ?? null, fixed: false, n: (cur?.n || 0) + 1 })
    else if (cur) cur.fixed = true
  }
  const out = [...byQ.values()].map(m => ({ ...m, fixed: m.fixed || p.items[m.itemId]?.status === 'known' }))
  return out.sort((a, b) => (a.fixed - b.fixed) || (b.t - a.t))
}

export const openMistakeCount = p => mistakeList(p).filter(m => !m.fixed).length
