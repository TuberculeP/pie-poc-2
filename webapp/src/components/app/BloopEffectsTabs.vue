<template>
  <div class="effects-tabs-container">
    <div class="effects-body">
      <div class="effects-eq">
        <div>
          <h3>EQ EZ</h3>
          <div>TEST</div>
        </div>
      </div>

      <div class="effects-audio-channel">
        <div class="reverb">
          <label>Volume : {{ Math.round(volumeValue) }}%</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            v-model.number="volumeValue"
          />
        </div>
        <div class="reverb">
          <label>Reverb : {{ Math.round(reverbValue || 0) }}%</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            v-model.number="reverbValue"
          />
        </div>
      </div>
    </div>

    <div class="effects-footer">
      <div>Effets</div>
      <div>Afficher les raccourcis</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSequencerStore } from "../../stores/sequencerStore.ts";
import { computed } from "vue";

const store = useSequencerStore();

// Utiliser des computed avec getter et setter pour synchroniser directement avec le store
const volumeValue = computed({
  get: () => store.volume,
  set: (newValue) => {
    store.volume = newValue;
  },
});

const reverbValue = computed({
  get: () => store.reverb,
  set: (newValue) => {
    store.reverb = newValue;
  },
});
</script>

<style scoped lang="scss">
.effects-tabs-container {
  height: 300px;
  display: flex;
  flex-direction: column;

  .effects-body {
    height: 100%;
    display: flex;
    justify-content: space-between;

    .effects-eq {
      padding: 16px;

      div {
        padding: 16px;
        height: 100%;
        width: 500px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #061b33;
        border-radius: 8px;
      }
    }

    .effects-audio-channel {
      padding: 16px;
      width: 300px;
      display: flex;
      flex-direction: column;
      gap: 24px;

      label {
        display: block;
        font-weight: 500;
        margin-bottom: 6px;
      }

      input[type="range"] {
        width: 100%;
        cursor: pointer;
        accent-color: var(--color-secondary);
      }
    }
  }

  .effects-footer {
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid var(--color-secondary);

    div:hover {
      cursor: pointer;
      color: var(--color-secondary);
    }
  }
}
</style>
