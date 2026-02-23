<template>
  <AdminLayout>
    <div class="admin-pack-detail">
      <div class="page-header">
        <div class="breadcrumb">
          <router-link :to="{ name: 'admin-samples' }">Samples</router-link>
          <span>/</span>
          <span>{{ currentPack?.name || "Loading..." }}</span>
        </div>
        <button @click="showCreateFolder = true" class="btn-primary">
          + New Folder
        </button>
      </div>

      <div v-if="!currentPack" class="loading">Loading...</div>

      <template v-else>
        <div class="pack-info-card">
          <div class="pack-cover">
            <img
              v-if="currentPack.cover"
              :src="`/samples/packs/${currentPack.slug}/${currentPack.cover}`"
              :alt="currentPack.name"
            />
            <div v-else class="pack-cover-placeholder">
              {{ currentPack.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="pack-details">
            <h1>{{ currentPack.name }}</h1>
            <p v-if="currentPack.author" class="author">
              by {{ currentPack.author }}
            </p>
            <div class="pack-meta">
              <span>Slug: {{ currentPack.slug }}</span>
              <span v-if="currentPack.featured" class="badge featured"
                >Featured</span
              >
              <span v-if="!currentPack.isActive" class="badge inactive"
                >Inactive</span
              >
            </div>
          </div>
        </div>

        <h2>Folders ({{ currentFolders.length }})</h2>

        <div v-if="currentFolders.length === 0" class="empty-state">
          <p>No folders yet</p>
          <button @click="showCreateFolder = true" class="btn-primary">
            Create first folder
          </button>
        </div>

        <div v-else class="folders-list">
          <div
            v-for="folder in currentFolders"
            :key="folder.id"
            class="folder-item"
            @click="openFolder(folder.id)"
          >
            <span class="folder-icon">📁</span>
            <div class="folder-info">
              <span class="folder-name">{{ folder.name }}</span>
              <span class="folder-order">Order: {{ folder.order }}</span>
            </div>
            <div class="folder-actions" @click.stop>
              <button @click="editFolder(folder)" class="action-btn">
                Edit
              </button>
              <button
                @click="confirmDeleteFolder(folder)"
                class="action-btn danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Create/Edit Folder Modal -->
    <div
      v-if="showCreateFolder || editingFolder"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal" @click.stop>
        <h2>{{ editingFolder ? "Edit Folder" : "Create Folder" }}</h2>
        <form @submit.prevent="submitFolder">
          <div class="form-group">
            <label>Name</label>
            <input v-model="folderForm.name" required />
          </div>
          <div class="form-group">
            <label>Order</label>
            <input v-model.number="folderForm.order" type="number" min="0" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              {{ editingFolder ? "Save" : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "../../layouts/AdminLayout.vue";
import { useAdminStore } from "../../stores/adminStore";

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const currentPack = computed(() => adminStore.currentPack);
const currentFolders = computed(() => adminStore.currentFolders);

const showCreateFolder = ref(false);
const editingFolder = ref<any>(null);

const folderForm = reactive({
  name: "",
  order: 0,
});

onMounted(async () => {
  const packId = route.params.packId as string;
  await adminStore.fetchPackDetail(packId);
});

onUnmounted(() => {
  adminStore.resetPackDetail();
});

function openFolder(folderId: string) {
  router.push({
    name: "admin-folder-detail",
    params: { packId: route.params.packId, folderId },
  });
}

function editFolder(folder: any) {
  editingFolder.value = folder;
  folderForm.name = folder.name;
  folderForm.order = folder.order;
}

function closeModal() {
  showCreateFolder.value = false;
  editingFolder.value = null;
  folderForm.name = "";
  folderForm.order = currentFolders.value.length;
}

async function submitFolder() {
  const packId = route.params.packId as string;

  if (editingFolder.value) {
    await adminStore.updateFolder(editingFolder.value.id, {
      name: folderForm.name,
      order: folderForm.order,
    });
  } else {
    await adminStore.createFolder(packId, {
      name: folderForm.name,
      order: folderForm.order,
    });
  }
  closeModal();
}

async function confirmDeleteFolder(folder: any) {
  if (
    confirm(
      `Delete folder "${folder.name}"? This will also delete all samples in it.`,
    )
  ) {
    await adminStore.deleteFolder(folder.id);
  }
}
</script>

<style scoped lang="scss">
.admin-pack-detail {
  h1 {
    margin: 0 0 4px;
    font-size: 24px;
    font-weight: 600;
    color: #f2efe8;
  }

  h2 {
    margin: 24px 0 16px;
    font-size: 18px;
    font-weight: 500;
    color: #f2efe8;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  a {
    color: #ff3fb4;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  span {
    color: rgba(255, 255, 255, 0.5);
  }
}

.btn-primary {
  padding: 10px 20px;
  background: #ff3fb4;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #e0359e;
  }
}

.loading,
.empty-state {
  text-align: center;
  padding: 48px;
  color: rgba(255, 255, 255, 0.6);

  p {
    margin: 0 0 16px;
  }
}

.pack-info-card {
  display: flex;
  gap: 20px;
  background: #2a1520;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(122, 15, 62, 0.3);
}

.pack-cover {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #ff3fb4 0%, #7a0f3e 100%);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.pack-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: white;
}

.pack-details {
  flex: 1;
}

.author {
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.pack-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;

  &.featured {
    background: rgba(255, 63, 180, 0.2);
    color: #ff3fb4;
  }

  &.inactive {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
}

.folders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #2a1520;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid rgba(122, 15, 62, 0.3);

  &:hover {
    background: rgba(122, 15, 62, 0.3);
    border-color: rgba(255, 63, 180, 0.5);
  }
}

.folder-icon {
  font-size: 24px;
}

.folder-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.folder-name {
  font-size: 15px;
  font-weight: 500;
  color: #f2efe8;
}

.folder-order {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.folder-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: #f2efe8;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.danger {
    color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.2);
    }
  }
}

// Modal styles
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #2a1520;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(122, 15, 62, 0.5);

  h2 {
    margin: 0 0 20px;
    font-size: 18px;
    color: #f2efe8;
  }
}

.form-group {
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  input {
    width: 100%;
    padding: 10px 12px;
    background: #1a0e15;
    border: 1px solid rgba(122, 15, 62, 0.5);
    border-radius: 6px;
    color: #f2efe8;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #ff3fb4;
    }
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-secondary {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #f2efe8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
