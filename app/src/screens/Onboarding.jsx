import { useState } from 'react'
import NovaAvatar from '../components/NovaAvatar.jsx'
import Logo from '../components/Logo.jsx'

// İlk açılış turu: 3 kısa sayfa. Yalnız ilk girişte (ya da "Turu tekrar izle" ile) gösterilir.
const PAGES = [
  {
    title: 'Selam, ben Hoca Nova!',
    body: 'LGS İngilizce kelime koçunum. 8. sınıfın 10 ünitesindeki kelimeleri ve kalıpları seninle adım adım çalışacağız. Ezber yok: önce görürsün, sonra kullanırsın, sonra sınav sorusunda yakalarsın.',
    list: null,
  },
  {
    title: 'Günde 10 dakika yeter',
    body: 'Her gün aynı küçük rutin:',
    list: [
      ['📘', 'Ders', 'Birkaç yeni ifade, kısa bir hikâye ve sorular.'],
      ['🔁', 'Tekrar', 'Unutmak üzere olduğun ifadeleri tam zamanında sorarım.'],
      ['🎯', 'Hedef', 'Günlük soru hedefin ana ekranda; serini bozma!'],
    ],
  },
  {
    title: 'Yanındaki yardımcılar',
    body: 'Ders dışında da işine yarayacaklar:',
    list: [
      ['🃏', 'Hızlı kart', '2 dakikalık kart turu: otobüste, teneffüste.'],
      ['📒', 'Yanlış defterim', 'Yanlış yaptığın sorular, doğrusu ve nedeni.'],
      ['🧭', 'Sınav Dili', 'LGS soru tiplerinin taktikleri.'],
      ['🗓️', 'Cuma quiz\'i', 'Haftanın ifadelerinden 10 soru.'],
    ],
  },
]

export default function Onboarding({ onDone, last = 'Başlangıç testine geç' }) {
  const [i, setI] = useState(0)
  const p = PAGES[i]
  const end = i === PAGES.length - 1
  return (
    <div className="wrap onboard">
      <div className="spread">
        <span className="onboard-logo"><Logo big /></span>
        {!end && <button className="linkbtn" onClick={onDone}>Atla</button>}
      </div>
      <section className="card onboard-card" key={i}>
        {i === 0 ? <NovaAvatar size={96} /> : <NovaAvatar size={56} />}
        <h1>{p.title}</h1>
        <p>{p.body}</p>
        {p.list && (
          <ul className="onboard-list">
            {p.list.map(([icon, t, d]) => (
              <li key={t}><span className="ob-icon" aria-hidden="true">{icon}</span><span><b>{t}</b><span className="muted small">{d}</span></span></li>
            ))}
          </ul>
        )}
      </section>
      <div className="dots-nav" aria-label={`Sayfa ${i + 1} / ${PAGES.length}`}>
        {PAGES.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}
      </div>
      <div className="row onboard-nav">
        {i > 0 && <button className="btn ghost" onClick={() => setI(i - 1)}>← Geri</button>}
        <button className="btn" onClick={() => (end ? onDone() : setI(i + 1))}>{end ? `${last} →` : 'İleri →'}</button>
      </div>
    </div>
  )
}
