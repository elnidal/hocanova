// Öğretmen paneli: saf yardımcılar (testli).
const DAY = 864e5

/** Son işlemden bu yana geçen tam gün (bilinmiyorsa null). */
export const daysSince = (iso, now) => (iso ? Math.max(0, Math.floor((now - new Date(iso).getTime()) / DAY)) : null)

/** today: bugün çalıştı · recent: 1–2 gün · away: 3+ gün · never: hiç ders/cevap yok */
export function status(s, now) {
  if (!s.cevap) return 'never'
  const d = daysSince(s.son_islem, now)
  return d == null ? 'never' : d === 0 ? 'today' : d <= 2 ? 'recent' : 'away'
}

export function classSummary(students, now) {
  const by = { today: 0, recent: 0, away: 0, never: 0 }
  for (const s of students) by[status(s, now)]++
  return { total: students.length, ...by }
}

/** Öğrenciler: önce "uzak" olanlar (dikkat gerekenler), sonra en son çalışan. */
export function sortStudents(students, now) {
  const rank = { away: 0, never: 1, recent: 2, today: 3 }
  return [...students].sort((a, b) => rank[status(a, now)] - rank[status(b, now)] || (b.son_islem || '').localeCompare(a.son_islem || ''))
}
