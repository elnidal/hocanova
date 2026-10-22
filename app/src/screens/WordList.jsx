import { useEffect, useState } from 'react'
import { loadUnit } from '../content.js'
import { buildWordList } from '../goal.js'

// Yazdırılabilir kelime listesi: tarayıcının "PDF olarak kaydet" seçeneğiyle PDF olur.
export default function WordList({ units, startUnit, onExit }) {
  const [unitNo, setUnitNo] = useState(startUnit)
  const [first10, setFirst10] = useState(false)
  const [unit, setUnit] = useState(null)
  useEffect(() => { setUnit(null); loadUnit(unitNo).then(setUnit) }, [unitNo])
  const groups = unit ? buildWordList(unit, first10 ? 10 : null) : []
  const total = groups.reduce((n, g) => n + g.rows.length, 0)

  return (
    <div className="wrap wordlist">
      <div className="noprint">
        <button className="btn ghost sm" onClick={onExit}>← Geri</button>
        <h1>Kelime listesi</h1>
        <p className="muted small">Listeyi seç, sonra “PDF olarak kaydet” de. Açılan pencerede hedef olarak “PDF olarak kaydet”i seçmen yeter.</p>
        <div className="chips">
          {units.map(u => <button key={u.unit} className={`pill${u.unit === unitNo ? ' on' : ''}`} onClick={() => setUnitNo(u.unit)}>Ünite {u.unit}</button>)}
        </div>
        <div className="chips">
          <button className={`pill${first10 ? ' on' : ''}`} onClick={() => setFirst10(true)}>İlk 10 gün</button>
          <button className={`pill${!first10 ? ' on' : ''}`} onClick={() => setFirst10(false)}>Tüm ünite</button>
        </div>
        <button className="btn" disabled={!unit} onClick={() => window.print()}>PDF olarak kaydet / yazdır</button>
      </div>

      {unit && (
        <article className="printable">
          <h2>Ünite {unit.unit} · <span lang="en">{unit.title}</span> · {first10 ? 'ilk 10 gün' : 'tüm kelimeler'}</h2>
          <p className="muted small">{total} ifade · HikayEnglish LGS Kelime Koçu</p>
          {groups.map(g => (
            <section key={g.title} className="wl-group">
              <h3>{g.title}</h3>
              <table>
                <tbody>
                  {g.rows.map(r => (
                    <tr key={r.id}>
                      <td className="chk">☐</td>
                      <td><b lang="en">{r.display}</b></td>
                      <td>{r.meaning}{r.note && <div className="small muted">{r.note}</div>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </article>
      )}
    </div>
  )
}
