<template>
  <section class="search-page">

    <header class="search-header">
      <p class="eyebrow">
        BUSQUEDA
      </p>

      <h1>
        Resultados para:
        <span v-if="query">
          "{{ query }}"
        </span>
      </h1>

      <p v-if="query && !loading">
        {{ results.length }} resultados encontrados
      </p>
    </header>

    <form
      class="search-form"
      @submit.prevent="submitSearch"
    >
      <label for="search-input">
        Buscar publicaciones
      </label>

      <div class="search-row">
        <input
          id="search-input"
          v-model="searchText"
          type="search"
          placeholder="Escribe un término"
        />

        <button type="submit">
          Buscar
        </button>
      </div>
    </form>

    <p
      v-if="emptyQuery"
      class="info-message"
    >
      Ingresa un término de búsqueda.
    </p>

    <p
      v-else-if="loading"
      class="loading-message"
    >
      Buscando publicaciones...
    </p>

    <div
      v-else-if="error"
      class="error-message"
      role="alert"
    >
      <p>
        {{ error }}
      </p>

      <button
        type="button"
        @click="loadResults"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="results.length === 0"
      class="empty-message"
    >
      <h2>
        No se encontraron publicaciones para "{{ query }}"
      </h2>

      <p>
        Intenta usar un término más general.
      </p>
    </div>

    <div
      v-else
      class="results-list"
    >
      <article
        v-for="view in results"
        :key="view.id"
        class="result-card"
      >
        <div class="result-header">
          <RouterLink
            :to="`/categories/${view.category.id}`"
            class="category-badge"
          >
            {{ view.category.name }}
          </RouterLink>

          <span class="date">
            {{ formatDate(view.createdAt) }}
          </span>
        </div>

        <h2
          class="result-title"
          v-html="highlightText(
            getTitle(view),
            query
          )"
        ></h2>

        <RouterLink
          :to="`/authors/${view.author.id}`"
          class="author-link"
        >
          Por {{ view.author.name }}
        </RouterLink>

        <p
          class="result-description"
          v-html="highlightText(
            getDescription(view),
            query
          )"
        ></p>

        <div
          v-if="view.hashtags?.length"
          class="hashtags"
        >
          <span
            v-for="hashtag in view.hashtags"
            :key="hashtag.id"
            class="hashtag"
          >
            #{{ hashtag.name }}
          </span>
        </div>

        <RouterLink
          :to="`/views/${view.id}`"
          class="detail-button"
        >
          Ver detalle
        </RouterLink>
      </article>
    </div>

  </section>
</template>

<script setup lang="ts">

import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  searchViews,
} from '../services/viewService'

import type {
  View,
} from '../models/view'


const route =
  useRoute()

const router =
  useRouter()


const results =
  ref<View[]>([])

const loading =
  ref(false)

const error =
  ref('')

const searchText =
  ref(
    String(
      route.query.q ?? ''
    )
  )


const query =
  computed(() =>
    String(
      route.query.q ?? ''
    ).trim()
  )


const emptyQuery =
  computed(() =>
    query.value.length === 0
  )


async function loadResults() {

  if (!query.value) {
    results.value = []
    error.value = ''
    return
  }

  loading.value = true
  error.value = ''

  try {

    const response =
      await searchViews(
        query.value
      )

    results.value =
      response.views ?? []

  } catch (err) {

    console.error(
      'Error buscando publicaciones:',
      err
    )

    error.value =
      'No se pudieron cargar los resultados de búsqueda.'

    results.value = []

  } finally {

    loading.value = false

  }
}


function submitSearch() {

  const value =
    searchText.value.trim()

  router.push({
    name: 'search',
    query: value
      ? { q: value }
      : {},
  })

}


function getTitle(
  view: View
): string {

  const sideA =
    view.sides.find(
      side =>
        side.type === 'SIDE'
    )

  return (
    sideA?.title ??
    'Sin título'
  )

}


function getDescription(
  view: View
): string {

  const sideA =
    view.sides.find(
      side =>
        side.type === 'SIDE'
    )

  return (
    sideA?.description ??
    'Sin descripción disponible.'
  )

}


function formatDate(
  date?: string
): string {

  if (!date) {
    return ''
  }

  return new Date(
    date
  ).toLocaleDateString()

}


function escapeHtml(
  text: string
): string {

  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

}


function escapeRegExp(
  text: string
): string {

  return text.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  )

}


function highlightText(
  text: string,
  term: string
): string {

  const safeText =
    escapeHtml(text)

  if (!term) {
    return safeText
  }

  const safeTerm =
    escapeRegExp(term)

  const regex =
    new RegExp(
      `(${safeTerm})`,
      'gi'
    )

  return safeText.replace(
    regex,
    '<mark>$1</mark>'
  )

}


watch(
  () => route.query.q,
  () => {
    searchText.value =
      String(
        route.query.q ?? ''
      )

    loadResults()
  },
  {
    immediate: true,
  }
)

</script>

<style scoped>

.search-page {
  width: 100%;
}

.search-header {
  margin-bottom: 24px;
}

.search-header h1 {
  margin: 0 0 8px;
}

.eyebrow {
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
}

.search-form {
  margin-bottom: 28px;
}

.search-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.search-row {
  display: flex;
  gap: 10px;
}

.search-row input {
  flex: 1;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
}

.search-row button {
  min-height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  cursor: pointer;
}

.results-list {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  gap: 20px;
}

.result-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
}

.result-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.category-badge {
  display: inline-flex;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--accent);
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
}

.date {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.result-title {
  margin: 0;
  color: var(--text-primary);
}

.author-link {
  width: fit-content;
  color: var(--accent);
  text-decoration: none;
}

.result-description {
  color: var(--text-secondary);
  line-height: 1.55;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hashtag {
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.detail-button {
  width: fit-content;
  margin-top: auto;
  padding: 9px 14px;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-weight: 700;
  text-decoration: none;
}

.info-message,
.loading-message,
.error-message,
.empty-message {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.error-message {
  color: #b91c1c;
}

.error-message button {
  margin-top: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

:deep(mark) {
  padding: 0 2px;
  background: #fde68a;
  color: #111827;
}

@media (max-width: 768px) {

  .results-list {
    grid-template-columns: 1fr;
  }

  .search-row {
    flex-direction: column;
  }

  .search-row button {
    width: 100%;
  }

}

</style>
s