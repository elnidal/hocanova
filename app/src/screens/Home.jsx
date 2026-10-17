import { counts, dueCount } from '../engine'
import Coach from '../components/Coach.jsx'
import Logo from '../components/Logo.jsx'
import AccountCard from '../components/AccountCard.jsx'

const LEVEL = { baslangic: 'Başlangıç', orta: 'Orta', ileri: 'İleri' }

export default function Home({ index, unit, state, dispatch, onPlacement, onLesson, onReview, onUnitCheck, account }) {
  const now = Date.now()
  const { progress, placement } = state
  const ids = unit.items.map(i => i.id)
  const c = counts(progress, ids)
  const doneKey = d => `u${unit.unit}d${d.day}`
  const doneN = unit.days.filter(d => state.doneDays[doneKey(d)]).length
  const nextDay = unit.days.find(d => !state.doneDays[doneKey(d)])
  const due = dueCount(progress, now)
  // Giriş kontrolü: veri yalnız bazı ünitelerde var; ünite başlamadan ve bir kez sunulur.
  const checkAvail = placement && index.unit_check.unit === unit.unit && !state.unitChecks?.[unit.unit] && doneN === 0
  const coachText = placement
    ? index.coach.placement_result[placement.level].replace(' {name}', '')
    : 'Selam! Ben Hoca Nova, koçunum. Önce 4 dakikalık kısa bir testle seni tanıyayım; sonra Ece\'nin partisine gidiyoruz 🎈'
  const unitsWithDays = index.units.filter(u => u.dayCount)

  return (
    <div className="wrap">
      <div className="spread">
        <div><div className="eyebrow"><Logo /> · LGS</div><h1>Kelime Koçu</h1></div>
        {placement && <span className="chip">Seviye: {LEVEL[placement.level]}</span>}
      </div>

      <Coach text={coachText} />

      {!placement ? (
        <section className="card today">
          <div className="eyebrow">Bugün</div>
          <h2>Başlangıç testi</h2>
          <p className="muted">18 soru · 4 dk · seviyeni belirler</p>
          <button className="btn" onClick={onPlacement}>Teste başla →</button>
        </section>
      ) : checkAvail ? (
        <section className="card today">
          <div className="eyebrow">Önce bir bakalım</div>
          <h2>Ünite {unit.unit} giriş kontrolü</h2>
          <p className="muted">2 dk · bildiğin ifadeleri işaretle, bilmediklerini dersler öğretsin</p>
          <div className="row">
            <button className="btn" onClick={onUnitCheck}>Kontrole başla →</button>
            <button className="btn ghost" onClick={() => dispatch({ type: 'skipUnitCheck', unit: unit.unit, now: Date.now() })}>Şimdilik atla</button>
          </div>
        </section>
      ) : nextDay ? (
        <section className="card today">
          <div className="eyebrow">Bugünün dersi · Gün {nextDay.day}</div>
          <h2>{nextDay.title}</h2>
          <p className="muted">{nextDay.est_minutes} dk · {nextDay.new_items.length} yeni ifade{due ? ` · ${due} tekrar bekliyor` : ''}</p>
          <button className="btn" onClick={() => onLesson(nextDay.day)}>Derse başla →</button>
        </section>
      ) : (
        <section className="card today"><h2>Bu ünitenin dersleri bitti 🎉</h2></section>
      )}

      {placement && due > 0 && (
        <section className="card today">
          <div className="eyebrow">Tekrar</div>
          <h3>{due} ifade tekrar bekliyor</h3>
          <p className="muted small">Bugün en fazla 10 tanesi sorulur; geciken ve yanlış yapılanlar önce.</p>
          <button className="btn ghost" onClick={onReview}>Tekrara başla →</button>
        </section>
      )}

      <div className="chips" role="tablist">
        {unitsWithDays.map(u => (
          <button key={u.unit} role="tab" aria-selected={u.unit === unit.unit} className={`pill${u.unit === unit.unit ? ' on' : ''}`} onClick={() => dispatch({ type: 'unit', unit: u.unit })}>
            Ünite {u.unit} · {u.title}
          </button>
        ))}
      </div>

      <section className="card">
        <div className="eyebrow">Ünite {unit.unit} · {unit.title}</div>
        <h3>{ids.length} öğretim birimi</h3>
        <p className="muted small">Birim = bir kelime ya da kalıp (eş anlamlılar tek sayılır).</p>
        <div className="dots">
          <span className="dot known" />şimdilik biliyor {c.known}
          <span className="dot unc" />kararsız {c.unc}
          <span className="dot new" />yeni {c.new}
        </div>
        <div className="stats">
          <div className="stat"><b>{doneN}/{unit.days.length}</b><span>ders günü</span></div>
          <div className="stat"><b>{due}</b><span>bekleyen tekrar</span></div>
        </div>
      </section>

      <AccountCard account={account} />

      <button className="linkbtn" onClick={() => { if (confirm('Tüm ilerleme bu cihazdan silinsin mi?')) dispatch({ type: 'reset' }) }}>Verileri sıfırla</button>
    </div>
  )
}
