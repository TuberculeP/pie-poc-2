<template>
  <section class="features">
    <h2 class="section-title">Pourquoi choisir BLOOP ?</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-bolt"></i>
        </div>
        <h3>Performances audio pro</h3>
        <p>
          Latence ultra faible, rendu en temps réel, et moteur audio stable pour
          une expérience studio fluide.
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
  </section>
</template>

<script>
export default {
  name: "LandingFeature",
};
</script>

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 32px 28px;
  text-align: center;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  backdrop-filter: blur(6px);
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.feature-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
  border-radius: 14px;
  background: rgba(255, 210, 105, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon i {
  font-size: 1.4rem;
  color: var(--color-accent);
}

.feature-card h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 0.95rem;
  font-weight: 300;
  line-height: 1.6;
  opacity: 0.85;
}

@media screen and (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 640px) {
  .features {
    padding: 80px 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .feature-card {
    padding: 28px 22px;
  }
}
</style>
