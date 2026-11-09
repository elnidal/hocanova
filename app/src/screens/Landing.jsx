import NovaAvatar from '../components/NovaAvatar.jsx'
import Logo from '../components/Logo.jsx'
import { daysToLgs } from '../coachPlan.js'
import '../landing.css'

// Tanıtım sayfası: ilk kez gelen ziyaretçi (bu cihazda ilerleme yok) ve #tanitim. Rakamlar içerikten (10 ünite, 633 ifade, 115 ders, 4.400+ soru, 24 Sınav Dili dersi).
const STEPS = [
  ['Seviyeni ölç', '18 soruluk, yaklaşık 4 dakikalık başlangıç testi nereden başlayacağını belirler. Bildiğin kelimeyle vakit kaybetmezsin.'],
  ['Planı uygula', 'Her gün ana ekranda sıralı bir plan: önce tekrar, sonra yeni ders. Kart, kısa İngilizce sahne, alıştırma. 10–15 dakika.'],
  ['Netini gör', 'Haftada bir Mini LGS: 10 soru, 15 dakika, gerçek net hesabı. Puan kaybettiğin ünite için 5 dakikalık tamir seti.'],
]

const WHY = [
  ['Ezber yok, bağlam var', 'Kelimeyi önce bir sahnenin içinde görürsün, anlamını kendin çıkarırsın. LGS de tam olarak bunu ölçer: bağlamdan anlam çıkarma.'],
  ['Unutmadan önce tekrar', 'Her ifade 1, 3, 7 ve 14 gün sonra yeni bir soruyla geri gelir. Kalıcı öğrenmenin bilinen en etkili yolu.'],
  ['Yanlışın da öğretir', 'Yanlış şıkkı seçtiğinde neden yanlış olduğunu görürsün: aynı sayı farklı satırda mı, kalıp başka duruma mı ait?'],
  ['Sınavın dilini bilirsin', '"Which one is NOT…", "CLOSEST in meaning" gibi 14 soru kökü, 24 kısa derste taktikleriyle.'],
]

const FAQ = [
  ['Ücretli mi?', 'Pilot döneminde ücretsiz. Reklam yok, üyelik zorunlu değil.'],
  ['Hangi üniteler var?', '8. sınıf İngilizce programının 10 ünitesinin tamamı: Friendship\'ten Natural Forces\'a. Okulda hangi ünitedeysen oradan başlayabilirsin.'],
  ['Telefonda çalışır mı?', 'Evet. Tarayıcıdan aç, "Ana ekrana ekle" de; uygulama gibi açılır, internet zayıfken de derslerin çalışır.'],
  ['İlerlemem kaybolur mu?', 'İlerlemen cihazında ve güvenli sunucuda tutulur. Hesap kaydedersen başka cihazdan da devam edersin.'],
  ['Öğretmenler nasıl kullanır?', 'Tahta modunda istediği dersi sınıfta akıllı tahtada açar; öğretmen panelinde öğrencilerinin ilerlemesini görür.'],
]

