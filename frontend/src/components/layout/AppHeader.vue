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
        <RouterLink to="/profile" class="profile-link">
          {{ authStore.user?.nombre ?? authStore.user?.name ?? 'Perfil' }}
        </RouterLink>
        <button class="logout-button" type="button" @click="authStore.logout">
          Salir
        </button>
      </template>

      <template v-else>
        <RouterLink to="/login" class="login-link">Login</RouterLink>
        <RouterLink to="/register" class="register-link">Registro</RouterLink>
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
  gap: 14px;
}

.brand {
  display: inline-flex;
  align-items: center;
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
  gap: 8px;
}

.top-nav a,
.login-link,
.register-link,
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
}

.top-nav a:hover,
.login-link:hover,
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

.register-link {
  background: var(--accent);
  color: #ffffff;
  font-weight: 700;
}

.register-link:hover {
  background: var(--accent-strong);
  color: #ffffff;
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
  padding: 0 10px;
  cursor: pointer;
}

.global-search {
  display: flex;
  align-items: center;
  gap: 8px;
}

.global-search input {
  width: 210px;
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
}
</style>
