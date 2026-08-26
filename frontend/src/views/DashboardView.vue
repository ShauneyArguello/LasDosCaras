<template>
  <section class="dashboard">
    <header class="dashboard-hero">
      <div>
        <p class="eyebrow">LAS DOS PERSPECTIVAS</p>
        <h1>Explora, compara y forma tu propia opinión</h1>
        <p class="description">
          Conoce diferentes puntos de vista sobre cada tema y participa en la conversación.
        </p>
      </div>

      <div class="hero-actions">
        <RouterLink v-if="!authStore.isAuthenticated" to="/login" class="secondary-action">
          Iniciar sesión
        </RouterLink>
        <RouterLink v-if="!authStore.isAuthenticated" to="/register" class="primary-action">
          Registrarse
        </RouterLink>
        <RouterLink v-else to="/views/new" class="primary-action">
          Nueva publicación
        </RouterLink>
      </div>
    </header>

    <!-- Filtros -->
    <section class="filters">
      <CategoryFilter
        :categories="categories"
        @change="handleCategoryChange"
      />

      <HashtagFilter
        :hashtags="hashtags"
        :selected-hashtag="selectedHashtag"
        @change="handleHashtagChange"
        @search="handleHashtagSearch"
      />

      <SortSelect @change="handleSortChange" />
    </section>

    <!-- Resultados -->
    <section class="results">

      <!-- Skeleton de carga -->
      <div
        v-if="loading"
        class="skeleton-grid"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="skeleton-card"
        >
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>

          <div class="skeleton-sides">
            <div class="skeleton-side"></div>
            <div class="skeleton-side"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="error-state"
      >
        <p>
          {{ error }}
        </p>

        <button
          type="button"
          @click="loadViews"
        >
          Reintentar
        </button>
      </div>

      <!-- Sin publicaciones -->
      <p v-else-if="views.length === 0">
        No se encontraron publicaciones.
      </p>

      <!-- Publicaciones -->
      <div
        v-else
        class="views-grid"
      >
        <ViewCard
          v-for="view in views"
          :key="view.id"
          :view="view"
        />
      </div>

      <!-- Paginación -->
      <nav
        v-if="!loading && !error && totalViews > 0"
        class="pagination"
        aria-label="Paginación del tablero"
      >
        <button
          type="button"
          :disabled="!hasPreviousPage"
          @click="previousPage"
        >
          Anterior
        </button>

        <span>
          Página {{ currentPage }} de {{ totalPages }}
        </span>

        <button
          type="button"
          :disabled="!hasNextPage"
          @click="nextPage"
        >
          Siguiente
        </button>
      </nav>

    </section>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import CategoryFilter from '../components/filters/CategoryFilter.vue'
import HashtagFilter from '../components/filters/HashtagFilter.vue'
import SortSelect from '../components/filters/SortSelect.vue'
import ViewCard from '../components/ViewCard.vue'

import {
  getViews,
} from '../services/viewService'

import {
  getCategories,
} from '../services/categoryService'

import {
  getHashtags,
} from '../services/hashtagService'

import type {
  View,
} from '../models/view'

import type {
  Category,
} from '../models/category'

import type {
  Hashtag,
} from '../models/hashtag'
import { useAuthStore } from '../stores/auth'
import {
  CACHE_KEYS,
  CACHE_TTL,
  CacheService,
} from '../services/cacheService'

interface DashboardFilters {
  category: string
  hashtag: string
  sort: SortOption
  page: number
}


// =====================================
// ROUTER Y URL
// =====================================

const route = useRoute()

const router = useRouter()
const authStore = useAuthStore()


// =====================================
// TIPOS
// =====================================

type SortOption =
  | 'recent'
  | 'sideA'
  | 'sideB'

const cachedFilters =
  CacheService.getStale<DashboardFilters>(
    CACHE_KEYS.filters
  )


// =====================================
// PUBLICACIONES
// =====================================

const views = ref<View[]>([])

const totalViews = ref(0)

const pageSize = 20


// =====================================
// CATEGORÍAS
// =====================================

const categories = ref<Category[]>([])


// =====================================
// HASHTAGS
// =====================================

const hashtags = ref<Hashtag[]>([])


// =====================================
// ESTADOS DE LA INTERFAZ
// =====================================

const loading = ref(false)

