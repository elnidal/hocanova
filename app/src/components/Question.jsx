import { useContext, useEffect, useState } from 'react'
import { hintFor, hintCollapsed, wrongReason } from '../engine'
import { HintCtx } from '../hintContext.js'
import RichText from './RichText.jsx'
import ReportIssue from './ReportIssue.jsx'
import SpeakerIcon from './SpeakerIcon.jsx'
import Visual from './Visual.jsx'
import { parseVisual } from '../visual.js'
import { speak as say, speakAll, stopSpeaking, canSpeak } from '../tts.js'
import { listenParts } from '../listenParts.js'

/**
 * q: shuffleOptions çıktısı.
 * mode 'test'  : seçip "Sonraki" ile onaylar; geri bildirim yok (onAnswer onayda çağrılır). allowUnknown ile "Bilmiyorum" (picked = -1).
 * mode 'learn' : tıklayınca kilitlenir, doğru/yanlış ve açıklama gösterilir (onAnswer tıklamada), "Sonraki" onNext çağırır.
 * q.listen: dinleme sorusu; metin gösterilmez, açılışta ve düğmeyle okunur.
 * Soru kökünün altında Türkçe satır gösterilir; alwaysHint değilse birkaç gösterimden sonra "TR" düğmesinin arkasına geçer.
 */
export default function Question({ q, mode = 'test', onAnswer, onNext, last, extra, items, newSet, speak, allowUnknown = false, unknownLabel = 'Bilmiyorum', alwaysHint = false }) {
  const [picked, setPicked] = useState(null)
  const [locked, setLocked] = useState(false)
  const { seen, bump } = useContext(HintCtx)
  const hint = hintFor(q)
  const [collapsed] = useState(() => !alwaysHint && !!hint && hintCollapsed(seen, hint.key))
  const [open, setOpen] = useState(false)
  useEffect(() => { if (hint && !alwaysHint) bump(hint.key) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (q.listen) say(q.listen) }, [q.listen])
  const learn = mode === 'learn'
  const ok = picked === q.correctIndex

  const choose = i => {
    if (locked) return
    setPicked(i)
    if (learn) { setLocked(true); onAnswer(i) }
  }
  const cls = i => {
    if (!learn || !locked) return picked === i ? ' on' : ''
    if (i === q.correctIndex) return ' right'
    return i === picked ? ' wrong' : ''
  }
  const rt = t => <RichText text={t} items={items} newSet={newSet} speak={speak} />
  const [visual] = useState(() => parseVisual(q))
  const parts = !q.listen && canSpeak ? listenParts(q, items) : []
  const [auto, setAuto] = useState(() => { try { return localStorage.getItem('hn.autoListen') === '1' } catch { return false } })
  useEffect(() => { if (auto && parts.length) speakAll(parts); return () => stopSpeaking() }, [q.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const toggleAuto = () => { const v = !auto; setAuto(v); try { localStorage.setItem('hn.autoListen', v ? '1' : '0') } catch { /* özel mod */ } if (v) speakAll(parts); else stopSpeaking() }

  return (
    <div className="card q">
      <p className="prompt">{rt(q.prompt)}</p>
      {parts.length > 0 && (
        <div className="listen-bar">
          <button type="button" className="hintbtn" onClick={() => speakAll(parts)} aria-label="Soruyu ve şıkları dinle"><SpeakerIcon /> Dinle</button>
          <label className="small muted"><input type="checkbox" checked={auto} onChange={toggleAuto} /> her soruda otomatik</label>
        </div>
      )}
      {hint && (!collapsed || open) && <p className="hint">🇹🇷 {hint.text}</p>}
      {hint && collapsed && !open && <button type="button" className="hintbtn" onClick={() => setOpen(true)}>🇹🇷 Türkçesi</button>}
      {q.listen && <button type="button" className="btn listen" onClick={() => say(q.listen)}><SpeakerIcon /> Tekrar dinle</button>}
      {visual && <Visual v={visual} />}
      {q.stem && !visual && <p className={`stem${q.stem.replace(/<[^>]+>/g, '').length > 120 ? ' long' : ''}`}>{rt(q.stem)}</p>}
      <div className="opts" role="radiogroup">
        {q.options.map((o, i) => (
          <button key={i} role="radio" aria-checked={picked === i} disabled={locked} className={`opt${cls(i)}`} onClick={() => choose(i)}>
            <span className="letter" aria-hidden="true">{'ABCDE'[i]}</span>
            <span className="otext"><RichText text={o} /></span>
          </button>
        ))}
        {!learn && allowUnknown && (
          <button role="radio" aria-checked={picked === -1} className={`opt unknown${picked === -1 ? ' on' : ''}`} onClick={() => setPicked(-1)}>{unknownLabel}</button>
        )}
      </div>
      {learn && locked && (
        <div aria-live="polite">
          <p className={`fb ${ok ? 'ok' : 'no'}`}>{ok ? 'Doğru!' : 'Neredeyse. Doğrusu yeşil olan.'}</p>
          {q.explain && <div className="explain">{q.explain}</div>}
          {!ok && picked >= 0 && wrongReason(q, q.options[picked]) && <div className="explain why">🤔 <b>Senin şıkkın neden olmadı:</b> {wrongReason(q, q.options[picked])}</div>}
          {extra}
          <ReportIssue key={q.id} q={q} screen={mode} />
        </div>
      )}
      <div className="nav">
        {learn
          ? <button className="btn" disabled={!locked} onClick={onNext}>{last ? 'Bitir' : 'Sonraki'} →</button>
          : <button className="btn" disabled={picked == null} onClick={() => onAnswer(picked)}>{last ? 'Bitir' : 'Sonraki'} →</button>}
      </div>
    </div>
  )
}
