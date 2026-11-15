/** İlk kullanım: tanıtım turu zorunlu değil. Süre, kaynakta est_minutes varsa gösterilir. */

export function initialLearnerScreen({ hash, placement }) {
  if (hash === '#basla' && !placement) return 'placement'
  return 'home'
}

/** Tur kapanınca seviye yoksa teste, varsa ana ekrana dönülür. */
export function afterTourScreen({ placement }) {
  return placement ? 'home' : 'placement'
}

/** placement.yaml'daki soru sayısı ve tahmini süre. Süre alanı yoksa minutes null. */
export function placementExpectation(def) {
  const questions = (def?.sections || []).reduce((n, s) => n + (Array.isArray(s?.questions) ? s.questions.length : 0), 0)
  const raw = def?.est_minutes
  const minutes = typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? raw : null
  return { questions, minutes }
}

export function placementExpectationLabel(def) {
  const { questions, minutes } = placementExpectation(def)
  if (!questions) return ''
  return minutes == null ? `${questions} soru` : `${questions} soru · yaklaşık ${minutes} dakika`
}
