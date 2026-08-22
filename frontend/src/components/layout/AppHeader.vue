<template>
  <header class="app-header">
    <div class="header-left">
      <RouterLink to="/" class="brand" aria-label="Ir al inicio">
        <span class="brand-mark">LDC</span>
        <span class="brand-text">LasDosCaras</span>
      </RouterLink>

      <nav class="top-nav" aria-label="Navegacion superior">
        <RouterLink to="/board">Tablero</RouterLink>

        <label class="category-nav">
          <span class="sr-only">Categorias</span>
          <select
            v-model="selectedCategory"
            aria-label="Categorias"
            @change="goToCategory"
          >
            <option value="">Categorias</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </label>
      </nav>
    </div>

    <div class="header-right">
      <form class="global-search" role="search" @submit.prevent="submitSearch">
        <label class="sr-only" for="global-search">Buscar publicaciones</label>
        <input
          id="global-search"
          v-model="searchText"
          type="search"
          placeholder="Buscar"
        />
        <button type="submit">Buscar</button>
      </form>

      <button
        class="theme-button"
        type="button"
        :aria-label="themeStore.isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
        :title="themeStore.isDark ? 'Tema claro' : 'Tema oscuro'"
        @click="themeStore.toggleTheme"
      >
        {{ themeStore.isDark ? '☀' : '☾' }}
      </button>

      <template v-if="authStore.token">
        <RouterLink to="/views/new" class="create-link">
          Nueva publicacion
        </RouterLink>
        <RouterLink to="/profile" class="profile-link">
          {{ authStore.user?.nombre ?? authStore.user?.name ?? 'Perfil' }}
        </RouterLink>
        <details v-if="authStore.isSuperadmin" class="admin-menu">
          <summary>Administración</summary>
          <nav aria-label="Administración">
            <RouterLink to="/admin/users">Usuarios</RouterLink>
            <RouterLink to="/admin/categories">Categorías</RouterLink>
            <RouterLink to="/admin/moderation">Moderación</RouterLink>
          </nav>
        </details>
        <button class="logout-button" type="button" @click="authStore.logout">
          Cerrar sesión
        </button>
      </template>

      <template v-else>
        <RouterLink to="/login" class="login-link">Iniciar sesión</RouterLink>
        <RouterLink to="/register" class="register-link">Registrarse</RouterLink>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import { useDebounce } from '../../composables/useDebounce'
import { getCategories } from '../../services/categoryService'
import type { Category } from '../../models/category'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()

const categories = ref<Category[]>([])
const selectedCategory = ref('')
const searchText = ref(String(route.query.q ?? ''))
const debouncedSearchText = useDebounce(searchText, 300)

async function loadCategories() {
  try {
    categories.value = await getCategories()
  } catch (error) {
    console.error('Error cargando categorias:', error)
    categories.value = []
  }
}

function goToCategory() {
  if (!selectedCategory.value) {
    router.push({ name: 'board' })
    return
  }

  router.push({
    name: 'board',
    query: {
      category: selectedCategory.value,
    },
  })
}

function submitSearch() {
  const query = searchText.value.trim()

  if (!query) {
    return
  }

  router.push({
    name: 'search',
    query: {
      q: query,
    },
  })
}

watch(
  () => route.query.category,
  (category) => {
    selectedCategory.value = String(category ?? '')
  },
  { immediate: true }
)

watch(
  () => route.query.q,
  (query) => {
    searchText.value = String(query ?? '')
  }
)

watch(debouncedSearchText, (query) => {
  const value = query.trim()

  if (route.name !== 'search') {
    return
  }

  router.replace({
    name: 'search',
    query: value ? { q: value } : {},
  })
})

onMounted(loadCategories)
</script>

<style scoped>
.app-header {
  min-height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
  padding: 0 28px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 14px;
}

.header-left {
  flex: 1 1 390px;
}

.header-right {
  flex: 1 1 520px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.brand {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 10px;
  color: var(--text-primary);
  text-decoration: none;
}

.brand-mark {
  display: inline-grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 8px;
  background: var(--accent);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.brand-text {
  font-size: 20px;
  font-weight: 800;
}

.top-nav {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.top-nav a,
.login-link,
.register-link,
.create-link,
.profile-link,
.theme-button,
.logout-button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  color: var(--text-secondary);
  background: transparent;
  font: inherit;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}

.top-nav a:hover,
.login-link:hover,
.create-link:hover,
.profile-link:hover,
.theme-button:hover,
.logout-button:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.top-nav a.router-link-active {
  background: var(--surface-muted);
  color: var(--text-primary);
  font-weight: 700;
}

.register-link,
.create-link {
  max-width: 156px;
  background: var(--accent);
  color: #ffffff;
  font-weight: 700;
  text-align: center;
  white-space: normal;
}

.register-link:hover,
.create-link:hover {
  background: var(--accent-strong);
  color: #ffffff;
}

.admin-menu {
  position: relative;
}

.admin-menu summary {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  list-style: none;
}

.admin-menu summary::-webkit-details-marker {
  display: none;
}

.admin-menu[open] summary,
.admin-menu summary:hover {
  color: var(--text-primary);
  background: var(--surface-muted);
}

.admin-menu nav {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  min-width: 180px;
  display: grid;
  gap: 4px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.admin-menu nav a {
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
}

.admin-menu nav a:hover,
.admin-menu nav a.router-link-active {
  color: var(--text-primary);
  background: var(--surface-muted);
}

.theme-button {
  width: 38px;
  padding: 0;
  border-color: var(--border);
  font-size: 20px;
  line-height: 1;
}

.category-nav select,
.global-search input {
  min-height: 38px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
}

.category-nav select {
  max-width: 172px;
  min-width: 140px;
  padding: 0 10px;
  cursor: pointer;
}

.global-search {
  display: flex;
  align-items: center;
  flex: 1 1 300px;
  min-width: 220px;
  gap: 8px;
}

.global-search input {
  width: min(100%, 260px);
  min-width: 0;
  padding: 0 12px;
}

.global-search button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.global-search button:hover {
  background: var(--surface-muted);
}

@media (max-width: 1120px) {
  .app-header {
    align-items: flex-start;
    padding: 12px 20px;
  }

  .header-left,
  .header-right {
    flex: 1 1 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .global-search {
    flex: 1 1 360px;
  }

  .global-search input {
    width: 100%;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 760px) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }

  .header-left,
  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .brand-text {
    display: none;
  }

  .top-nav {
    width: 100%;
    flex-wrap: wrap;
  }

  .top-nav a {
    flex: 0 1 auto;
  }

  .theme-button,
  .login-link,
  .register-link,
  .create-link,
  .profile-link,
  .logout-button {
    flex: 0 1 auto;
  }

  .global-search,
  .global-search input,
  .global-search button,
  .category-nav,
  .category-nav select {
    width: 100%;
  }

  .admin-menu nav {
    right: auto;
    left: 0;
  }
}
</style>
