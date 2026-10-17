import { useEffect, useState } from 'react'
import { loadIndex, loadUnit, loadAllUnits } from './content.js'
import { buildQuestionIndex } from './engine'
import { useStore } from './store.js'
import Home from './screens/Home.jsx'
import Placement from './screens/Placement.jsx'
import Lesson from './screens/Lesson.jsx'
import Review from './screens/Review.jsx'

export default function App() {
  const [state, dispatch] = useStore()
  const [index, setIndex] = useState(null)
  const [unit, setUnit] = useState(null)
  const [screen, setScreen] = useState('home')
  const [lessonCtx, setLessonCtx] = useState(null) // { qIndex, items }
  const [error, setError] = useState(null)

  useEffect(() => { loadIndex().then(setIndex).catch(setError) }, [])
  useEffect(() => { loadUnit(state.unit).then(setUnit).catch(setError) }, [state.unit])

  if (error) return <div className="wrap">İçerik yüklenemedi. <button className="btn" onClick={() => location.reload()}>Yeniden dene</button></div>
  if (!index || !unit) return <div className="wrap muted">Yükleniyor…</div>

  const ensureCtx = async () => {
    if (lessonCtx) return lessonCtx
    const units = await loadAllUnits(index)
    const ctx = {
      qIndex: buildQuestionIndex({ units, retention: index.retention }),
      items: Object.fromEntries(units.flatMap(u => u.items).map(i => [i.id, i])),
    }
    setLessonCtx(ctx)
    return ctx
  }
  const startLesson = async day => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'lesson', day }) }
  const startReview = async () => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'review' }) }

  if (screen.name === 'loading') return <div className="wrap muted">Ders hazırlanıyor…</div>
  if (screen.name === 'lesson') {
    const day = unit.days.find(d => d.day === screen.day)
    const hasNext = unit.days.some(d => d.day === screen.day + 1)
    return <Lesson key={day.day} day={day} items={lessonCtx.items} qIndex={lessonCtx.qIndex} state={state} dispatch={dispatch}
      onExit={() => setScreen('home')} onNext={hasNext ? () => startLesson(screen.day + 1) : null} />
  }
  if (screen.name === 'review') return <Review state={state} dispatch={dispatch} qIndex={lessonCtx.qIndex} items={lessonCtx.items} onExit={() => setScreen('home')} />
  if (screen === 'placement') return (
    <Placement def={index.placement} coach={index.coach}
      onFinish={result => dispatch({ type: 'placement', result, now: Date.now() })}
      onExit={() => setScreen('home')} />
  )
  return <Home index={index} unit={unit} state={state} dispatch={dispatch} onPlacement={() => setScreen('placement')} onLesson={startLesson} onReview={startReview} />
}
