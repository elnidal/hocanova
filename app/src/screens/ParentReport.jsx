import { useEffect, useState } from 'react'
import { loadAllUnits } from '../content.js'
import Splash from '../components/Splash.jsx'
import { pct } from '../quiz.js'
import { buildReport } from '../report.js'

const WD = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

// Veli raporu: tek sayfa, yazdırılabilir / PDF. Veri yalnız bu cihazdaki ilerlemeden hesaplanır.
export default function ParentReport({ index, state, onExit }) {
  const [items, setItems] = useState(null)
  useEffect(() => { loadAllUnits(index).then(us => setItems(us.flatMap(u => u.items))) }, [index])
  if (!items) return <Splash text="Rapor hazırlanıyor…" />
  const r = buildReport({ progress: state.progress, daily: state.daily, doneDays: state.doneDays, items, now: Date.now() })
  const max = Math.max(1, ...r.week.map(d => d.n))
  const nick = state.profile?.nick || 'Öğrenci'

  return (
    <div className="wrap parent">
      <div className="noprint wl-head">
        <button className="btn ghost sm" onClick={onExit}>← Geri</button>
        <h1>Veli raporu</h1>
        <p className="muted">Bu cihazdaki ilerlemeden hazırlanır. PDF olarak kaydedip veliyle paylaşabilirsin.</p>
        <button className="btn" onClick={() => window.print()}>PDF olarak kaydet / yazdır</button>
      </div>
      <article className="card printable report-body">
        <div className="eyebrow"><span lang="en">HikayEnglish</span> · LGS Kelime Koçu · Veli raporu</div>
        <h1>{nick}{state.profile?.group ? ` · ${state.profile.group}` : ''}</h1>
        <p className="muted small">Tarih: {r.date} · Son 7 günün özeti</p>

        <div className="stats">
          <div className="stat"><b>{r.activeDays}/7</b><span>çalışılan gün</span></div>
          <div className="stat"><b>{r.weekTotal}</b><span>çözülen soru</span></div>
          <div className="stat"><b>{r.accuracy == null ? '—' : `%${r.accuracy}`}</b><span>doğru oranı</span></div>
          <div className="stat"><b>{r.streak}</b><span>gün seri</span></div>
        </div>

        <h3>Günlük çalışma</h3>
        <div className="week">
          {r.week.map(d => (
            <div key={d.stamp} className="wday">
              <div className="wbar"><i style={{ height: `${(d.n / max) * 100}%` }} /></div>
              <b>{d.n}</b><span>{WD[d.wd]}</span>
            </div>
          ))}
        </div>

        <h3>Kelime durumu</h3>
        <p>{r.total} ifadenin <b>{r.state.known}</b> tanesi kalıcı öğrenildi, <b>{r.state.unc}</b> tanesi pekişiyor, <b>{r.state.new}</b> tanesi henüz başlanmadı. Tamamlanan ders günü: <b>{r.lessonsDone}</b>.</p>

        {Object.keys(state.unitQuiz || {}).length > 0 && <>
          <h3>Ünite testleri</h3>
          <ul>{Object.entries(state.unitQuiz).filter(([, q]) => q.pre?.n || q.post).map(([u, q]) => (
            <li key={u}>Ünite {u}: giriş {q.pre?.n ? `%${pct(q.pre)}` : '—'} → çıkış {q.post ? <b>%{pct(q.post)}</b> : 'ünite sürüyor'}</li>
          ))}</ul>
        </>}
        {Object.keys(state.weekly || {}).length > 0 && <p>Cuma quiz'leri: {Object.entries(state.weekly).slice(-4).map(([k, r]) => `${k.slice(5).split('-').reverse().join('.')} haftası %${pct(r)}`).join(' · ')}</p>}

        <h3>Zorlandığı ifadeler</h3>
        {r.hardest.length ? (
          <ul>{r.hardest.map(h => <li key={h.display}><b lang="en">{h.display}</b> — {h.meaning} <span className="muted small">({h.wrong} yanlış)</span></li>)}</ul>
        ) : <p className="muted">Şimdilik belirgin bir zorlanma yok.</p>}

        <h3>Veli için öneri</h3>
        <p>{r.activeDays >= 5 ? 'Düzenli çalışıyor; tebrik etmeniz yeterli.' : 'Günde 10 dakika, hafta içi her gün hedefi yeterli. Çalışma saatini sabitlemek en çok işe yarar.'} Zorlandığı ifadeleri birlikte sesli okumak da faydalıdır.</p>
        <p className="muted small">Bu rapor öğrencinin çalışma özetidir; resmî bir değerlendirme değildir.</p>
      </article>
    </div>
  )
}
