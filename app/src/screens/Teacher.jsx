import { useEffect, useMemo, useState } from 'react'
import { loadIndex, loadAllUnits } from '../content.js'
import { buildQuestionIndex } from '../engine'
import { teacherEnabled, teacherLogin, teacherSession, teacherLogout, loadStudents, loadWords, loadReports } from '../teacherApi.js'
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
  const now = Date.now()

  const load = async () => {
    setPhase('loading'); setErr('')
    try {
      const [students, words, reports, index] = await Promise.all([loadStudents(), loadWords(), loadReports(), loadIndex()])
      const units = await loadAllUnits(index)
      setData({ students, words, reports, units })
      setPhase('panel')
    } catch (e) { setErr(e.message || String(e)); setPhase('login') }
  }
  useEffect(() => { if (!teacherEnabled) return setPhase('off'); teacherSession().then(s => (s ? load() : setPhase('login'))) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const items = useMemo(() => data && Object.fromEntries(data.units.flatMap(u => u.items).map(i => [i.id, i])), [data])
  const questions = useMemo(() => data && new Map([...buildQuestionIndex({ units: data.units, retention: null }).values()].flat().map(q => [q.id, q])), [data])

  if (phase === 'off') return <div className="wrap"><h1>Öğretmen paneli</h1><p>Bu sürümde Supabase bağlantısı yok.</p></div>
  if (phase === 'check' || phase === 'loading') return <Splash text="Panel hazırlanıyor…" />
  if (phase === 'login') return <Login err={err} onLogin={async (e, p) => { try { await teacherLogin(e, p); await load() } catch (x) { setErr(x.message) } }} />

  const groups = [...new Set(data.students.map(s => s.sinif).filter(Boolean))].sort()
  const students = sortStudents(data.students.filter(s => !group || s.sinif === group), now)
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
        {data.words.length === 0 && <p className="muted">Henüz yeterli veri yok.</p>}
        {data.words.slice(0, 20).map(w => (
          <div className="spread wrow" key={w.birim}>
            <span><b lang="en">{items[w.birim]?.display || w.birim}</b> <span className="muted small">{items[w.birim]?.meaning_tr}</span></span>
            <span className="small">%{w.yanlis_yuzde} yanlış <span className="muted">({w.ogrenci} öğr.)</span></span>
          </div>
        ))}
      </section>

      <h2>Sorun bildirimleri</h2>
      {data.reports.length === 0 && <p className="muted">Bildirim yok (ya da reports.sql henüz çalıştırılmadı).</p>}
      {data.reports.map((r, i) => {
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
