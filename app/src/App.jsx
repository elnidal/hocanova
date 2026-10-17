import { useEffect, useState } from 'react'
import { loadIndex, loadUnit } from './content.js'
import { useStore } from './store.js'
import Home from './screens/Home.jsx'
import Placement from './screens/Placement.jsx'

export default function App() {
  const [state, dispatch] = useStore()
  const [index, setIndex] = useState(null)
  const [unit, setUnit] = useState(null)
  const [screen, setScreen] = useState('home')
  const [error, setError] = useState(null)

  useEffect(() => { loadIndex().then(setIndex).catch(setError) }, [])
  useEffect(() => { loadUnit(state.unit).then(setUnit).catch(setError) }, [state.unit])

  if (error) return <div className="wrap">İçerik yüklenemedi. <button className="btn" onClick={() => location.reload()}>Yeniden dene</button></div>
  if (!index || !unit) return <div className="wrap muted">Yükleniyor…</div>

  if (screen === 'placement') return (
    <Placement def={index.placement} coach={index.coach}
      onFinish={result => dispatch({ type: 'placement', result, now: Date.now() })}
      onExit={() => setScreen('home')} />
  )
  return <Home index={index} unit={unit} state={state} dispatch={dispatch} onPlacement={() => setScreen('placement')} />
}
