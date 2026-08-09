<template>
  <section class="dashboard">
    <p class="eyebrow">TABLERO</p>

    <h1>Publicaciones</h1>

    <p class="description">
      Explora diferentes perspectivas y utiliza los filtros para encontrar
      publicaciones.
    </p>

    <!-- Filtros -->
    <section class="filters">
      <SearchInput @search="handleSearch" />

      <CategoryFilter
        :categories="categories"
        @change="handleCategoryChange"
      />

      <SortSelect @change="handleSortChange" />
    </section>

    <!-- Resultados -->
    <section class="results">
      <p v-if="loading">
        Cargando publicaciones...
      </p>

      <p v-else-if="error">
        {{ error }}
      </p>

      <p v-else-if="views.length === 0">
        No se encontraron publicaciones.
      </p>

      <div v-else class="views-grid">
        <ViewCard
          v-for="view in views"
          :key="view.id"
          :view="view"
        />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import SearchInput from '../components/filters/SearchInput.vue'
import CategoryFilter from '../components/filters/CategoryFilter.vue'
import SortSelect from '../components/filters/SortSelect.vue'
import ViewCard from '../components/ViewCard.vue'

import { getViews, searchViews } from '../services/viewService'
import { getCategories } from '../services/categoryService'

import type { View } from '../models/view'
import type { Category } from '../models/category'


// ================================
// PUBLICACIONES
// ================================

const views = ref<View[]>([])


// ================================
// CATEGORÍAS
// ================================

const categories = ref<Category[]>([])


// ================================
// ESTADO DE LA INTERFAZ
// ================================

const loading = ref(false)

const error = ref('')


// ================================
// FILTROS
// ================================

const search = ref('')

const selectedCategory = ref('')

const selectedSort = ref<'likes' | 'dislikes' | 'recent'>('recent')


// ================================
// CARGAR PUBLICACIONES
// ================================

async function loadViews() {
  loading.value = true
  error.value = ''

  try {
    const result = await getViews({
      category: selectedCategory.value || undefined,
      sort: selectedSort.value,
    })

    // Nos aseguramos de que siempre sea un arreglo
    views.value = result ?? []
  } catch (err) {
    console.error('Error cargando publicaciones:', err)

    error.value = 'No se pudieron cargar las publicaciones.'

    views.value = []
  } finally {
    loading.value = false
  }
}


// ================================
// CARGAR CATEGORÍAS
// ================================

async function loadCategories() {
  try {
    const result = await getCategories()

    // Nos aseguramos de que siempre sea un arreglo
    categories.value = result ?? []
  } catch (err) {
    console.error('Error cargando categorías:', err)

    categories.value = []
  }
}


// ================================
// BÚSQUEDA
// ================================

async function handleSearch(query: string) {
  search.value = query

  // Si se borra la búsqueda,
  // volvemos a cargar todas las publicaciones
  if (!query.trim()) {
    await loadViews()
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await searchViews(query)

    // Nos aseguramos de que views siempre sea un arreglo
    views.value = result?.views ?? []
  } catch (err) {
    console.error('Error buscando publicaciones:', err)

    error.value = 'No se pudieron buscar las publicaciones.'

    views.value = []
  } finally {
    loading.value = false
  }
}


// ================================
// CAMBIO DE CATEGORÍA
// ================================

async function handleCategoryChange(categoryId: string) {
  selectedCategory.value = categoryId

  await loadViews()
}


// ================================
// CAMBIO DE ORDENAMIENTO
// ================================

async function handleSortChange(
  sort: 'likes' | 'dislikes' | 'recent'
) {
  selectedSort.value = sort

  await loadViews()
}


// ================================
// CARGAR DATOS AL ENTRAR
// ================================

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadViews(),
  ])
})
</script>