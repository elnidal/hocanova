// İlk 7 gün yolculuğu: yeni öğrenciye sırayla 7 küçük görev. Alışkanlık en çok ilk haftada kopar; her görev
// uygulamanın bir parçasını tanıtır. Saf fonksiyon, testli. Görevler durumdan okunur, ayrıca kayıt tutulmaz.
import { streakOf } from './goal.js'

const DAY_MS = 864e5
export const JOURNEY_DAYS = 14 // başlangıç testinden sonra en fazla 14 gün görünür
export const PLEDGES = [3, 5, 7]

/** null ya da { steps, doneN, next, pledge } */
export function firstWeek(state, now) {
  const p = state.placement
  if (!p?.at || now - p.at > JOURNEY_DAYS * DAY_MS) return null
  const lessons = Object.keys(state.doneDays || {}).length
  const flash = (state.progress?.log || []).some(e => e.kind === 'flash')
  const steps = [
    { key: 'pledge', action: 'pledge', title: 'Haftalık sözünü ver', note: 'Haftada kaç ders? Söz verdiğin hedefi tutmak daha kolay.', done: Boolean(state.pledge) },
    { key: 'lesson1', action: 'lesson', title: 'İlk dersini bitir', note: 'Kart, kısa sahne, birkaç soru: yaklaşık 8 dakika.', done: lessons >= 1 },
    { key: 'chain2', action: 'lesson', title: 'Zincire ikinci halkayı tak', note: 'Ertesi gün tekrar gel; iki gün üst üste çalışmak alışkanlığın başlangıcı.', done: streakOf(state.daily || {}, now) >= 2 || Object.values(state.daily || {}).filter(n => n > 0).length >= 2 },
    { key: 'flash', action: 'flash', title: 'Hızlı kart turu', note: '2 dakikada öğrendiğin ifadelere göz at.', done: flash },
    { key: 'exam', action: 'exam', title: 'Sınav Dili: ilk ders', note: 'LGS soru köklerini tanı: "NOT mentioned" ne demek?', done: Object.keys(state.examDone || {}).length >= 1 },
    { key: 'lesson3', action: 'lesson', title: 'Üçüncü dersini bitir', note: 'Üç dersten sonra haftalık Mini LGS açılıyor.', done: lessons >= 3 },
    { key: 'mini', action: 'mini', title: 'İlk Mini LGS: netini gör', note: '10 soru, 15 dakika. Bundan sonra her hafta netini takip ederiz.', done: (state.miniLgs || []).length >= 1 },
  ]
  const doneN = steps.filter(s => s.done).length
  if (doneN === steps.length) return null
  return { steps, doneN, next: steps.find(s => !s.done), pledge: state.pledge?.perWeek || null }
}
