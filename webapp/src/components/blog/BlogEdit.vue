<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from "vue";
import { getPostById, updatePost, type Post } from "../../services/posts";

const props = defineProps<{
  postId: number;
}>();

const emit = defineEmits<{
  updated: [];
  cancel: [];
}>();

const form = ref({
  author: "",
  body: "",
  tags: "",
  highlight_on_tag: false,
  pinned_by_user: false,
});

const loading = ref(false);
const error = ref<string | null>(null);
const initialLoading = ref(true);

const loadPost = async () => {
  try {
    const post = await getPostById(props.postId);
    form.value = {
      author:
        typeof post.author === "string"
          ? post.author
          : post.author.firstName || "",
      body: post.body,
      tags: post.tags ? post.tags.join(", ") : "",
      highlight_on_tag: post.highlight_on_tag || false,
      pinned_by_user: post.pinned_by_user || false,
    };
  } catch (err) {
    error.value = "Erreur lors du chargement du post";
    console.error("Erreur:", err);
  } finally {
    initialLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!form.value.author.trim() || !form.value.body.trim()) {
    error.value = "L'auteur et le contenu sont requis";
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const updateData: Partial<Post> = {
      author: {
        id: "", // Remplir avec l'id réel si disponible
        firstName: form.value.author.trim(),
        lastName: "", // Remplir avec le nom de famille réel si disponible
        email: "", // Remplir avec l'email réel si disponible
      },
      body: form.value.body.trim(),
      tags: form.value.tags
        ? form.value.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      highlight_on_tag: form.value.highlight_on_tag,
      pinned_by_user: form.value.pinned_by_user,
    };

    await updatePost(props.postId, updateData);
    emit("updated");
  } catch (err) {
    error.value = "Erreur lors de la mise à jour du post";
    console.error("Erreur:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPost();
});
</script>

<template>
  <div class="post-edit">
    <h2>Modifier le post</h2>

    <div v-if="initialLoading" class="loading">Chargement...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <form v-else @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-group">
        <label for="author">Auteur*</label>
        <input
          id="author"
          v-model="form.author"
          type="text"
          placeholder="Votre nom"
          required
        />
      </div>

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

      <div class="form-group-checkboxes">
        <label class="checkbox-label">
          <input v-model="form.highlight_on_tag" type="checkbox" />
          Mettre en évidence sur le tag
        </label>

        <label class="checkbox-label">
          <input v-model="form.pinned_by_user" type="checkbox" />
          Épingler le post
        </label>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading" class="submit-button">
          {{ loading ? "Mise à jour..." : "Mettre à jour" }}
        </button>

        <button type="button" @click="emit('cancel')" class="cancel-button">
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.post-edit {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  background: #fee;
  color: #e74c3c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.edit-form {
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
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
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
}

.form-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.submit-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.submit-button:hover:not(:disabled) {
  background: #2980b9;
}

.submit-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.cancel-button {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.cancel-button:hover {
  background: #7f8c8d;
}
</style>
