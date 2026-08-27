<template>
  <section class="category-page">

    <!-- Ruta de navegación -->
    <nav class="breadcrumb">
      <RouterLink to="/board">
        Inicio
      </RouterLink>

      <span>›</span>
      <span>Categorías</span>
      <span>›</span>

      <span>
        {{ category?.name || 'Categoría' }}
      </span>
    </nav>

    <!-- Cargando categoría -->
    <div
      v-if="loadingCategory"
      class="loading-state"
      role="status"
      aria-live="polite"
    >
      <span class="spinner" aria-hidden="true"></span>
      <span>Cargando categoría...</span>
    </div>

    <!-- Error al cargar categoría -->
    <div v-else-if="categoryError">
      <h1>Categoría no encontrada</h1>

      <p>
        {{ categoryError }}
      </p>

      <RouterLink to="/board">
        Volver al tablero
      </RouterLink>
    </div>

    <!-- Categoría cargada -->
    <div v-else-if="category">

      <header class="category-header">
        <p class="eyebrow">
          CATEGORÍA
        </p>

        <h1>
          {{ category.name }}
        </h1>

        <p>
          {{
            category.description ||
            'Publicaciones relacionadas con esta categoría.'
          }}
        </p>

        <strong>
          {{ totalViews }} publicaciones
        </strong>
      </header>

      <!-- Filtros -->
      <section class="filters">

        <HashtagFilter
          :hashtags="hashtags"
          :selected-hashtag="selectedHashtag"
          @change="handleHashtagChange"
          @search="handleHashtagSearch"
        />

        <SortSelect
          @change="handleSortChange"
        />

      </section>

      <!-- Cargando publicaciones -->
      <div
        v-if="loadingViews"
        class="loading-state"
        role="status"
        aria-live="polite"
      >
        <span class="spinner" aria-hidden="true"></span>
        <span>Cargando publicaciones...</span>
      </div>

      <!-- Error de publicaciones -->
      <div v-else-if="viewsError">

        <p>
          {{ viewsError }}
        </p>

        <button
          type="button"
          @click="loadViews"
        >
          Reintentar
        </button>

      </div>

      <!-- No hay publicaciones -->
      <p v-else-if="views.length === 0">
        No hay publicaciones en esta categoría.
      </p>

      <!-- Tarjetas -->
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
      <div
        v-if="totalViews > 0"
        class="pagination"
      >

        <button
          type="button"
          :disabled="currentPage === 1"
          @click="previousPage"
        >
          Anterior
        </button>

        <span>
          Página {{ currentPage }} de {{ totalPages }}
        </span>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
        >
          Siguiente
        </button>

      </div>

    </div>

  </section>
</template>


<script setup lang="ts">

import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRoute,
} from 'vue-router'

import ViewCard from '../components/ViewCard.vue'

import HashtagFilter
  from '../components/filters/HashtagFilter.vue'

import SortSelect
  from '../components/filters/SortSelect.vue'

import {
  getCategoryById,
} from '../services/categoryService'

import {
  getViews,
} from '../services/viewService'

import {
  getHashtags,
} from '../services/hashtagService'

import type {
  Category,
} from '../models/category'

import type {
  View,
} from '../models/view'

import type {
  Hashtag,
} from '../models/hashtag'


type SortOption =
  | 'recent'
  | 'sideA'
  | 'sideB'


const route = useRoute()


const category =
  ref<Category | null>(null)

const views =
  ref<View[]>([])

const hashtags =
  ref<Hashtag[]>([])


const loadingCategory =
  ref(false)

const loadingViews =
  ref(false)

const categoryError =
  ref('')

const viewsError =
  ref('')


const selectedHashtag =
  ref('')

const selectedSort =
  ref<SortOption>('recent')

const currentPage =
  ref(1)

const totalViews =
  ref(0)

const pageSize = 20


const categoryId =
  computed(() =>
    String(route.params.id)
  )


const totalPages =
  computed(() => {
    return Math.max(
      1,
      Math.ceil(
        totalViews.value / pageSize
      )
    )
  })


async function loadCategory() {

  loadingCategory.value = true
  categoryError.value = ''

  try {

    category.value =
      await getCategoryById(
        categoryId.value
      )

  } catch (error) {

    console.error(error)

    categoryError.value =
      'No se pudo encontrar la categoría.'

  } finally {

    loadingCategory.value = false

  }
}


function sortViews(
  list: View[]
): View[] {

  const sorted = [...list]

  if (
    selectedSort.value === 'sideA'
  ) {

    sorted.sort((a, b) => {

      const sideA =
        a.sides.find(
          side =>
            side.type === 'SIDE'
        )

      const sideB =
        b.sides.find(
          side =>
            side.type === 'SIDE'
        )

      return (
        (sideB?.likeCount ?? 0) -
        (sideA?.likeCount ?? 0)
      )
    })
  }


  if (
    selectedSort.value === 'sideB'
  ) {

    sorted.sort((a, b) => {

      const sideA =
        a.sides.find(
          side =>
            side.type ===
            'COUNTERPART'
        )

      const sideB =
        b.sides.find(
          side =>
            side.type ===
            'COUNTERPART'
        )

      return (
        (sideB?.likeCount ?? 0) -
        (sideA?.likeCount ?? 0)
      )
    })
  }

  return sorted
}


async function loadViews() {

  loadingViews.value = true
  viewsError.value = ''

  try {

    const result =
      await getViews({

        category:
          categoryId.value,

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

  } catch (error) {

    console.error(error)

    viewsError.value =
      'No se pudieron cargar las publicaciones.'

    views.value = []

    totalViews.value = 0

  } finally {

    loadingViews.value = false

  }
}


async function loadHashtags(
  query = ''
) {

  try {

    hashtags.value =
      await getHashtags(query)

  } catch (error) {

    console.error(error)

    hashtags.value = []

  }
}


async function handleHashtagChange(
  hashtag: string
) {

  selectedHashtag.value =
    hashtag

  currentPage.value = 1

  await loadViews()
}


async function handleHashtagSearch(
  query: string
) {

  await loadHashtags(query)

}


async function handleSortChange(
  sort: SortOption
) {

  selectedSort.value = sort

  currentPage.value = 1

  await loadViews()
}


async function previousPage() {

  if (currentPage.value === 1) {
    return
  }

  currentPage.value--

  await loadViews()
}


async function nextPage() {

  if (
    currentPage.value >=
    totalPages.value
  ) {
    return
  }

  currentPage.value++

  await loadViews()
}


onMounted(async () => {

  await loadCategory()

  if (!category.value) {
    return
  }

  await loadHashtags()

  await loadViews()

})

</script>


<style scoped>

.category-page {
  width: 100%;
}


.breadcrumb {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}


.breadcrumb a {
  color: #3b82f6;
  text-decoration: none;
}


.category-header {
  margin-bottom: 24px;
}


.category-header h1 {
  margin-bottom: 8px;
}


.eyebrow {
  font-size: 0.8rem;
  font-weight: bold;
  color: #64748b;
}


.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
}


.spinner {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}


@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


.filters {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 20px;
  margin-bottom: 24px;
}


.views-grid {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);
  gap: 20px;
}


.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}


.pagination button {
  padding: 10px 16px;
  cursor: pointer;
}


.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}


/* Celular */

@media (max-width: 768px) {

  .filters {
    grid-template-columns: 1fr;
  }

  .views-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
  }

}

</style>
