<template>
  <section class="hero">
    <div class="hero-background">
      <div class="floating-notes">
        <span class="note note-1">♪</span>
        <span class="note note-2">♫</span>
        <span class="note note-3">♬</span>
        <span class="note note-4">♩</span>
        <span class="note note-5">♬</span>
      </div>
    </div>

    <div class="hero-container">
      <h1 class="hero-title">
        <span class="title-highlight">MUSIQUE</span>
        <span class="title-main">
          <span class="title-headline">Ton studio en ligne</span>
          <span class="title-subline">Crée. Mixe. Partage.</span>
        </span>
      </h1>

      <div class="hero-stats">
        <div class="stat">
          <span class="stat-number">20k+</span>
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
  </section>
</template>

<script>
export default {
  name: "LandingHero",
};
</script>

<style scoped>
.hero-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: start;
  color: var(--color-white);
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 48px;
}

/* BLOOP */
.title-highlight {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--color-accent);
}

.title-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-headline {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 600;
  line-height: 1.1;
}

.title-subline {
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 0.08em;
  opacity: 0.85;
}

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  pointer-events: none;
}

.floating-notes {
  position: relative;
  width: 100%;
  height: 100%;
}

.note {
  position: absolute;
  color: #ffd269;
  font-size: 24px;
  animation: float 6s ease-in-out infinite;
  user-select: none;
}

.note-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}
.note-2 {
  top: 60%;
  left: 20%;
  animation-delay: 2s;
}
.note-3 {
  top: 30%;
  right: 15%;
  animation-delay: 4s;
}
.note-4 {
  bottom: 20%;
  left: 30%;
  animation-delay: 1s;
}
.note-5 {
  bottom: 40%;
  right: 10%;
  animation-delay: 3s;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 56px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-accent);
}

.stat-label {
  margin-top: 6px;
  font-size: 0.85rem;
  font-weight: 300;
  opacity: 0.8;
  text-align: center;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
  border: none;
}

.btn-primary {
  background: var(--color-accent);
  color: var(--color-black);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.btn-secondary {
  background: transparent;
  color: var(--color-white);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media screen and (max-width: 768px) {
  .hero-container {
    padding: 120px 20px 80px;
    align-items: center;
  }

  .hero-stats {
    gap: 32px;
    margin-bottom: 48px;
  }

  .title-headline {
    font-size: 2rem;
  }
}

@media screen and (max-width: 480px) {
  .hero-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