export default function Landing() {
  const days = daysToLgs(Date.now())
  const start = () => { location.hash = 'basla' }
  return (
    <div className="lp">
      <header className="lp-hero">
        <nav className="lp-nav lp-in">
          <span className="lp-brand"><NovaAvatar size={36} /><Logo /></span>
          <a href="#giris">Öğretmen / veli girişi</a>
        </nav>
        <div className="lp-in lp-hero-grid">
          <div>
            <p className="lp-count"><b>{days} gün</b> kaldı · LGS 13 Haziran 2027</p>
            <h1>LGS İngilizcesini ezberlemeden, <em>planla</em> bitir.</h1>
            <p className="lp-lead">Hoca Nova, 8. sınıfın 10 ünitesini kısa sahneler, akıllı tekrar ve LGS tarzı sorularla çalıştıran İngilizce koçun. Her gün ne yapacağını o söyler; sen yalnız 15 dakika ayırırsın.</p>
            <div className="lp-cta">
              <button className="lp-btn" onClick={start}>Ücretsiz başla</button>
              <button className="lp-btn ghost" onClick={() => document.getElementById('nasil')?.scrollIntoView({ behavior: 'smooth' })}>Nasıl çalışır?</button>
            </div>
            <p className="lp-fine">Üyelik gerekmez · Reklam yok · Telefonda ve bilgisayarda</p>
          </div>
          <div className="lp-device" aria-hidden="true">
            <div className="lp-screen">
              <div className="lp-plan">
                <div className="lp-plan-head"><span>Nova'nın bugünkü planı</span><span className="lp-pill">LGS'ye {days} gün</span></div>
                <div className="lp-step done"><i>✓</i><span><b>8 ifadeyi tekrar et</b><small>Unutmadan hemen önce</small></span></div>
                <div className="lp-step now"><i>2</i><span><b>Gün 4 dersini yap</b><small>keep a secret · supportive</small></span><em>Şimdi</em></div>
                <div className="lp-step"><i>3</i><span><b>Haftalık Mini LGS</b><small>10 soru · 15 dk</small></span></div>
              </div>
              <div className="lp-q">
                <small>Which one completes the dialogue?</small>
                <p>Ece: Do you want to come to the concert?<br />Selin: Sorry, <u>______</u> crowded places.</p>
                <div className="lp-opt ok"><b>A</b>I can't stand</div>
                <div className="lp-opt no"><b>B</b>I'm crazy about</div>
                <div className="lp-why">"Crazy about" çok sevmek demek; ama "Sorry" Selin'in sevmediğini gösteriyor.</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="lp-stats lp-in">
        <div><b>10</b><span>ünitenin tamamı</span></div>
        <div><b>633</b><span>kelime ve kalıp</span></div>
        <div><b>115</b><span>günlük ders</span></div>
        <div><b>4.400+</b><span>soru</span></div>
      </section>

      <section className="lp-sec lp-in" id="nasil">
        <p className="lp-kicker">Nasıl çalışır</p>
        <h2>Üç adım. Her gün aynı küçük rutin.</h2>
        <ol className="lp-steps">
          {STEPS.map(([t, d], i) => <li key={t}><span className="lp-num">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
      </section>

      <section className="lp-band">
        <div className="lp-in lp-band-grid">
          <div>
            <p className="lp-kicker">Neden işe yarıyor</p>
            <h2>Kelime listesi değil, öğrenme yöntemi.</h2>
            <p className="lp-muted">Her ders, bir İngilizce öğretmeninin sınıfta yaptığını yapar: önce göster, sonra kullandır, sonra sınav sorusunda yakalat.</p>
          </div>
          <dl className="lp-why-list">
            {WHY.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="lp-sec lp-in lp-two">
        <article>
          <p className="lp-kicker">Öğretmenler için</p>
          <h3>Tahta modu ve öğretmen paneli</h3>
          <p>Herhangi bir ünitenin herhangi bir gününü sınıfta akıllı tahtada açın; giriş yok, kayıt yok. Panelde kimin çalıştığını, hangi kelimelerin zorladığını görün; ödev bağlantısıyla günlük hedef verin.</p>
          <a href="#tahta">Tahta modunu aç →</a>
        </article>
        <article>
          <p className="lp-kicker">Veliler için</p>
          <h3>İlerlemeyi zorlamadan takip edin</h3>
          <p>Çocuğunuz bir bağlantı gönderir; son 7 günde kaç gün çalıştığını, hangi dersleri bitirdiğini ve test sonuçlarını görürsünüz. Şifre yok, hesap yok, yalnız görüntüleme.</p>
          <a href="#giris">Veli girişi →</a>
        </article>
      </section>

      <section className="lp-sec lp-in">
        <p className="lp-kicker">Sık sorulanlar</p>
        <h2>Merak ettiklerin</h2>
        <div className="lp-faq">
          {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>

      <section className="lp-final">
        <div className="lp-in">
          <NovaAvatar size={88} />
          <h2>{days} gün, günde 15 dakika.</h2>
          <p>Bugün başlayan, Haziran'da hazır olur.</p>
          <button className="lp-btn" onClick={start}>Ücretsiz başla</button>
        </div>
      </section>

      <footer className="lp-foot lp-in">
        <span><Logo /> · LGS İngilizce</span>
        <span>Bir İngilizce öğretmeni tarafından, 8. sınıf programına göre hazırlandı.</span>
        <a href="https://instagram.com/lgsingilizce" target="_blank" rel="noopener noreferrer">Instagram @lgsingilizce</a>
      </footer>
    </div>
  )
}
