import { useEffect, useMemo, useState } from 'react'
import { shuffleOptions, isCorrect } from '../engine'
import { pct } from '../quiz.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import RichText from '../components/RichText.jsx'
import ShareResult from '../components/ShareResult.jsx'
import { worthSharing } from '../shareCard.js'

const TEXT = {
  pre: { eyebrow: 'Ünite ön testi', intro: 'Üniteye başlamadan önce ne bildiğine bakalım. Bilmediğin çok şey çıkacak, olması gereken bu! Bilmiyorsan "Bilmiyorum" de. Ünite bitince aynı ifadelerden bir son test yapacağız ve farkı birlikte göreceğiz.' },
  post: { eyebrow: 'Ünite son testi', intro: 'Ünitenin sonuna geldin! 15 LGS tarzı soru. Geri bildirim sonda: önce hepsini çöz, sonra ön testteki hâlinle karşılaştıralım.' },
  weekly: { eyebrow: 'Cuma quiz\'i', intro: 'Bu hafta çalıştığın ifadelerden 10 soru. Süre tutuyorum ama acele etme: LGS\'de soru başına yaklaşık 1 dakikan var.' },
}

// Ortak quiz ekranı: geri bildirim sonda (sınav gibi). Ön testte "Bilmiyorum" var ve kelime durumuna yazılmaz.
export default function Quiz({ kind, title, questions, items, before, dispatch, onFinish, onExit }) {
  const list = useMemo(() => questions.map(q => shuffleOptions(q)), [questions])
  const [i, setI] = useState(-1)
  const [answers, setAnswers] = useState({})
  const [t0, setT0] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [result, setResult] = useState(null)
  useEffect(() => { if (kind !== 'weekly' || i < 0 || result) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [kind, i, result])
  const T = TEXT[kind]

  const answer = picked => {
    const q = list[i], ok = isCorrect(q, picked), at = Date.now()
    if (kind === 'pre') dispatch({ type: 'examQ', now: at }) // yalnız günlük sayaç: öğretilmemiş ifadeleri tekrar planına sokmayalım
    else dispatch({ type: 'answer', payload: { itemId: q.itemId, qid: q.id, correct: ok, kind: 'review', chosen: ok || picked < 0 ? null : q.options[picked], now: at } })
    const next = { ...answers, [q.id]: picked }
    setAnswers(next)
    if (i + 1 < list.length) return setI(i + 1)
    const r = { ok: list.filter(x => isCorrect(x, next[x.id])).length, n: list.length, qids: list.map(x => x.id), secs: Math.round((at - t0) / 1000), now: at }
    setResult(r); onFinish(r)
  }

  if (i < 0) return (
    <div className="wrap">
      <button className="btn ghost sm" onClick={onExit}>← Geri</button>
      <div className="eyebrow">{T.eyebrow}</div>
      <h1>{title}</h1>
      <Coach text={T.intro} />
      <button className="btn" onClick={() => { setT0(Date.now()); setI(0) }}>Başla · {list.length} soru</button>
    </div>
  )

  if (result) {
    const wrong = list.filter(q => !isCorrect(q, answers[q.id]))
    const p = pct(result), b = pct(before)
    const mm = `${Math.floor(result.secs / 60)}:${String(result.secs % 60).padStart(2, '0')}`
    return (
      <div className="wrap">
        <div className="eyebrow">{T.eyebrow} · sonuç</div>
        <h1>{title}</h1>
        {kind === 'post' && b != null ? (
          <section className="card growth">
            <div className="eyebrow">Gelişmen</div>
            <div className="growth-row">
              <div><b>%{b}</b><span>giriş</span></div>
              <span className="growth-arrow" aria-hidden="true">→</span>
              <div className="big-win"><b>%{p}</b><span>çıkış</span></div>
            </div>
            <p className="muted small">{p > b ? `${p - b} puan ilerledin!${p >= 70 ? ' Ünitenin başında bilmediklerini artık biliyorsun.' : ' Yanlışlarını Yanlış defterinde topladım; kartlarla pekiştirebilirsin.'}` : 'Bu ünite zorladı; yanlışlarını Yanlış defterinde topladım, kartlarla tekrar edebilirsin.'}</p>
          </section>
        ) : (
          <section className="card stats">
            <div className="stat"><b>{result.ok}/{result.n}</b><span>doğru</span></div>
            <div className="stat"><b>%{p}</b><span>başarı</span></div>
            {kind === 'weekly' && <div className="stat"><b>{mm}</b><span>süre</span></div>}
          </section>
        )}
        {kind !== 'pre' && worthSharing({ kind, from: kind === 'post' ? b : null, to: p }) && <ShareResult kind={kind} title={title} from={kind === 'post' ? b : null} to={p} />}
        <Coach text={kind === 'pre'
          ? 'Başlangıç noktan kaydedildi. Şimdi dersler bilmediklerini öğretecek; ünite sonunda farkı birlikte göreceğiz.'
          : p >= 80 ? 'Harika bir sonuç! Bu ifadeler artık senin.' : p >= 50 ? 'İyi gidiyorsun. Yanlışların tekrar listende öne geçti.' : 'Zorlandığın ifadeleri tekrar ve kartlarla pekiştireceğiz. Pes yok 💪'} />
        {kind !== 'pre' && wrong.length > 0 && (
          <details className="card review-wrong">
            <summary><b>Yanlışlarını gözden geçir ({wrong.length})</b> <span className="muted small">doğrusu ve kısa açıklama</span></summary>
            {wrong.map(q => (
              <div className="rw" key={q.id}>
                <p className="prompt"><RichText text={q.prompt} items={items} /></p>
                {q.stem && <p className="stem"><RichText text={q.stem} items={items} /></p>}
                <p className="small">Cevabın: <b>{answers[q.id] === -1 ? 'Bilmiyorum' : q.options[answers[q.id]]}</b></p>
                <p className="small ok">Doğrusu: <b>{q.options[q.correctIndex]}</b></p>
                {q.explain && <div className="explain">{q.explain}</div>}
              </div>
            ))}
          </details>
        )}
        <button className="btn" onClick={onExit}>Ana ekrana dön</button>
      </div>
    )
  }

  const q = list[i]
  const secs = t0 ? Math.round((now - t0) / 1000) : 0
  return (
    <div className="wrap">
      <div className="spread">
        <button className="btn ghost sm" onClick={onExit}>← Çık</button>
        <span className="muted">{kind === 'weekly' && `⏱ ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} · `}{i + 1} / {list.length}</span>
      </div>
      <div className="bar" aria-hidden="true"><i style={{ width: `${(i / list.length) * 100}%` }} /></div>
      <Question key={q.id} q={q} items={items} allowUnknown alwaysHint={kind === 'pre'} onAnswer={answer} last={i + 1 === list.length} />
    </div>
  )
}
