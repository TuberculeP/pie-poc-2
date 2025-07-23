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
