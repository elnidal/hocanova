import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Teacher from './screens/Teacher.jsx'
import ParentView from './screens/ParentView.jsx'
import { parseToken } from './parentShare.js'
import '@fontsource-variable/bricolage-grotesque/index.css'
import '@fontsource/nunito-sans/latin-400.css'
import '@fontsource/nunito-sans/latin-ext-400.css'
import '@fontsource/nunito-sans/latin-600.css'
import '@fontsource/nunito-sans/latin-ext-600.css'
import '@fontsource/nunito-sans/latin-800.css'
import '@fontsource/nunito-sans/latin-ext-800.css'
import './styles.css'

// Öğretmen paneli ve veli bağlantısı, öğrenci uygulamasından (anonim oturum açan useStore'dan) tamamen ayrı çalışır.
const parentToken = parseToken(location.hash)
const Root = () => (parentToken ? <ParentView token={parentToken} /> : location.hash === '#ogretmen' ? <Teacher /> : <App />)
createRoot(document.getElementById('root')).render(<Root />)
