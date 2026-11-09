import { useEffect, useState } from 'react'
import { loadIndex, loadUnit, loadAllUnits } from './content.js'
import { buildQuestionIndex, overSoftCap } from './engine'
import { canSpeak } from './tts.js'
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
import Onboarding from './screens/Onboarding.jsx'
import Quiz from './screens/Quiz.jsx'
import { preQuiz, postQuiz, weeklyQuiz, weekKey } from './quiz.js'
import Flash from './screens/Flash.jsx'
import WordList from './screens/WordList.jsx'
import ParentReport from './screens/ParentReport.jsx'
import MiniLgs from './screens/MiniLgs.jsx'
import Repair from './screens/Repair.jsx'
import { parseAssignment } from './goal.js'
import { flushReports } from './reports.js'
import { initialLearnerScreen, afterTourScreen } from './firstUse.js'

export default function App() {
  const [state, dispatch, account] = useStore()
  const [index, setIndex] = useState(null)
  const [unit, setUnit] = useState(null)
  const [screen, setScreen] = useState(() => initialLearnerScreen({ hash: location.hash, placement: state.placement }))
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

  // Bekleyen "Sorun bildir" kayıtlarını aç-kapa ve bağlantı gelince gönder
  useEffect(() => {
    flushReports().catch(() => {})
    window.addEventListener('online', flushReports)
    return () => window.removeEventListener('online', flushReports)
  }, [])

  const hintValue = { seen: state.hintSeen || {}, bump: key => dispatch({ type: 'hint', key }) }
  const wrap = el => <HintCtx.Provider value={hintValue}>{el}</HintCtx.Provider>

  if (error) return <div className="wrap">İçerik yüklenemedi. <button className="btn" onClick={() => location.reload()}>Yeniden dene</button></div>
  if (!index || !unit) return <Splash />

  const ensureCtx = async () => {
    if (lessonCtx) return lessonCtx
    const units = await loadAllUnits(index)
    const ctx = {
      qIndex: buildQuestionIndex({ units, retention: index.retention, listen: canSpeak }),
      items: Object.fromEntries(units.flatMap(u => u.items).map(i => [i.id, i])),
    }
    setLessonCtx(ctx)
    return ctx
  }
  const startLesson = async day => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'lesson', day }) }
  const startUnitCheck = async () => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'unitcheck' }) }
  const startRetention = async id => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'retention', id }) }
  const startMistakes = async () => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'mistakes' }) }
  // Quiz: ön/son test (ünite) ve Cuma quiz'i; sorular havuzdan o an seçilir.
  const startQuiz = async kind => {
    setScreen({ name: 'loading' })
    const ctx = await ensureCtx()
    const uq = state.unitQuiz?.[unit.unit] || {}
    const questions = kind === 'pre' ? preQuiz(ctx.qIndex, unit)
      : kind === 'post' ? postQuiz(ctx.qIndex, unit, uq.pre?.qids)
      : weeklyQuiz(ctx.qIndex, state.progress, Date.now())
    setScreen({ name: 'quiz', kind, questions, key: weekKey(Date.now()) })
  }
  const startMini = async () => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'mini' }) }
  const startRepair = async units => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'repair', units }) }
  const startReview = async () => { setScreen({ name: 'loading' }); await ensureCtx(); setScreen({ name: 'review' }) }

  // Tanıtım turu isteğe bağlı. #basla ile gelen ve henüz seviyesi olmayan öğrenci doğrudan teste gider.
  if (screen === 'tour') return (
    <Onboarding last={state.placement ? 'Ana ekrana dön' : 'Başlangıç testine geç'}
      onDone={() => { dispatch({ type: 'onboarded' }); setScreen(afterTourScreen({ placement: state.placement })) }} />
  )
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
  if (screen.name === 'quiz') return wrap(<Quiz kind={screen.kind} questions={screen.questions} items={lessonCtx.items}
    title={screen.kind === 'weekly' ? 'Bu haftanın ifadeleri' : `Ünite ${unit.unit} · ${unit.title}`}
    before={state.unitQuiz?.[unit.unit]?.pre} dispatch={dispatch} onExit={() => setScreen('home')}
    onFinish={result => screen.kind === 'weekly'
      ? dispatch({ type: 'weekly', key: screen.key, result })
      : dispatch({ type: 'unitQuiz', unit: unit.unit, phase: screen.kind, result })} />)
  if (screen.name === 'mini') return wrap(<MiniLgs index={index} state={state} qIndex={lessonCtx.qIndex} items={lessonCtx.items} dispatch={dispatch} onRepair={startRepair} onExit={() => setScreen('home')} />)
  if (screen.name === 'repair') return wrap(<Repair key={(screen.units || []).join()} index={index} state={state} qIndex={lessonCtx.qIndex} items={lessonCtx.items} dispatch={dispatch} startUnits={screen.units} onExit={() => setScreen('home')} />)
  if (screen === 'exam') return wrap(<ExamCourse index={index} state={state} dispatch={dispatch} onExit={() => setScreen('home')} />)
  if (screen.name === 'flash') return wrap(<Flash index={index} state={state} dispatch={dispatch} startDeck={screen.deck} onExit={() => setScreen('home')} />)
  if (screen === 'report') return wrap(<ParentReport index={index} state={state} dispatch={dispatch} onExit={() => setScreen("home")} />)
  if (screen.name === 'unitcheck') return wrap(<UnitCheck def={index.unit_check} unit={unit} items={lessonCtx.items} qIndex={lessonCtx.qIndex} state={state} dispatch={dispatch} onExit={() => setScreen('home')} />)
  if (screen.name === 'retention') return wrap(<Retention section={index.retention.sections.find(x => x.id === screen.id)} unit={unit.unit} items={lessonCtx.items} dispatch={dispatch} onExit={() => setScreen('home')} />)
  if (screen.name === 'review') return wrap(<Review state={state} dispatch={dispatch} qIndex={lessonCtx.qIndex} items={lessonCtx.items} onExit={() => setScreen('home')} />)
  if (screen === 'placement') return wrap(
    <Placement def={index.placement} coach={index.coach}
      onFinish={result => dispatch({ type: 'placement', result, now: Date.now() })}
      onExit={() => setScreen('home')} onTour={() => setScreen('tour')} />
  )
  return wrap(<Home index={index} unit={unit} state={state} dispatch={dispatch} onPlacement={() => setScreen('placement')} onLesson={startLesson} onReview={startReview} onUnitCheck={startUnitCheck} onRetention={startRetention} onWordList={() => setScreen('wordlist')} onReport={() => setScreen('report')} onFlash={deck => setScreen({ name: 'flash', deck })} onMistakes={startMistakes} onExam={() => setScreen('exam')} onQuiz={startQuiz} onMini={startMini} onRepair={units => startRepair(units)} onTour={() => setScreen('tour')} account={account} />)
}
