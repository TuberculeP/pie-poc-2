<template>
  <section class="pricing">
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
          <li><i class="fas fa-check"></i> Plus de 500 instruments et sons</li>
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
          <li><i class="fas fa-check"></i> Accès illimité à l’espace MAO</li>
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
          <li><i class="fas fa-check"></i> Accès illimité à l’espace MAO</li>
          <li><i class="fas fa-check"></i> Collaboration avancée</li>
          <li>
            <i class="fas fa-check"></i> Real Time vocal tuning et + de 40
            effets
          </li>
          <li><i class="fas fa-check"></i> Espace communautaire premium</li>
          <li><i class="fas fa-check"></i> Diffusion de podcast sur Spotify</li>
        </ul>
        <button class="btn btn-outline">Choisir ce plan</button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "LandingPricing",
};
</script>

<style scoped>
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.pricing-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 32px 28px;
  text-align: center;
  position: relative;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  backdrop-filter: blur(6px);
}

.pricing-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.pricing-card.popular {
  border: 2px solid var(--color-accent);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-accent);
  color: var(--color-black);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 12px;
}

.pricing-header h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.price {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 4px;
}

.price .currency {
  font-size: 1rem;
  opacity: 0.7;
}

.price .amount {
  font-size: 2rem;
  font-weight: 700;
}

.price .period {
  font-size: 0.95rem;
  opacity: 0.7;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 28px 0 32px;
  text-align: left;
}

.pricing-features li {
  margin-bottom: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 10px;
}

.pricing-features li i {
  color: var(--color-accent);
  min-width: 18px;
  text-align: center;
}

.pricing-card .btn {
  width: 100%;
  padding: 12px 0;
  font-weight: 600;
  border-radius: 8px;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--color-white);
  transition: all 0.25s ease;
}

.btn-outline:hover {
  background: var(--color-accent);
  color: var(--color-black);
}

.btn-primary {
  background: var(--color-accent);
  color: var(--color-black);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

@media screen and (max-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media screen and (max-width: 640px) {
  .pricing {
    padding: 80px 20px;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .pricing-card {
    padding: 28px 22px;
  }

  .popular-badge {
    top: -10px;
    font-size: 0.7rem;
    padding: 5px 10px;
  }

  .pricing-features li {
    font-size: 0.9rem;
  }

  .price .amount {
    font-size: 1.6rem;
  }
}
</style>
