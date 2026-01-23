<template>
  <section class="community">
    <div class="community-text">
      <h2 class="section-title">Rejoignez la communauté BLOOP</h2>
      <p>
        Des milliers de beatmakers, producteurs et musiciens créent déjà avec
        BLOOP. Échange, collabore et progresse au sein d’un écosystème 100%
        dédié à la création sonore.
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
  </section>
</template>

<script>
export default {
  name: "LandingCommunity",
};
</script>

<style scoped>
.community {
  display: flex;
  flex-direction: row;
  gap: 60px;
}

.community-text {
  flex: 1 1 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.community-text p {
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.6;
  opacity: 0.85;
  margin-bottom: 32px;
}

.community-stats {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 28px;
  margin-bottom: 32px;
}

.community-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
}

.community-stat i {
  font-size: 1.5rem;
  color: var(--color-accent);
}

.community-text .btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.community-text .btn:hover {
  background: var(--color-accent);
  color: var(--color-black);
}

.community-visual {
  flex: 1 1 400px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.testimonial {
  background: rgba(255, 255, 255, 0.04);
  padding: 28px 24px;
  border-radius: 16px;
  backdrop-filter: blur(6px);
  max-width: 100%;
}

.testimonial-content p {
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.6;
  opacity: 0.85;
  margin-bottom: 16px;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--color-black);
}

.author-info .author-name {
  font-weight: 600;
  display: block;
}

.author-info .author-role {
  font-weight: 300;
  font-size: 0.85rem;
  opacity: 0.7;
}

@media screen and (max-width: 768px) {
  .community {
    flex-direction: column;
    align-items: center;
  }

  .community-text,
  .community-visual {
    flex: 1 1 100%;
    text-align: center;
  }

  .community-stats {
    justify-content: center;
    gap: 24px;
  }

  .testimonial-content {
    text-align: center;
  }

  .testimonial-author {
    justify-content: center;
  }
}

@media screen and (max-width: 480px) {
  .community {
    padding: 80px 16px;
  }

  .community-text h2 {
    font-size: 1.8rem;
  }

  .community-text p,
  .testimonial-content p {
    font-size: 0.95rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