const error = ref('')


// =====================================
// FILTROS DESDE LA URL
// =====================================

const selectedCategory = ref(
  typeof route.query.category === 'string'
    ? route.query.category
    : cachedFilters?.category ?? ''
)

const selectedHashtag = ref(
  typeof route.query.hashtag === 'string'
    ? route.query.hashtag
    : cachedFilters?.hashtag ?? ''
)

const selectedSort = ref<SortOption>(
  route.query.sort === 'sideA' ||
  route.query.sort === 'sideB' ||
  route.query.sort === 'recent'
    ? route.query.sort
    : cachedFilters?.sort ?? 'recent'
)

const currentPage = ref(
  Number(route.query.page) || cachedFilters?.page || 1
)

// =====================================
// PAGINACIÓN
// =====================================

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(
      totalViews.value /
      pageSize
    )
  )
})

const hasPreviousPage = computed(
  () =>
    currentPage.value > 1
)

const hasNextPage = computed(
  () =>
    currentPage.value <
    totalPages.value
)


// =====================================
// ACTUALIZAR QUERY PARAMS
// =====================================

function updateQueryParams() {
  CacheService.set(CACHE_KEYS.filters, {
    category: selectedCategory.value,
    hashtag: selectedHashtag.value,
    sort: selectedSort.value,
    page: currentPage.value,
  })

  router.replace({
    query: {
      category:
        selectedCategory.value ||
        undefined,

      hashtag:
        selectedHashtag.value ||
        undefined,

      sort:
        selectedSort.value !==
        'recent'
          ? selectedSort.value
          : undefined,

      page:
        currentPage.value > 1
          ? String(
              currentPage.value
            )
          : undefined,

    },
  })
}


// =====================================
// ORDENAR EN FRONTEND
// =====================================

function sortViews(
  list: View[]
): View[] {
  const sorted =
    [...list]

  if (
    selectedSort.value ===
    'sideA'
  ) {
    sorted.sort(
      (a, b) => {
        const aSide =
          a.sides.find(
            side =>
              side.type ===
              'SIDE'
          )

        const bSide =
          b.sides.find(
            side =>
              side.type ===
              'SIDE'
          )

        return (
          (bSide?.likeCount ?? 0) -
          (aSide?.likeCount ?? 0)
        )
      }
    )
  }

  if (
    selectedSort.value ===
    'sideB'
  ) {
    sorted.sort(
      (a, b) => {
        const aSide =
          a.sides.find(
            side =>
              side.type ===
              'COUNTERPART'
          )

        const bSide =
          b.sides.find(
            side =>
              side.type ===
              'COUNTERPART'
          )

        return (
          (bSide?.likeCount ?? 0) -
          (aSide?.likeCount ?? 0)
        )
      }
    )
  }

  return sorted
}


// =====================================
// CARGAR PUBLICACIONES
// =====================================

async function loadViews() {
  loading.value = true

  error.value = ''

  try {
    const result =
      await getViews({
        category:
          selectedCategory.value ||
          undefined,

        hashtag:
          selectedHashtag.value ||
          undefined,

        sort: 'recent',

        page:
          currentPage.value,

        limit:
          pageSize,
      })

    totalViews.value =
      result.total

    views.value =
      sortViews(
        result.views ?? []
      )
  } catch (err) {
    console.error(
      'Error cargando publicaciones:',
      err
    )

    error.value =
      'No se pudieron cargar las publicaciones.'

    views.value = []

    totalViews.value = 0
  } finally {
    loading.value = false
  }
}


// =====================================
// CARGAR CATEGORÍAS
// =====================================

async function loadCategories() {
  const cached =
    CacheService.get<Category[]>(
      CACHE_KEYS.categories,
      CACHE_TTL.categories
    ) ??
    CacheService.getStale<Category[]>(
      CACHE_KEYS.categories
    )

  if (cached) {
    categories.value = cached
  }

  try {
    const result =
      await getCategories()

    categories.value =
      result ?? []
  } catch (err) {
    console.error(
      'Error cargando categorías:',
      err
    )

    categories.value = []
  }
}


// =====================================
// CARGAR HASHTAGS
// =====================================

