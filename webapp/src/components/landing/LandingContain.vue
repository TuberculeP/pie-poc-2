<template>
  <main class="main-section">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-background">
        <div class="floating-cubes">
          <div class="cube cube-1"></div>
          <div class="cube cube-2"></div>
          <div class="cube cube-3"></div>
          <div class="cube cube-4"></div>
          <div class="cube cube-5"></div>
        </div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-highlight">BLOOP</span>
            <span class="title-main"
              >Creez et profitez d'une expérience musicale entre amis optimale</span
            >
          </h1>
          <p class="hero-description">
            Compose, enregistre et mixe ta musique depuis ton navigateur. Aucun
            téléchargement, aucune limite. BLOOP te suit partout, que tu sois
            chez toi, en studio ou en tournée.
          </p>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">+20k</span>
              <span class="stat-label">Créateurs actifs</span>
            </div>
            <div class="stat">
              <span class="stat-number">100%</span>
              <span class="stat-label">Basé sur le cloud</span>
            </div>
            <div class="stat">
              <span class="stat-number">∞</span>
              <span class="stat-label">Pistes & projets</span>
            </div>
          </div>
          <div class="hero-buttons">
            <a class="btn btn-primary" href="/app">
              <i class="fas fa-headphones"></i>
              Essayer BLOOP
            </a>
            <button class="btn btn-secondary">
              <i class="fas fa-play"></i>
              Voir la démo
            </button>
          </div>
        </div>

        <div class="hero-visual">
          <div class="studio-mockup">
            <div class="studio-header">
              <span class="studio-title"
                >Session: bloop-demo-session.bloop.app</span
              >
            </div>
            <div class="studio-console">
              <div class="console-line">
                <span class="timestamp">[00:00:01]</span>
                <span class="info">🎧 BPM: 120 | Key: A Minor</span>
              </div>
              <div class="console-line">
                <span class="timestamp">[00:00:05]</span>
                <span class="success">🎹 Piano Roll activé</span>
              </div>
              <div class="console-line">
                <span class="timestamp">[00:00:12]</span>
                <span class="info">🎚️ Reverb ajoutée sur Piste 4</span>
              </div>
              <div class="console-line">
                <span class="timestamp">[00:00:19]</span>
                <span class="success">🎙️ Enregistrement vocal démarré</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Pourquoi choisir BLOOP ?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <h3>Performances audio pro</h3>
            <p>
              Latence ultra faible, rendu en temps réel, et moteur audio stable
              pour une expérience studio fluide.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-cloud"></i>
            </div>
            <h3>100% Cloud</h3>
            <p>
              Accède à tous tes projets où que tu sois, depuis n'importe quel
              appareil, sans installation.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-sliders-h"></i>
            </div>
            <h3>Interface intuitive</h3>
            <p>
              Un environnement pensé pour la créativité : simple, rapide, sans
              distraction.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-users"></i>
            </div>
            <h3>Collaboration en direct</h3>
            <p>
              Crée à plusieurs en temps réel. Invite des amis ou collègues à
              rejoindre ta session instantanément.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-microphone-alt"></i>
            </div>
            <h3>Enregistrement multi-pistes</h3>
            <p>
              Enregistre voix, instruments et midi directement depuis ton
              navigateur, sans plugin.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-infinity"></i>
            </div>
            <h3>Pistes et presets illimités</h3>
            <p>
              Compose sans contrainte : ajoute autant de pistes, effets et
              instruments que tu veux.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing">
      <div class="container">
        <h2 class="section-title">Nos formules de création</h2>
        <div class="pricing-grid">
          <div class="pricing-card">
            <div class="pricing-header">
              <h3>Freemium</h3>
              <div class="price">
                <span class="currency">€</span>
                <span class="amount">0</span>
                <span class="period">/mois</span>
              </div>
            </div>
            <ul class="pricing-features">
              <li><i class="fas fa-check"></i> Accès à l’espace MAO limité.</li>
              <li><i class="fas fa-check"></i> Plus de 20000 boucles</li>
              <li>
                <i class="fas fa-check"></i> Plus de 500 instruments et sons
              </li>
              <li><i class="fas fa-check"></i> Espace communautaire</li>
            </ul>
            <button class="btn btn-outline">Démarrer gratuitement</button>
          </div>

          <div class="pricing-card popular">
            <div class="popular-badge">Le plus populaire</div>
            <div class="pricing-header">
              <h3>Medium</h3>
              <div class="price">
                <span class="currency">€</span>
                <span class="amount">9.99</span>
                <span class="period">/mois</span>
              </div>
            </div>
            <ul class="pricing-features">
              <li>
                <i class="fas fa-check"></i> Accès illimité à l’espace MAO
              </li>
              <li><i class="fas fa-check"></i> Plus de 30000 boucles</li>
              <li><i class="fas fa-check"></i> Partage et collaboration</li>
              <li><i class="fas fa-check"></i> Espace communautaire enrichi</li>
              <li><i class="fas fa-check"></i> Support prioritaire</li>
            </ul>
            <button class="btn btn-primary">Choisir ce plan</button>
          </div>

          <div class="pricing-card">
            <div class="pricing-header">
              <h3>Premium</h3>
              <div class="price">
                <span class="currency">€</span>
                <span class="amount">14.99</span>
                <span class="period">/mois</span>
              </div>
            </div>
            <ul class="pricing-features">
              <li>
                <i class="fas fa-check"></i> Accès illimité à l’espace MAO
              </li>
              <li><i class="fas fa-check"></i> Collaboration avancée</li>
              <li>
                <i class="fas fa-check"></i> Real Time vocal tuning et + de 40
                effets
              </li>
              <li><i class="fas fa-check"></i> Espace communautaire premium</li>
              <li>
                <i class="fas fa-check"></i> Diffusion de podcast sur Spotify
              </li>
            </ul>
            <button class="btn btn-outline">Choisir ce plan</button>
          </div>
        </div>
      </div>
    </section>

    <LandingIncluded />

    <!-- Community Section -->
    <section class="community">
      <div class="container">
        <div class="community-content">
          <div class="community-text">
            <h2>Rejoignez la communauté BLOOP</h2>
            <p>
              Des milliers de beatmakers, producteurs et musiciens créent déjà
              avec BLOOP. Échange, collabore et progresse au sein d’un
              écosystème 100% dédié à la création sonore.
            </p>

            <div class="community-stats">
              <div class="community-stat">
                <i class="fab fa-discord"></i>
                <span>+8 000 membres sur Discord</span>
              </div>
              <div class="community-stat">
                <i class="fas fa-music"></i>
                <span>Sessions collaboratives en continu</span>
              </div>
            </div>

            <button class="btn btn-secondary">
              <i class="fab fa-discord"></i>
              Rejoindre la communauté
            </button>
          </div>

          <div class="community-visual">
            <div class="testimonial">
              <div class="testimonial-content">
                <p>
                  "BLOOP m’a permis de produire un EP complet depuis mon ordi
                  portable, sans rien installer. Une vraie révolution."
                </p>
                <div class="testimonial-author">
                  <div class="author-avatar">
                    <i class="fas fa-user-music"></i>
                  </div>
                  <div class="author-info">
                    <span class="author-name">LunaBeats</span>
                    <span class="author-role">Productrice indépendante</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import LandingIncluded from "./LandingIncluded.vue";

