<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { createPost, type CreatePostData } from "../../services/posts";

const emit = defineEmits<{
  postCreated: [];
}>();

const form = ref({
  body: "",
  tags: "",
  is_highlight: false,
  highlight_on_tag: false,
  pinned_by_user: false,
});

const loading = ref(false);
const error = ref<string | null>(null);

const handleSubmit = async () => {
  if (!form.value.body.trim()) {
    error.value = "Le contenu sont requis";
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const postData: CreatePostData = {
      body: form.value.body.trim(),
      tags: form.value.tags
        ? form.value.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      is_highlight: form.value.is_highlight,
    };

    await createPost(postData);

    // Réinitialiser le formulaire
    form.value = {
      body: "",
      tags: "",
      is_highlight: false,
      highlight_on_tag: false,
      pinned_by_user: false,
    };

    emit("postCreated");
  } catch (err) {
    error.value = "Erreur lors de la création du post";
    console.error("Erreur:", err);
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="post-create">
    <h2>Ajouter un nouveau post</h2>

    <div v-if="error" class="error">{{ error }}</div>

    <form @submit.prevent="handleSubmit" class="create-form">
      <!-- <div class="form-group">
        <label for="author">Auteur*</label>
        <input
          id="author"
          v-model="form.author"
          type="text"
          placeholder="Votre nom"
          required
        />
      </div>
 -->
      <div class="form-group">
        <label for="body">Contenu*</label>
        <textarea
          id="body"
          v-model="form.body"
          placeholder="Écrivez votre post..."
          rows="4"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="tags">Tags (séparés par des virgules)</label>
        <input
          id="tags"
          v-model="form.tags"
          type="text"
          placeholder="javascript, vue, développement"
        />
      </div>

      <button type="submit" :disabled="loading" class="submit-button">
        {{ loading ? "Création..." : "Poster" }}
      </button>
    </form>
  </div>
</template>
<style scoped>
.post-create {
  background: var(--color-bg-primary-dark);
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  color: var(--color-white);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error {
  background: var(--color-bg-error);
  color: var(--color-error);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 4px;
  font-size: small;
  color: var(--color-white);
}

.form-group input,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid var(--color-black);
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  font-family: inherit;
  color: var(--color-white);
  background-color: var(--color-bg-secondary-dark);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group-checkboxes {
  display: flex;
  gap: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  color: var(--color-black);
}

.submit-button {
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  align-self: flex-start;
  transition: background-color 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.submit-button:disabled {
  background: var(--color-white-active);
  cursor: not-allowed;
}
</style>
