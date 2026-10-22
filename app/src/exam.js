// Sınav Dili ek dersi: dersin önerildiği noktaya gelinip gelinmediği (kilit yumuşak: ders yine açılır).
export function examReady(unlock, doneDays = {}, units = []) {
  if (!unlock) return true
  const done = Object.keys(doneDays).filter(k => k.startsWith(`u${unlock.unit}d`))
  if (unlock.day) return done.some(k => Number(k.split('d')[1]) >= unlock.day)
  const total = units.find(u => u.unit === unlock.unit)?.dayCount || Infinity
  return done.length >= total
}

export const MODULES = { A: 'Soru tipleri', B: 'Sınavın işlev dili', C: 'Atölye ve deneme' }

/** Ders sorularını uygulamanın soru biçimine çevirir: context → stem, explain_tr → explain. */
export const examQuestions = lesson => lesson.practice.map(q => ({ ...q, stem: q.context, explain: q.explain_tr }))
