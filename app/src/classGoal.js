// Sınıf hedefi kartı: class_week özetinden gösterilecek metinler. Saf fonksiyon, testli.
// İlke: utandırma yok. Başkalarından yalnız ilk 3 görünür; öğrencinin kendi sırası yalnız ilk yarıdaysa yazılır.

/** cw: { name, goal, total, members, top: [{nick, n}], me: {rank, n} } ya da null */
export function classView(cw) {
  if (!cw || !cw.goal) return null
  const pct = Math.min(100, Math.round((cw.total / cw.goal) * 100))
  const left = Math.max(0, cw.goal - cw.total)
  const me = cw.me || { n: 0, rank: null }
  const showRank = me.n > 0 && me.rank && me.rank <= Math.max(3, Math.ceil(cw.members / 2))
  const head = left === 0 ? `Hedef tamam! ${cw.name} bu hafta ${cw.total} soru çözdü 🎉` : `${cw.name}: ${cw.total} / ${cw.goal} soru · hedefe ${left} kaldı`
  const mine = me.n === 0 ? 'Bu hafta henüz soru çözmedin; tek bir ders sınıfa 15–20 soru katar.'
    : showRank ? `Senin katkın ${me.n} soru · sınıfta ${me.rank}. sıradasın.` : `Senin katkın ${me.n} soru. Her soru sınıfı hedefe yaklaştırıyor.`
  return { pct, head, mine, top: (cw.top || []).slice(0, 3) }
}
