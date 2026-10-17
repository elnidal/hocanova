import { useEffect, useState } from 'react'

export default function App() {
  const [index, setIndex] = useState(null)
  useEffect(() => {
    fetch('/content/index.json').then(r => r.json()).then(setIndex)
  }, [])
  if (!index) return <div className="wrap">Yükleniyor…</div>
  return (
    <div className="wrap">
      <div className="eyebrow">Hikayenglish · LGS</div>
      <h1>Kelime Koçu</h1>
      {index.units.map(u => (
        <div className="card" key={u.unit}>
          <b>Ünite {u.unit} · {u.title}</b><br />
          <small>{u.itemCount} birim · {u.dayCount ? `${u.dayCount} gün` : 'yalnız havuz'}</small>
        </div>
      ))}
    </div>
  )
}
