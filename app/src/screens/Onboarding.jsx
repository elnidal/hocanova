import { useState } from 'react'
import NovaAvatar from '../components/NovaAvatar.jsx'
import Logo from '../components/Logo.jsx'
import { daysToLgs } from '../coachPlan.js'

// İlk açılış turu: 3 kısa sayfa (tanıtım, günlük rutin, sınava doğru). Yalnız ilk girişte (ya da "Turu tekrar izle" ile) gösterilir.
const PAGES = [
  {
    title: 'Hoca Nova: yeni nesil İngilizce koçun',
    body: 'Sıfırdan başlıyor olsan da sorun yok. LGS İngilizcesini ezberle değil, planla halledeceğiz: 8. sınıfın 10 ünitesi, adım adım, seninle birlikte.',
    countdown: true,
    list: [
      ['🧭', 'Seviyeni ölçerim', '4 dakikalık testle nereden başlayacağını bulurum.'],
      ['🗺️', 'Planı ben yaparım', 'Ana ekranda her gün ne yapacağını sırayla söylerim.'],
      ['📈', 'Netini takip ederim', 'Mini LGS ile netini görür, puan kaybettiğin üniteyi tamir ederiz.'],
    ],
  },
  {
    title: 'Günde 10–15 dakika yeter',
    body: 'Her gün aynı küçük rutin:',
    list: [
      ['🔁', 'Tekrar', 'Unutmak üzere olduğun ifadeleri tam zamanında sorarım.'],
      ['📘', 'Ders', 'Önce görürsün, sonra kullanırsın, sonra LGS sorusunda yakalarsın.'],
      ['🎯', 'Hedef', 'Günlük soru hedefin ana ekranda; serini bozma!'],
    ],
  },
  {
    title: 'Sınava doğru',
    body: 'Haftada bir kendini sınarız, eksikleri kapatırız:',
    list: [
      ['📝', 'Mini LGS', '10 soru, 15 dakika: gerçek sınav gibi, sonunda netin.'],
      ['🔧', 'Tamir seti', 'Denemede kaybettiğin ünitelerden 5\'er soru.'],
      ['🧭', 'Sınav Dili', 'LGS soru tiplerinin taktikleri.'],
      ['🃏', 'Hızlı kart', '2 dakikalık kart turu: otobüste, teneffüste.'],
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
        {p.countdown && <span className="chip">LGS'ye {daysToLgs(Date.now())} gün</span>}
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
      <p className="rolelinks small"><a className="linkbtn" href="#giris">Öğretmen ya da veli misiniz? Buradan girin →</a></p>
    </div>
  )
}
