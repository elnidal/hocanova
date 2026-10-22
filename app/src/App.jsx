import { useEffect, useState } from 'react'
import { loadIndex, loadUnit, loadAllUnits } from './content.js'
import { buildQuestionIndex, overSoftCap } from './engine'
import { HintCtx } from './hintContext.js'
import { useStore } from './store.js'
import Home from './screens/Home.jsx'
import Placement from './screens/Placement.jsx'
import Lesson from './screens/Lesson.jsx'
import Review from './screens/Review.jsx'
import UnitCheck from './screens/UnitCheck.jsx'
import Retention from './screens/Retention.jsx'
import Splash from './components/Splash.jsx'
import Mistakes from './screens/Mistakes.jsx'
import ExamCourse from './screens/ExamCourse.jsx'
import Flash from './screens/Flash.jsx'
import WordList from './screens/WordList.jsx'
import ParentReport from './screens/ParentReport.jsx'
import { parseAssignment } from './goal.js'

export default function App() {
  const [state, dispatch, account] = useStore()
  const [index, setIndex] = useState(null)
  const [unit, setUnit] = useState(null)
  const [screen, setScreen] = useState('home')
  const [lessonCtx, setLessonCtx] = useState(null) // { qIndex, items }
  const [error, setError] = useState(null)

  useEffect(() => { loadIndex().then(setIndex).catch(setError) }, [])
  useEffect(() => { loadUnit(state.unit).then(setUnit).catch(setError) }, [state.unit])

  // Öğretmen ödev bağlantısı (?odev=100&not=...): hedefi bir kez yazar, adresi temizler.
  useEffect(() => {
    const a = parseAssignment(location.search)
    if (!a) return
    dispatch({ type: 'goal', goal: { target: a.target, source: 'teacher', note: a.note } })
    history.replaceState(null, '', location.pathname)
  }, [dispatch])

  const hintValue = { seen: state.hintSeen || {}, bump: key => dispatch({ type: 'hint', key }) }
  const wrap = el => <HintCtx.Provider value={hintValue}>{el}</HintCtx.Provider>

  if (error) return <div className="wrap">İçerik yüklenemedi. <button className="btn" onClick={() => location.reload()}>Yeniden dene</button></div>
  if (!index || !unit) return <Splash />

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
  const startUnitCheck = async () => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'unitcheck' }) }
  const startRetention = async id => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'retention', id }) }
  const startMistakes = async () => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'mistakes' }) }
  const startReview = async () => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'review' }) }

  if (screen.name === 'loading') return <Splash text="Ders hazırlanıyor…" />
  if (screen.name === 'lesson') {
    const day = unit.days.find(d => d.day === screen.day)
    const hasNext = unit.days.some(d => d.day === screen.day + 1)
    return wrap(<Lesson key={day.day} day={day} items={lessonCtx.items} qIndex={lessonCtx.qIndex} state={state} dispatch={dispatch}
      softCapped={overSoftCap(state.doneDays, Date.now())}
      onExit={() => setScreen('home')} onNext={hasNext ? () => startLesson(screen.day + 1) : null} />)
  }
  if (screen === 'wordlist') return wrap(<WordList units={index.units.filter(u => u.dayCount)} startUnit={unit.unit} onExit={() => setScreen('home')} />)
  if (screen.name === 'mistakes') return wrap(<Mistakes state={state} qIndex={lessonCtx.qIndex} items={lessonCtx.items} onFlash={deck => setScreen({ name: 'flash', deck })} onExit={() => setScreen('home')} />)
  if (screen === 'exam') return wrap(<ExamCourse index={index} state={state} dispatch={dispatch} onExit={() => setScreen('home')} />)
  if (screen.name === 'flash') return wrap(<Flash index={index} state={state} dispatch={dispatch} startDeck={screen.deck} onExit={() => setScreen('home')} />)
  if (screen === 'report') return wrap(<ParentReport index={index} state={state} onExit={() => setScreen('home')} />)
  if (screen.name === 'unitcheck') return wrap(<UnitCheck def={index.unit_check} unit={unit} items={lessonCtx.items} qIndex={lessonCtx.qIndex} state={state} dispatch={dispatch} onExit={() => setScreen('home')} />)
  if (screen.name === 'retention') return wrap(<Retention section={index.retention.sections.find(x => x.id === screen.id)} unit={unit.unit} items={lessonCtx.items} dispatch={dispatch} onExit={() => setScreen('home')} />)
  if (screen.name === 'review') return wrap(<Review state={state} dispatch={dispatch} qIndex={lessonCtx.qIndex} items={lessonCtx.items} onExit={() => setScreen('home')} />)
  if (screen === 'placement') return wrap(
    <Placement def={index.placement} coach={index.coach}
      onFinish={result => dispatch({ type: 'placement', result, now: Date.now() })}
      onExit={() => setScreen('home')} />
  )
  return wrap(<Home index={index} unit={unit} state={state} dispatch={dispatch} onPlacement={() => setScreen('placement')} onLesson={startLesson} onReview={startReview} onUnitCheck={startUnitCheck} onRetention={startRetention} onWordList={() => setScreen('wordlist')} onReport={() => setScreen('report')} onFlash={deck => setScreen({ name: 'flash', deck })} onMistakes={startMistakes} onExam={() => setScreen('exam')} account={account} />)
}
