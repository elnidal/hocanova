import { counts, dueCount, newItemsToday, overSoftCap, NEW_ITEMS_SOFT_CAP, retentionState, lessonMinutes } from '../engine'
import Coach from '../components/Coach.jsx'
import { LogoLockup } from '../components/Logo.jsx'
import AccountCard from '../components/AccountCard.jsx'
import { coachMessage, streakOf } from '../goal.js'
import { openMistakeCount } from '../mistakes.js'
import { weeklyDue, pct } from '../quiz.js'
import GoalCard from '../components/GoalCard.jsx'
import ProfileCard from '../components/ProfileCard.jsx'

const LEVEL = { baslangic: 'Başlangıç', orta: 'Orta', ileri: 'İleri' }

export default function Home({ index, unit, state, dispatch, onPlacement, onLesson, onReview, onUnitCheck, onRetention, onWordList, onReport, onFlash, onMistakes, onExam, onQuiz, onTour, account }) {
  const now = Date.now()
  const { progress, placement } = state
  const ids = unit.items.map(i => i.id)
  const c = counts(progress, ids)
  const doneKey = d => `u${unit.unit}d${d.day}`
  const doneN = unit.days.filter(d => state.doneDays[doneKey(d)]).length
  const nextDay = unit.days.find(d => !state.doneDays[doneKey(d)])
  const due = dueCount(progress, now)
  // Giriş kontrolü: veri yalnız bazı ünitelerde var; ünite başlamadan ve bir kez sunulur.
  const newToday = newItemsToday(state.doneDays, now)
  const capped = overSoftCap(state.doneDays, now)
  const retentions = index.retention.unit === unit.unit
    ? index.retention.sections.map(sec => ({ sec, st: retentionState({ section: sec, unit: unit.unit, doneDays: state.doneDays, retentions: state.retentions, progress, now }) }))
    : []
  const levelText = placement ? index.coach.placement_result[placement.level].replace(' {name}', '') : ''
  const streak = streakOf(state.daily, now)
  const uq = state.unitQuiz?.[unit.unit] || {}
  const preAvail = placement && doneN === 0 && !uq.pre && !uq.preSkipped && !uq.post
  const nextUnit = index.units.find(u => u.unit > unit.unit && u.dayCount)
  const weekly = placement && weeklyDue(progress, state.weekly, now)
  const mistakesOpen = openMistakeCount(progress)
  const readyChecks = retentions.filter(r => r.st.status === 'ready')
  const waitChecks = retentions.filter(r => r.st.status !== 'ready' && r.st.status !== 'not-started')
  const coachText = placement
    ? coachMessage({ daily: state.daily, goal: state.goal, due, now, fallback: levelText })
    : 'Hazırsan 4 dakikalık kısa bir testle başlayalım; derslerini seviyene göre ayarlayacağım 🎯'
  const unitsWithDays = index.units.filter(u => u.dayCount)

  return (
    <div className="wrap">
      <div className="spread">
        <LogoLockup />
        {placement && <span className="chip">{streak >= 2 ? `🔥 ${streak} gün · ` : ''}Seviye: {LEVEL[placement.level]}</span>}
      </div>

      <Coach text={coachText} />

      {!placement ? (
        <section className="card today">
          <div className="eyebrow">Bugün</div>
          <h2>Başlangıç testi</h2>
          <p className="muted">18 soru · 4 dk · seviyeni belirler</p>
          <button className="btn" onClick={onPlacement}>Teste başla →</button>
        </section>
      ) : preAvail ? (
        <section className="card today">
          <div className="eyebrow">Önce bir bakalım</div>
          <h2>Ünite {unit.unit} ön testi</h2>
          <p className="muted">10 soru · 3 dk · ünite sonunda gelişmeni bununla karşılaştıracağız</p>
          <div className="row">
            <button className="btn" onClick={() => onQuiz('pre')}>Teste başla →</button>
            <button className="btn ghost" onClick={() => dispatch({ type: 'unitQuiz', unit: unit.unit, phase: 'preSkipped', result: { now: Date.now() } })}>Şimdilik atla</button>
          </div>
        </section>
      ) : nextDay ? (
        <section className="card today">
          <div className="eyebrow">{doneN ? 'Sıradaki ders' : 'İlk ders'} · Gün {nextDay.day}</div>
          <h2 lang="en">{nextDay.new_items.map(id => unit.items.find(i => i.id === id)?.display).filter(Boolean).join(' · ')}</h2>
          <p className="muted">{lessonMinutes(nextDay)} dk · {nextDay.new_items.length} yeni ifade · kart, sahne, alıştırma{due ? ` · ${due} tekrar bekliyor` : ''}</p>
          {capped && <p className="softnote">Bugün {newToday} yeni ifade öğrendin, harika! Yarınki tekrar bunları kalıcı yapar; istersen yine de devam edebilirsin.</p>}
          <button className="btn" onClick={() => onLesson(nextDay.day)}>{capped ? 'Yine de bir ders daha →' : 'Derse başla →'}</button>
        </section>
      ) : (
        uq.post ? (
          <section className="card today growth">
            <div className="eyebrow">Ünite {unit.unit} tamam 🎉</div>
            {uq.pre?.n ? (
              <div className="growth-row">
                <div><b>%{pct(uq.pre)}</b><span>giriş</span></div>
                <span className="growth-arrow" aria-hidden="true">→</span>
                <div className="big-win"><b>%{pct(uq.post)}</b><span>çıkış</span></div>
              </div>
            ) : <h2>Son test: %{pct(uq.post)}</h2>}
            {nextUnit && <button className="btn" onClick={() => dispatch({ type: 'unit', unit: nextUnit.unit })}>Ünite {nextUnit.unit}'e geç →</button>}
          </section>
        ) : (
          <section className="card today">
            <div className="eyebrow">Bu ünitenin dersleri bitti 🎉</div>
            <h2>Ünite {unit.unit} son testi</h2>
            <p className="muted">15 LGS tarzı soru · 8 dk{uq.pre?.n ? ` · girişte %${pct(uq.pre)} yapmıştın` : ''}</p>
            <button className="btn" onClick={() => onQuiz('post')}>Son teste başla →</button>
          </section>
        )
      )}

      {placement && due > 0 && (
        <section className="card slim">
          <div><b>{due} ifade tekrar bekliyor</b><div className="muted small">Bugün en fazla 10 tanesi sorulur.</div></div>
          <button className="btn sm" onClick={onReview}>Tekrar →</button>
        </section>
      )}

      {weekly && (
        <section className="card slim">
          <div><b>Cuma quiz'i hazır 🗓️</b><div className="muted small">Bu haftanın ifadelerinden 10 soru · süreli</div></div>
          <button className="btn sm" onClick={() => onQuiz('weekly')}>Başla →</button>
        </section>
      )}

      {placement && <GoalCard goal={state.goal} daily={state.daily} onChange={goal => dispatch({ type: 'goal', goal })} />}

      {placement && !state.profile?.nick && Object.keys(state.doneDays).length > 0 && <ProfileCard profile={state.profile} onSave={profile => dispatch({ type: 'profile', profile })} />}

      {readyChecks.map(({ sec }) => (
        <section className="card slim" key={sec.id}>
          <div><b>{sec.title}</b><div className="muted small">10 soru · 4 dk · kalıcılığı ölçer</div></div>
          <button className="btn sm" onClick={() => onRetention(sec.id)}>Başla →</button>
        </section>
      ))}

      <details className="card unitpick">
        <summary><b>Ünite {unit.unit} · <span lang="en">{unit.title}</span></b> <span className="muted small">· {doneN}/{unit.days.length} gün · ilerleme ve ünite değiştir</span></summary>
        <div className="chips" role="tablist">
          {unitsWithDays.map(u => (
            <button key={u.unit} role="tab" aria-selected={u.unit === unit.unit} className={`pill${u.unit === unit.unit ? ' on' : ''}`} onClick={() => dispatch({ type: 'unit', unit: u.unit })}>
              Ünite {u.unit} · <span lang="en">{u.title}</span>
            </button>
          ))}
        </div>
        <p className="muted small">{ids.length} ifade (eş anlamlılar tek sayılır)</p>
        <div className="dots">
          <span className="dot known" />şimdilik biliyor {c.known}
          <span className="dot unc" />kararsız {c.unc}
          <span className="dot new" />yeni {c.new}
        </div>
        <div className="stats">
          <div className="stat"><b>{doneN}/{unit.days.length}</b><span>ders günü</span></div>
          <div className="stat"><b>{due}</b><span>bekleyen tekrar</span></div>
        </div>
        {Boolean(uq.pre?.n || uq.post) && <p className="muted small">Ön test: {uq.pre?.n ? `%${pct(uq.pre)}` : '—'} · Son test: {uq.post ? `%${pct(uq.post)}` : 'ünite bitince'}</p>}
        {waitChecks.map(({ sec, st }) => (
          <p className="muted small" key={sec.id}>{sec.title}: {st.status === 'done' ? `tamamlandı · ${st.ok}/${st.n} (%${Math.round(100 * st.ok / st.n)})` : st.status === 'wait' ? `${st.days} gün sonra açılır` : 'önce biraz daha ders gerekiyor'}</p>
        ))}
      </details>

      {placement && Object.values(progress.items).some(it => it.status !== 'new') && (
        <section className="card slim">
          <div><b>Hızlı kart</b><div className="muted small">2 dakikalık kart turu · öğrendiklerin ve zorlandıkların</div></div>
          <button className="btn sm" onClick={() => onFlash()}>Kartlar →</button>
        </section>
      )}

      {placement && Object.keys(state.doneDays).length > 0 && (
        <section className="card slim">
          <div><b>Sınav Dili</b><div className="muted small">LGS soru tipleri ve taktikleri · 24 kısa ders</div></div>
          <button className="btn sm ghost" onClick={onExam}>Aç →</button>
        </section>
      )}

      {placement && mistakesOpen > 0 && (
        <section className="card slim">
          <div><b>Yanlış defterim</b><div className="muted small">{mistakesOpen} soru: doğrusu ve nedeni</div></div>
          <button className="btn sm ghost" onClick={onMistakes}>Aç →</button>
        </section>
      )}

      {placement && <div className="row"><button className="btn ghost" onClick={onWordList}>Kelime listesi (PDF)</button><button className="btn ghost" onClick={onReport}>Veli raporu</button></div>}

      <details className="card unitpick">
        <summary><b>Hesabım</b> <span className="muted small">· takma ad, kayıt, sıfırlama</span></summary>
        {placement && (state.profile?.nick || Object.keys(state.doneDays).length === 0) && <ProfileCard profile={state.profile} onSave={profile => dispatch({ type: 'profile', profile })} />}
        <AccountCard account={account} />
        <button className="linkbtn" onClick={onTour}>Tanıtım turunu tekrar izle</button>
        <button className="linkbtn" onClick={() => { if (confirm('Tüm ilerleme bu cihazdan silinsin mi?')) dispatch({ type: 'reset' }) }}>Verileri sıfırla</button>
      </details>
    </div>
  )
}
