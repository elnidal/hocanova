import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Hikayenglish LGS Kelime Koçu',
        short_name: 'Kelime Koçu',
        lang: 'tr',
        display: 'standalone',
        background_color: '#f1f0f8',
        theme_color: '#3b46d9',
        icons: [],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,json}'] },
    }),
  ],
})
