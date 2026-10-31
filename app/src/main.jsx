import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Teacher from './screens/Teacher.jsx'
import Board from './screens/Board.jsx'
import ParentView from './screens/ParentView.jsx'
import Giris from './screens/Giris.jsx'
import Landing from './screens/Landing.jsx'
import { parseToken } from './parentShare.js'
import '@fontsource-variable/bricolage-grotesque/index.css'
import '@fontsource/nunito-sans/latin-400.css'
import '@fontsource/nunito-sans/latin-ext-400.css'
import '@fontsource/nunito-sans/latin-600.css'
import '@fontsource/nunito-sans/latin-ext-600.css'
import '@fontsource/nunito-sans/latin-800.css'
import '@fontsource/nunito-sans/latin-ext-800.css'
import './styles.css'

// Öğretmen paneli, tahta modu ve veli bağlantısı, öğrenci uygulamasından (anonim oturum açan useStore'dan) tamamen ayrı çalışır.
// Adres # ile değişince (bağlantıya dokunma, elle yazma) sayfa yenilenmeden doğru ekran açılır.
const Back = () => <a className="homelink noprint" href="#giris">← Girişler</a>
// Bu cihazda daha önce başlamış öğrenci tanıtımı görmeden uygulamaya girer.
const returning = () => { try { const s = JSON.parse(localStorage.getItem('hikayenglish.lgs.app.v1')); return Boolean(s?.onboarded || s?.placement) } catch { return false } }

function Root() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => { setHash(location.hash); scrollTo(0, 0) }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const parentToken = parseToken(hash)
  if (parentToken) return <><Back /><ParentView key={parentToken} token={parentToken} /></>
  if (hash === '#ogretmen') return <><Back /><Teacher /></>
  if (hash === '#tahta') return <Board />
  if (hash === '#giris' || hash === '#veli') return <Giris />
  if (hash === '#tanitim' || (!hash && !returning())) return <Landing />
  return <App />
}
createRoot(document.getElementById('root')).render(<Root />)
