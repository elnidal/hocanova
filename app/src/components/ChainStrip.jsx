import { chainView } from '../chain.js'

const DAYS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
const label = c => `${c.stamp}: ${c.on ? 'çalıştın' : c.saved ? 'Nova izni' : c.future ? 'henüz gelmedi' : c.today ? 'bugün' : 'boş'}`

function Row({ row }) {
  return (
    <div className="chain-row">
      {row.map(c => <span key={c.stamp} className={`ring${c.on ? ' on' : ''}${c.saved ? ' saved' : ''}${c.today ? ' today' : ''}${c.future ? ' future' : ''}`} title={label(c)} aria-label={label(c)}>{c.saved ? '🛡️' : c.on ? '✓' : ''}</span>)}
    </div>
  )
}

// Zinciri kırma: bu haftanın halkaları her zaman görünür; dokununca son 4 hafta açılır.
export default function ChainStrip({ daily, now, best, lgsDays, open = false }) {
  const v = chainView(daily, now, { weeks: 4, best })
  return (
    <details className="card chain" open={open}>
      <summary>
        <div className="chain-head"><b>{v.streak > 0 ? `🔥 ${v.streak}` : '🔗'}</b><span>{v.text}</span></div>
        <Row row={v.rows[v.rows.length - 1]} />
      </summary>
      <div className="chain-days" aria-hidden="true">{DAYS.map(x => <span key={x}>{x}</span>)}</div>
      {v.rows.map((r, i) => <Row key={i} row={r} />)}
      <p className="muted small">Haftada bir gün ara verirsen Nova izni 🛡️ zincirini korur.{lgsDays ? ` LGS'ye ${lgsDays} halka kaldı.` : ''}</p>
    </details>
  )
}
