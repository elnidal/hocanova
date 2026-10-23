import { useEffect, useState } from 'react'
import { loadIndex } from '../content.js'
import { fetchParentReport } from '../supabase.js'
import { remoteToState } from '../parentShare.js'
import ParentReport from './ParentReport.jsx'
import Splash from '../components/Splash.jsx'

// Veli bağlantısı (#veli=KOD): giriş yok, öğrenci oturumu açılmaz; yalnız parent_report işlevini çağırır.
export default function ParentView({ token }) {
  const [st, setSt] = useState({ phase: 'loading' })
  useEffect(() => {
    Promise.all([loadIndex(), fetchParentReport(token)])
      .then(([index, r]) => setSt(r ? { phase: 'ok', index, state: remoteToState(r) } : { phase: 'gone' }))
      .catch(() => setSt({ phase: 'error' }))
  }, [token])
  if (st.phase === 'loading') return <Splash text="Rapor hazırlanıyor…" />
  if (st.phase === 'ok') return <ParentReport index={st.index} state={st.state} remote />
  return (
    <div className="wrap">
      <h1>Veli raporu</h1>
      <p>{st.phase === 'gone' ? 'Bu bağlantı artık geçerli değil. Öğrenciden yeni bir bağlantı isteyebilirsin.' : 'Rapor şu an açılamadı. Birazdan tekrar dene.'}</p>
    </div>
  )
}