async function loadHashtags(
  query = ''
) {
  if (!query) {
    const cached =
      CacheService.get<Hashtag[]>(
        CACHE_KEYS.hashtags,
        CACHE_TTL.hashtags
      ) ??
      CacheService.getStale<Hashtag[]>(
        CACHE_KEYS.hashtags
      )

    if (cached) {
      hashtags.value = cached
    }
  }

  try {
    const result =
      await getHashtags(
        query
      )

    hashtags.value =
      result ?? []
  } catch (err) {
    console.error(
      'Error cargando hashtags:',
      err
    )

    hashtags.value = []
  }
}


// =====================================
// CAMBIO DE CATEGORÍA
// =====================================

async function handleCategoryChange(
  categoryId: string
) {
  selectedCategory.value =
    categoryId

  currentPage.value = 1

  updateQueryParams()

  await loadViews()
}


// =====================================
// CAMBIO DE HASHTAG
// =====================================

async function handleHashtagChange(
  hashtag: string
) {
  selectedHashtag.value =
    hashtag

  currentPage.value = 1

  updateQueryParams()

  await loadViews()
}


// =====================================
// BUSCAR SUGERENCIAS DE HASHTAGS
// =====================================

async function handleHashtagSearch(
  query: string
) {
  await loadHashtags(
    query
  )
}


// =====================================
// CAMBIO DE ORDENAMIENTO
// =====================================

async function handleSortChange(
  sort: SortOption
) {
  selectedSort.value =
    sort

  currentPage.value = 1

  updateQueryParams()

  await loadViews()
}


// =====================================
// PÁGINA ANTERIOR
// =====================================

async function previousPage() {
  if (
    !hasPreviousPage.value
  ) {
    return
  }

  currentPage.value -= 1

  updateQueryParams()

  await loadViews()
}


// =====================================
// PÁGINA SIGUIENTE
// =====================================

async function nextPage() {
  if (
    !hasNextPage.value
  ) {
    return
  }

  currentPage.value += 1

  updateQueryParams()

  await loadViews()
}


// =====================================
// CARGAR DATOS AL ENTRAR
// =====================================

async function reloadFreshData() {
  await Promise.all([
    loadCategories(),
    loadHashtags(),
  ])

  await loadViews()
}

onMounted(async () => {
  window.addEventListener(
    'lasdoscaras:online',
    reloadFreshData
  )

  await Promise.all([
    loadCategories(),
    loadHashtags(),
  ])

  await loadViews()
})

onUnmounted(() => {
  window.removeEventListener(
    'lasdoscaras:online',
    reloadFreshData
  )
})
</script>

<style scoped>

.dashboard {
  max-width: 1440px;
  margin: 0 auto;
}

.dashboard-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding: 1.75rem;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: linear-gradient(135deg, var(--surface), var(--surface-muted));
}

.dashboard-hero h1 {
  max-width: 760px;
  margin: 0.35rem 0 0.75rem;
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1.08;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.primary-action,
.secondary-action {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
}

.primary-action {
  color: #fff;
  background: var(--accent);
}

.secondary-action {
  color: var(--text-primary);
  border: 1px solid var(--border);
  background: var(--surface);
}

.filters {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(220px, 1fr)
  );
  gap: 1rem;
  margin: 1rem 0 2rem;
  padding: 1.25rem;
  border: 1px solid #26344d;
  border-radius: 14px;
  background: var(--surface);
}

.results {
  margin-top: 1rem;
}

.views-grid {
  display: grid;
  gap: 1.25rem;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(280px, 1fr)
  );
  gap: 1rem;
  margin-top: 1.5rem;
}

.skeleton-card {
  padding: 1rem;
  border-radius: 12px;
  background: #f3f4f6;
  animation: pulse 1.5s infinite;
}

.skeleton-line {
  height: 14px;
  margin-bottom: 10px;
  border-radius: 6px;
  background: #d1d5db;
}

.skeleton-title {
  width: 60%;
  height: 22px;
}

.skeleton-sides {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;
}

.skeleton-side {
  height: 90px;
  border-radius: 8px;
  background: #d1d5db;
}

.error-state {
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 10px;
  background: #fff4f4;
}

.error-state button {
  margin-top: 0.75rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}

@media (max-width: 600px) {
  .dashboard-hero {
    align-items: stretch;
    flex-direction: column;
    padding: 1.25rem;
  }

  .hero-actions,
  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .skeleton-sides {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>
