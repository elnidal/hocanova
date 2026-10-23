import { useState } from 'react'
import { KINDS, sendReport } from '../reports.js'

// Sorunun altında küçük "Sorun bildir": hata ya da anlaşılmayan yer öğretmene ulaşır.
export default function ReportIssue({ q, screen }) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState('wrong')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  if (sent) return <p className="muted small">Teşekkürler, öğretmenine ilettim 🙏</p>
  if (!open) return <button type="button" className="linkbtn inline report-link" onClick={() => setOpen(true)}>Bu soruda sorun mu var?</button>
  return (
    <form className="report-form" onSubmit={async e => { e.preventDefault(); await sendReport({ qid: q.id, itemId: q.itemId, kind, note, screen }); setSent(true) }}>
      <div className="seg3" role="radiogroup">
        {Object.entries(KINDS).map(([k, label]) => (
          <button type="button" key={k} role="radio" aria-checked={kind === k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{label}</button>
        ))}
      </div>
      <input className="field" maxLength={300} placeholder="İstersen kısaca yaz (isteğe bağlı)" value={note} onChange={e => setNote(e.target.value)} />
      <div className="row"><button type="submit" className="btn sm">Gönder</button><button type="button" className="btn ghost sm" onClick={() => setOpen(false)}>Vazgeç</button></div>
    </form>
  )
}
