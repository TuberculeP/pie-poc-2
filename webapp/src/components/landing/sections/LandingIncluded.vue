<template>
  <section class="features-wrapper">
    <h2 class="section-title">Inclus de base.</h2>
    <span>
      <p class="section-subtitle">
        Tout ce qu’il faut pour créer, enregistrer et partager votre musique
        depuis votre navigateur.
      </p>
    </span>
    <!-- Stabilité & sécurité -->
    <div class="category-column">
      <h3 class="section-category">Stabilité & sécurité</h3>
      <div class="features-container">
        <div
          v-for="(item, i) in stabiliteSecurite"
          :key="'sec-' + i"
          class="feature-card centered"
        >
          <div class="feature-inner">
            <div class="feature-icon">{{ item.emoji }}</div>
            <h4 class="feature-title">{{ item.title }}</h4>
            <p class="feature-description">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stabilité & sécurité -->
    <div class="category-column">
      <h3 class="section-category">Performance & connectivité</h3>
      <div class="features-container">
        <div
          v-for="(item, i) in performance"
          :key="'perf-' + i"
          class="feature-card centered"
        >
          <div class="feature-inner">
            <div class="feature-icon">{{ item.emoji }}</div>
            <h4 class="feature-title">{{ item.title }}</h4>
            <p class="feature-description">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Fonctionnalités pro -->
    <h3 class="section-category">Fonctionnalités pro</h3>
    <div class="features-container">
      <div
        v-for="(item, i) in proFeatures"
        :key="'pro-' + i"
        class="feature-card centered"
      >
        <div class="feature-inner">
          <div class="feature-icon">{{ item.emoji }}</div>
          <h4 class="feature-title">{{ item.title }}</h4>
          <p class="feature-description">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-wrapper .section-subtitle {
  text-align: center;
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.6;
  opacity: 0.85;
  display: block;
  max-width: 700px;
  margin: 0 auto 40px;
}

.category-column {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-category {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.features-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

.feature-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  backdrop-filter: blur(6px);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

.feature-inner {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.feature-title {
  font-size: 1rem;
  font-weight: 500;
}

.feature-description {
  font-size: 0.9rem;
  font-weight: 300;
  opacity: 0.85;
  line-height: 1.5;
}

@media screen and (max-width: 768px) {
  .category-column {
    width: 100%;
  }
  .feature-card {
    flex: 1 1 100%;
    max-width: none;
  }
  .feature-inner {
    width: 100%;
  }
}

@media screen and (max-width: 480px) {
  .features-wrapper {
    padding: 80px 16px;
  }

  .section-subtitle {
    font-size: 0.95rem;
  }

  .feature-card {
    padding: 16px;
  }

  .feature-title {
    font-size: 0.95rem;
  }

  .feature-description {
    font-size: 0.85rem;
  }
}
</style>

<script>
export default {
  name: "LandingIncluded",
};
</script>

<script setup>
const stabiliteSecurite = [
  {
    emoji: "🛡️",
    title: "Connexion sécurisée",
    description: "Toutes vos sessions sont chiffrées par SSL.",
  },
  {
    emoji: "🚨",
    title: "Reprise automatique",
    description: "Revenez à votre dernier projet même après un crash.",
  },
  {
    emoji: "🔒",
    title: "Sessions isolées",
    description: "Chaque projet est indépendant et protégé.",
  },
  {
    emoji: "🕵️‍♂️",
    title: "Protection des données",
    description: "Sauvegardes automatiques dans le cloud.",
  },
];

const performance = [
  {
    emoji: "⚡",
    title: "Audio en temps réel",
    description: "Aucune latence pendant l’enregistrement ou le mix.",
  },
  {
    emoji: "🚀",
    title: "Interface rapide",
    description: "Chaque action est fluide, sans ralentissements.",
  },
  {
    emoji: "🌐",
    title: "Connexion partout",
    description: "Accédez à votre studio depuis n’importe où.",
  },
  {
    emoji: "🔗",
    title: "Collaboration live",
    description: "Travaillez à plusieurs sur un même projet en direct.",
  },
];

const proFeatures = [
  {
    emoji: "🎹",
    title: "Piano roll intégré",
    description: "Composez vos mélodies, arpèges et accords facilement.",
  },
  {
    emoji: "🎤",
    title: "Enregistrement audio",
    description: "Micro ou instrument, enregistrez sans plugin.",
  },
  {
    emoji: "🎛️",
    title: "Effets temps réel",
    description: "Ajoutez EQ, reverb, compresseur, delay instantanément.",
  },
  {
    emoji: "📤",
    title: "Export pro",
    description: "Export MP3, WAV, stems ou projet compressé.",
  },
  {
    emoji: "📁",
    title: "Import facile",
    description: "Fichiers audio, MIDI ou presets, tout est glissé-déposé.",
  },
];
</script>
