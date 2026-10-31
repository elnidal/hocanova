// Giriş: adres taşıma verisi (#tasi=) varsa önce onu yaz; Supabase oturumu modül yüklenirken okunduğu için uygulama sonra yüklenir.
import { applyMigration } from './migrate.js'

applyMigration().then(moved => { if (!moved) import('./main.jsx') })
