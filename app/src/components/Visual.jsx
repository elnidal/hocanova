// Görsel okuma kökü: tablo, grafik, ✓/✗ çizelgesi ya da afiş. Yapı visual.js'ten gelir.
const dots = s => String(s).split(/\s·\s/).map((x, i) => <span key={i} className="vz-seg">{x}</span>)

export default function Visual({ v }) {
  const title = v.title && <div className="vz-title">{v.title}</div>
  if (v.kind === 'chart') return (
    <figure className="vz vz-chart" lang="en">
      {title}
      {v.bars.map((b, i) => (
        <div key={i} className="vz-bar">
          <span className="vz-lab">{b.label}</span>
          <span className="vz-track"><i style={{ width: `${Math.max(3, (b.value / v.max) * 100)}%` }} /></span>
          <b className="vz-val">{b.text}</b>
        </div>
      ))}
    </figure>
  )
  if (v.kind === 'grid' || v.kind === 'checks') {
    const head = v.kind === 'grid' ? v.head : ['', ...v.names]
    const rows = v.kind === 'grid' ? v.rows : v.rows.map(([k, c]) => [k, ...c.map(x => (x ? '✓' : '✗'))])
    return (
      <figure className="vz vz-table" lang="en">
        {title}
        <div className="vz-scroll">
          <table>
            <thead><tr>{head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j} className={c === '✓' ? 'yes' : c === '✗' ? 'no' : ''}>{c}</td>))}</tr>)}</tbody>
          </table>
        </div>
      </figure>
    )
  }
  return (
    <figure className="vz vz-card" lang="en">
      {title}
      <dl>{v.rows.map((r, i) => (r.k ? <div key={i} className="vz-kv"><dt>{r.k}</dt><dd>{dots(r.v)}</dd></div> : <div key={i} className="vz-line">{dots(r.t)}</div>))}</dl>
    </figure>
  )
}
