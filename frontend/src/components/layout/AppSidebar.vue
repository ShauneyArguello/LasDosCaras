<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav" aria-label="Navegacion principal">
      <RouterLink to="/" class="nav-item">Inicio</RouterLink>
      <RouterLink to="/board" class="nav-item">Tablero</RouterLink>
      <RouterLink to="/profile" class="nav-item">Perfil</RouterLink>
      <RouterLink v-if="authStore.isSuperadmin" to="/admin/users" class="nav-item">Usuarios admin</RouterLink>
      <RouterLink v-if="authStore.isSuperadmin" to="/admin/categories" class="nav-item">Categorias admin</RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.app-sidebar {
  width: 236px;
  padding: 24px 16px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.nav-item:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.nav-item.router-link-active {
  background: var(--surface);
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 900px) {
  .app-sidebar {
    width: 100%;
    padding: 12px 20px;
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .nav-item {
    white-space: nowrap;
  }
}
</style>
