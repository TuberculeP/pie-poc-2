<template>
  <section class="features-wrapper">
    <div class="container">
      <!-- Titre principal -->
      <h2 class="section-title">Inclus de base.</h2>
      <span>
        <p class="section-subtitle">
          Tout ce qu’il faut pour créer, enregistrer et partager votre musique
          depuis votre navigateur.
        </p>
      </span>
      <!-- Catégories côte à côte -->
      <div class="horizontal-categories">
        <!-- Stabilité & sécurité -->
        <div class="category-column">
          <h3 class="section-category">Stabilité & sécurité</h3>
          <div class="features-grid square-grid">
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

        <!-- Performance & connectivité -->
        <div class="category-column">
          <h3 class="section-category">Performance & connectivité</h3>
          <div class="features-grid square-grid">
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
      </div>

      <!-- Fonctionnalités pro -->
      <h3 class="section-category">Fonctionnalités pro</h3>
      <div class="features-grid">
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
    </div>
  </section>
</template>

<style scoped>
.features-wrapper {
  /* background-color: #f6f8fb; */
  padding: 4rem 1rem;
}

h3,
span p {
  color: #fff !important;
}

h1,
h2 {
  color: #ffd269 !important;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1e1e1e;
}

.section-subtitle {
  text-align: center;
  font-size: 1rem;
  color: #555;
  margin-bottom: 3rem;
}

.section-category {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 2rem 0 1.5rem;
  color: #1e1e1e;
  text-align: left;
}

.horizontal-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 3rem;
}

.category-column {
  flex: 1;
  min-width: 300px;
  max-width: 550px;
}

.features-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.features-grid.square-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  justify-content: center;
}

.feature-card {
  background-color: white;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  width: 100%;
  max-width: 300px;
  min-width: 260px;
  min-height: 180px;
  box-sizing: border-box;
}

.feature-card.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.feature-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #1e1e1e;
}

.feature-description {
  font-size: 0.92rem;
  color: #666;
  line-height: 1.4;
  max-width: 240px;
}

@media (max-width: 900px) {
  .horizontal-categories {
    flex-direction: column;
    align-items: center;
  }

  .section-category {
    text-align: center;
  }

  .features-grid.square-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
export default {
  name: "InclusDeBase",
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
  {
    emoji: "🧠",
    title: "Interface intuitive",
    description: "Aucune courbe d’apprentissage, tout est à sa place.",
  },
];
</script>
