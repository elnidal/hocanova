import { useEffect, useMemo, useState } from 'react'
import { loadIndex, loadAllUnits } from '../content.js'
import { buildQuestionIndex } from '../engine'
import { teacherEnabled, teacherLogin, teacherSession, teacherLogout, loadStudents, loadWords, loadReports, loadClasses, saveClass, createClass, rotateClass, classSecurityReady } from '../teacherApi.js'
import { codeLooksGuessable } from '../classCode.js'
import { status, classSummary, sortStudents, daysSince } from '../teacher.js'
import { plain } from '../components/RichText.jsx'
import Splash from '../components/Splash.jsx'

const ST = { today: ['🟢', 'bugün'], recent: ['🟡', '1–2 gün'], away: ['🔴', '3+ gün yok'], never: ['⚪', 'başlamadı'] }
const KIND = { wrong: 'cevap/açıklama yanlış', unclear: 'anlamadım', other: 'başka' }
const LEVEL = { baslangic: 'Başlangıç', orta: 'Orta', ileri: 'İleri' }

// Öğretmen paneli: adres sonuna #ogretmen. Öğrenci oturumundan ayrı giriş (bkz. teacherApi.js, supabase/teacher.sql).
export default function Teacher() {
  const [phase, setPhase] = useState('check')
  const [err, setErr] = useState('')
  const [data, setData] = useState(null)
  const [group, setGroup] = useState('')
  const [ready, setReady] = useState(false)
  const now = Date.now()

  const load = async ({ quiet } = {}) => {
    if (!quiet) setPhase('loading')
    setErr('')
    try {
      const [students, words, reports, index, classes, secure] = await Promise.all([loadStudents(), loadWords(), loadReports(), loadIndex(), loadClasses(), classSecurityReady()])
      const units = await loadAllUnits(index)
      setData({ students, words, reports, units, classes })
      setReady(secure)
      setPhase('panel')
    } catch (e) { setErr(e.message || String(e)); setPhase('login') }
  }
  useEffect(() => { if (!teacherEnabled) return setPhase('off'); teacherSession().then(s => (s ? load() : setPhase('login'))) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const shown = data
  const items = useMemo(() => shown && Object.fromEntries((shown.units || []).flatMap(u => u.items || []).map(i => [i.id, i])), [shown])
  const questions = useMemo(() => {
    if (!shown?.units?.length) return new Map()
    return new Map([...buildQuestionIndex({ units: shown.units, retention: null }).values()].flat().map(q => [q.id, q]))
  }, [shown])

  if (phase === 'off') return <div className="wrap"><h1>Öğretmen paneli</h1><p>Bu sürümde Supabase bağlantısı yok.</p></div>
  if (phase === 'check' || phase === 'loading') return <Splash text="Panel hazırlanıyor…" />
  if (phase === 'login') return <Login err={err} onLogin={async (e, p) => { try { await teacherLogin(e, p); await load() } catch (x) { setErr(x.message) } }} />

  const groups = [...new Set((shown.students || []).map(s => s.sinif).filter(Boolean))].sort()
  const students = sortStudents((shown.students || []).filter(s => !group || s.sinif === group), now)
  const sum = classSummary(students, now)

  return (
    <div className="wrap teacher">
      <div className="spread"><h1>Öğretmen paneli</h1><button className="btn ghost sm" onClick={async () => { await teacherLogout(); setPhase('login') }}>Çıkış</button></div>
      <div className="row">
        <select className="field" value={group} onChange={e => setGroup(e.target.value)} aria-label="Sınıf">
          <option value="">Tüm sınıflar</option>
          {groups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <button className="btn sm" onClick={load}>Yenile</button>
      </div>

      <section className="card stats">
        <div className="stat"><b>{sum.total}</b><span>öğrenci</span></div>
        <div className="stat"><b>{sum.today}</b><span>bugün çalıştı</span></div>
        <div className="stat"><b className={sum.away ? 'hot' : ''}>{sum.away}</b><span>3+ gündür yok</span></div>
        <div className="stat"><b>{sum.never}</b><span>başlamadı</span></div>
      </section>

      <Classes classes={shown.classes} ready={ready} onCreate={(n, g) => createClass(n, g).then(async r => { await load({ quiet: true }); return r })} onRotate={async code => { const next = await rotateClass(code); await load({ quiet: true }); return next }} onGoal={async (code, name, goal) => { await saveClass(code, name, goal); await load({ quiet: true }) }} />

      <h2>Öğrenciler</h2>
      {students.length === 0 && <p className="muted">Henüz öğrenci verisi yok.</p>}
      {students.map((s, i) => {
        const [dot, label] = ST[status(s, now)], d = daysSince(s.son_islem, now)
        return (
          <section className="card student" key={i}>
            <div className="spread"><b>{dot} {s.takma_ad}{s.sinif ? ` · ${s.sinif}` : ''}</b><span className="muted small">{label}{d > 0 ? ` (${d} gün)` : ''}</span></div>
            <div className="muted small">{LEVEL[s.seviye] || 'test yok'} · {s.biten_ders} ders · {s.cevap} cevap{s.dogru_yuzde != null ? ` · %${s.dogru_yuzde} doğru` : ''}</div>
            <div className="muted small">Son 7 günde {s.gun7} gün çalıştı · bugün {s.bugun} soru · {s.biliniyor} biliyor / {s.kararsiz} kararsız</div>
          </section>
        )
      })}

      <h2>En çok yanlış yapılan ifadeler</h2>
      <section className="card">
        {(shown.words || []).length === 0 && <p className="muted">Henüz yeterli veri yok.</p>}
        {(shown.words || []).slice(0, 20).map(w => (
          <div className="spread wrow" key={w.birim}>
            <span><b lang="en">{items[w.birim]?.display || w.birim}</b> <span className="muted small">{items[w.birim]?.meaning_tr}</span></span>
            <span className="small">%{w.yanlis_yuzde} yanlış <span className="muted">({w.ogrenci} öğr.)</span></span>
          </div>
        ))}
      </section>

      <h2>Sorun bildirimleri</h2>
      {(shown.reports || []).length === 0 && <p className="muted">Bildirim yok (ya da reports.sql henüz çalıştırılmadı).</p>}
      {(shown.reports || []).map((r, i) => {
        const q = questions.get(r.qid)
        return (
          <section className="card" key={i}>
            <div className="spread"><b>{r.qid}</b><span className="chip">{r.adet}× {KIND[r.kind] || r.kind}</span></div>
            {q && <p className="small">{plain(q.prompt, items)}{q.stem ? ` — ${plain(q.stem, items).slice(0, 160)}` : ''}<br /><span className="ok">Doğru: {q.options[q.answer ?? 0]}</span></p>}
            {r.notlar && <p className="muted small">“{r.notlar}”</p>}
          </section>
        )
      })}
    </div>
  )
}

function Login({ err, onLogin }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form className="wrap" onSubmit={async e => { e.preventDefault(); setBusy(true); await onLogin(email, pw); setBusy(false) }}>
      <h1>Öğretmen girişi</h1>
      <p className="muted small">Bu giriş öğrenci uygulamasından ayrıdır; yalnız bu sekmede açık kalır.</p>
      <input className="field" type="email" autoComplete="username" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="field" type="password" autoComplete="current-password" placeholder="Şifre" value={pw} onChange={e => setPw(e.target.value)} />
      {err && <p className="softnote">{err}</p>}
      <button className="btn" disabled={busy || !email || !pw}>Giriş yap</button>
    </form>
  )
}

// Sınıf kodu ve haftalık ortak hedef. Kod sunucuda üretilir (supabase/class_goal_codes.sql).
function Classes({ classes, ready, onCreate, onRotate, onGoal }) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState(1000)
  const [err, setErr] = useState('')
  const [made, setMade] = useState(null)
  if (classes === null) return <><h2>Sınıf hedefi</h2><p className="muted small">Sınıf hedefi için Supabase'de supabase/class_goal.sql bir kez çalıştırılmalı.</p></>
  const create = async e => {
    e.preventDefault()
    if (!name.trim()) return
    setErr(''); setMade(null)
    try { setMade(await onCreate(name.trim(), +goal)); setName('') }
    catch (ex) { setErr(ex.message || String(ex)) }
  }
  const rotate = async code => {
    if (!confirm('Eski kod kapanır. Öğrenciler yeni kodu yazana kadar sınıf hedefini görmez. Devam edilsin mi?')) return
    setErr('')
    try { const next = await onRotate(code); setMade({ code: next, legacy: false }) }
    catch (ex) { setErr(ex.message || String(ex)) }
  }
  return (
    <>
      <h2>Sınıf hedefi</h2>
      <section className="card class-codes">
        <p className="muted small">Sınıfın görünen adı sende kalır. Öğrenciye verdiğin kod tahmin edilmesi zor olsun. 8A gibi kısa kodlar iki okulda çakışır; kodu bilen, ilk 3 takma adı görür. Sonuncu kimseye gösterilmez.</p>
        {!ready && <p className="softnote">Kod güvenliği için supabase/class_goal_codes.sql henüz uygulanmadı. Yeni kod bu cihazda üretilir. Dosya uygulanana kadar liste başka öğretmenlerin sınıflarını da gösterebilir.</p>}
        {classes.map(c => (
          <div className="class-row" key={c.code}>
            <div className="class-main">
              <b>{c.name}</b>
              <span className="class-code">{c.code}</span>
              <span className="muted small">{c.ogrenci} öğrenci · bu hafta {c.bu_hafta} / {c.weekly_goal}</span>
            </div>
            {codeLooksGuessable(c.code) && <p className="softnote">{ready
              ? 'Bu kod kısa veya tahmin edilebilir. Yeni kod verince eskisi kapanır; öğrenciler yeni kodu profillerine yazar. Verilmeden önce kimse kopmaz.'
              : 'Bu kod kısa veya tahmin edilebilir. Yeni koda geçmek için supabase/class_goal_codes.sql uygulanmalı. Uygulanana kadar öğrenciler kopmaz.'}</p>}
            {ready && (
              <div className="row">
                <GoalEdit code={c.code} name={c.name} goal={c.weekly_goal} onGoal={onGoal} />
                <button type="button" className="btn ghost sm" onClick={() => rotate(c.code)}>Yeni kod</button>
              </div>
            )}
          </div>
        ))}
        <form className="row" onSubmit={create}>
          <input className="field" maxLength={40} placeholder="Sınıf adı (ör. 8-A)" value={name} onChange={e => setName(e.target.value)} />
          <input className="field" type="number" min={50} max={100000} step={50} value={goal} onChange={e => setGoal(e.target.value)} aria-label="Haftalık hedef (soru)" />
          <button className="btn sm" disabled={!name.trim()}>Kod oluştur</button>
        </form>
        {made?.code && <p className="class-fresh">Öğrencilere bu kodu ver: <b>{made.code}</b>{made.legacy ? ' Sunucu güncellemesi yok; kod bu cihazda üretildi.' : ''}</p>}
        {err && <p className="softnote">{err}</p>}
      </section>
    </>
  )
}

function GoalEdit({ code, name, goal, onGoal }) {
  const [value, setValue] = useState(goal)
  return (
    <form className="row" onSubmit={e => { e.preventDefault(); onGoal(code, name, +value) }}>
      <input className="field" type="number" min={50} max={100000} step={50} value={value} onChange={e => setValue(e.target.value)} aria-label={`${name} haftalık hedef`} />
      <button className="btn ghost sm">Hedefi kaydet</button>
    </form>
  )
}