export default {
  name: "HelloWorld",
  components: {
    LandingIncluded,
  },
};
</script>

<style scoped>
.main-section {
  /* background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); */
  color: #fff;
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.floating-cubes {
  position: relative;
  width: 100%;
  height: 100%;
}

.cube {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ffd269;
  transform: rotate(45deg);
  animation: float 6s ease-in-out infinite;
}

.cube-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}
.cube-2 {
  top: 60%;
  left: 20%;
  animation-delay: 2s;
}
.cube-3 {
  top: 30%;
  right: 15%;
  animation-delay: 4s;
}
.cube-4 {
  bottom: 20%;
  left: 30%;
  animation-delay: 1s;
}
.cube-5 {
  bottom: 40%;
  right: 10%;
  animation-delay: 3s;
}

@keyframes float {
  0%,
  100% {
    transform: rotate(45deg) translateY(0px);
  }
  50% {
    transform: rotate(45deg) translateY(-20px);
  }
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  animation: slideInLeft 1s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.title-highlight {
  display: block;
  background: linear-gradient(45deg, #ffd269, #ffd269);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-main {
  display: block;
  color: #fff;
}

.hero-description {
  font-size: 1.3rem;
  color: #ccc;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #ffd269;
}

.stat-label {
  font-size: 0.9rem;
  color: #999;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(45deg, #ffd269, #ffd269);
  color: #060b17;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(76, 175, 80, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 2px solid #ffd269;
}

.btn-secondary:hover {
  background: #ffd269;
  transform: translateY(-2px);
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
}

.studio-mockup {
  background-color: #111827;
  color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  font-family: "Courier New", Courier, monospace;
  overflow: hidden;
}

.studio-header {
  background-color: #1f2937;
  padding: 1rem;
  border-bottom: 1px solid #374151;
}

.studio-title {
  font-size: 0.95rem;
  color: #93c5fd;
}

.studio-console {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  background-color: #0f172a;
  min-height: 200px;
}

.console-line {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: break-word;
}

.timestamp {
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}

.info {
  color: #f3f4f6;
}

.success {
  color: #ffd269;
}

.warning {
  color: #facc15;
}

.error {
  color: #f87171;
}

/* Features Section */
.features {
  padding: 6rem 0;
  /* background: rgba(255, 255, 255, 0.02); */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #fff;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #ffd269, #ffd269);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: var(--color-black);
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #fff;
}

.feature-card p {
  color: #ccc;
  line-height: 1.6;
}

/* Pricing Section */
.pricing {
  padding: 6rem 0;
}

.pricing-grid {
  display: grid;
  /* border: red solid 1px; */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pricing-card:hover {
  transform: translateY(-5px);
}

.pricing-card.popular {
  border: 2px solid #ffd269;
  transform: scale(1.05);
}

.popular-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffd269;
  color: var(--color-black);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.pricing-header h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #fff;
}

.price {
  margin-bottom: 2rem;
}

.currency {
  font-size: 1.2rem;
  color: #ffd269;
  vertical-align: top;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: #ffd269;
}

.period {
  font-size: 1rem;
  color: #ccc;
}

.pricing-features {
  list-style: none;
  margin-bottom: 2rem;
}

.pricing-features li {
  padding: 0.5rem 0;
  color: #ccc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pricing-features i {
  color: #ffd269;
}

.btn-outline {
  background: transparent;
  color: #ffd269;
  border: 2px solid #ffd269;
}

.btn-outline:hover {
  background: #ffd269;
  color: #fff;
}

/* Community Section */
.community {
  padding: 6rem 0;
  /* background: rgba(255, 255, 255, 0.02); */
}

.community-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.community-text h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #fff;
}

.community-text p {
  font-size: 1.2rem;
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.community-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.community-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #ccc;
}

.community-stat i {
  color: #ffd269;
  font-size: 1.2rem;
}

.testimonial {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.testimonial-content p {
  font-style: italic;
  margin-bottom: 1.5rem;
  color: #fff;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  background: #ffd269;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #fff;
}

.author-role {
  font-size: 0.9rem;
  color: #ccc;
}

/* Responsive */

@media (min-width: 1170px){
  .title-highlight{
    display: none;
  }
}

@media (max-width: 909px){
  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }
  
  .hero-visual{
    display: none;
  }
}

@media (max-width: 768px) {

  .pricing-card,
  .pricing-card.popular {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .community-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .pricing-card.popular {
    transform: none;
  }
}
</style>
