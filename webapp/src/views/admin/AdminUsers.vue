<template>
  <AdminLayout>
    <div class="admin-users">
      <div class="page-header">
        <h1>Users Management</h1>
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          placeholder="Search by email or name..."
          class="search-input"
        />
      </div>

      <div v-if="usersLoading" class="loading">Loading...</div>

      <div v-else class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.email }}</td>
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>
                <select
                  :value="user.role"
                  @change="updateRole(user.id, ($event.target as HTMLSelectElement).value)"
                  class="role-select"
                >
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </td>
              <td>
                <span
                  :class="['status-badge', user.isActive ? 'active' : 'inactive']"
                >
                  {{ user.isActive ? "Active" : "Inactive" }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <button
                  v-if="user.isActive"
                  @click="deactivateUser(user.id)"
                  class="btn-danger"
                >
                  Deactivate
                </button>
                <button
                  v-else
                  @click="activateUser(user.id)"
                  class="btn-success"
                >
                  Activate
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="usersPagination.pages > 1">
        <button
          @click="goToPage(usersPagination.page - 1)"
          :disabled="usersPagination.page <= 1"
          class="pagination-btn"
        >
          Previous
        </button>
        <span class="pagination-info">
          Page {{ usersPagination.page }} of {{ usersPagination.pages }}
        </span>
        <button
          @click="goToPage(usersPagination.page + 1)"
          :disabled="usersPagination.page >= usersPagination.pages"
          class="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import AdminLayout from "../../layouts/AdminLayout.vue";
import { useAdminStore } from "../../stores/adminStore";

const adminStore = useAdminStore();
const searchQuery = ref("");

const users = computed(() => adminStore.users);
const usersPagination = computed(() => adminStore.usersPagination);
const usersLoading = computed(() => adminStore.usersLoading);

onMounted(() => {
  adminStore.fetchUsers();
});

let searchTimeout: ReturnType<typeof setTimeout>;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchUsers(1, searchQuery.value || undefined);
  }, 300);
}

function goToPage(page: number) {
  adminStore.fetchUsers(page, searchQuery.value || undefined);
}

function updateRole(userId: string, role: string) {
  adminStore.updateUser(userId, { role });
}

function deactivateUser(userId: string) {
  if (confirm("Deactivate this user?")) {
    adminStore.updateUser(userId, { isActive: false });
  }
}

function activateUser(userId: string) {
  adminStore.updateUser(userId, { isActive: true });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}
</script>

<style scoped lang="scss">
.admin-users {
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #f2efe8;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  padding: 10px 16px;
  background: #2a1520;
  border: 1px solid rgba(122, 15, 62, 0.5);
  border-radius: 8px;
  color: #f2efe8;
  font-size: 14px;
  width: 300px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    border-color: #ff3fb4;
  }
}

.loading {
  text-align: center;
  padding: 48px;
  color: rgba(255, 255, 255, 0.6);
}

.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: #2a1520;
  border-radius: 12px;
  overflow: hidden;

  th,
  td {
    padding: 14px 16px;
    text-align: left;
  }

  th {
    background: rgba(122, 15, 62, 0.3);
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    color: #f2efe8;
    border-top: 1px solid rgba(122, 15, 62, 0.2);
  }

  tbody tr:hover {
    background: rgba(122, 15, 62, 0.15);
  }
}

.role-select {
  padding: 6px 10px;
  background: #1a0e15;
  border: 1px solid rgba(122, 15, 62, 0.5);
  border-radius: 6px;
  color: #f2efe8;
  font-size: 13px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #ff3fb4;
  }
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.active {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  &.inactive {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
}

.btn-danger,
.btn-success {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }
}

.btn-success {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;

  &:hover {
    background: rgba(34, 197, 94, 0.3);
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-btn {
  padding: 8px 16px;
  background: #2a1520;
  border: 1px solid rgba(122, 15, 62, 0.5);
  border-radius: 6px;
  color: #f2efe8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: rgba(122, 15, 62, 0.4);
    border-color: #ff3fb4;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.pagination-info {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}
</style>
