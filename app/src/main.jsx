import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource-variable/bricolage-grotesque/index.css'
import '@fontsource/nunito-sans/latin-400.css'
import '@fontsource/nunito-sans/latin-ext-400.css'
import '@fontsource/nunito-sans/latin-600.css'
import '@fontsource/nunito-sans/latin-ext-600.css'
import '@fontsource/nunito-sans/latin-800.css'
import '@fontsource/nunito-sans/latin-ext-800.css'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)
