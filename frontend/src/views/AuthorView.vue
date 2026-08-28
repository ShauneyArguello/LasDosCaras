<template>
  <section class="author-page">

    <div
      v-if="loading"
      class="loading-state"
      role="status"
      aria-live="polite"
    >
      <span class="spinner" aria-hidden="true"></span>
      <span>Cargando autor...</span>
    </div>

    <div
      v-else-if="error"
      class="error-state"
    >
      <p>
        {{ error }}
      </p>

      <button
        type="button"
        @click="loadAuthorPage"
      >
        Reintentar
      </button>
    </div>

    <template v-else-if="author">

      <header class="author-header">

        <p class="eyebrow">
          AUTOR
        </p>

        <h1>
          {{ author.name }}
        </h1>

        <div class="author-meta">

          <span>
            Miembro desde:
            {{ formatDate(author.createdAt) }}
          </span>

          <span>
            Publicaciones:
            {{ author.publishedViewsCount }}
          </span>

        </div>

      </header>

      <section class="publications-section">

        <h2>
          Publicaciones de {{ author.name }}
        </h2>

        <p
          v-if="views.length === 0"
          class="empty-state"
        >
          Este autor no tiene publicaciones publicadas.
        </p>

        <div
          v-else
          class="views-grid"
        >

          <article
            v-for="view in views"
            :key="view.id"
            class="view-card"
          >

            <div class="view-card-header">

              <span class="category-badge">
                {{ view.category.name }}
              </span>

              <span class="view-date">
                {{ formatDate(view.createdAt) }}
              </span>

            </div>

            <h3>
              {{ getViewTitle(view) }}
            </h3>

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

            <div class="reactions">

              <span>
                👍 {{ view.totalLikes ?? 0 }}
              </span>

              <span>
                👎 {{ view.totalDislikes ?? 0 }}
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

  </section>
</template>


<script setup lang="ts">

import {
  onMounted,
  ref,
  watch,
} from 'vue'

import {
  useRoute,
} from 'vue-router'

import axios from 'axios'

import api from '../services/api'

import {
  getViews,
} from '../services/viewService'

import type {
  View,
} from '../models/view'


interface Author {
  id: string
  name: string
  createdAt: string
  publishedViewsCount: number
}


const route =
  useRoute()

const author =
  ref<Author | null>(null)

const views =
  ref<View[]>([])

const loading =
  ref(false)

const error =
  ref('')


function getViewTitle(
  view: View
): string {

  const side =
    view.sides.find(
      item =>
        item.type === 'SIDE'
    )

  return side?.title ??
    'Sin título'
}


function formatDate(
  date?: string
): string {

  if (!date) {
    return 'No disponible'
  }

  return new Date(date)
    .toLocaleDateString('es-CR')
}


async function loadAuthorPage() {

  loading.value =
    true

  error.value =
    ''

  author.value =
    null

  views.value =
    []

  try {

    const authorId =
      route.params.id as string

    const [
      authorResponse,
      viewsResponse,
    ] =
      await Promise.all([
        api.get(
          `/api/authors/${authorId}`
        ),

        getViews({
          autorId: authorId,
          sort: 'recent',
          page: 1,
          limit: 100,
        }),
      ])

    author.value =
      authorResponse.data.author

    views.value =
      viewsResponse.views

  } catch (err) {

    console.error(
      'Error cargando autor:',
      err
    )

    if (
      axios.isAxiosError(err) &&
      err.response?.status === 404
    ) {

      error.value =
        'El autor no existe.'

    } else {

      error.value =
        'No se pudo cargar la información del autor.'

    }

  } finally {

    loading.value =
      false

  }
}


watch(
  () => route.params.id,
  () => {
    loadAuthorPage()
  }
)


onMounted(() => {
  loadAuthorPage()
})

</script>


<style scoped>

.author-page {
  width: 100%;
}

.author-header {
  margin-bottom: 32px;
  padding: 24px;
  border: 1px solid #334155;
  border-radius: 12px;
}

.eyebrow {
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.author-header h1 {
  margin: 0 0 16px;
  font-size: 32px;
}

.author-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: var(--text-secondary);
}

.publications-section h2 {
  margin-bottom: 20px;
}

.views-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  gap: 20px;
}

.view-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border: 1px solid #334155;
  border-radius: 12px;
}

.view-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.category-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  background: #2563eb;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.view-date {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.view-card h3 {
  margin: 0;
  font-size: 1.2rem;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hashtag {
  color: #60a5fa;
  font-size: 0.85rem;
}

.reactions {
  display: flex;
  gap: 16px;
}

.detail-button {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  text-decoration: none;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 1px solid #334155;
  border-radius: 10px;
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

.error-state,
.empty-state {
  padding: 20px;
  border: 1px solid #334155;
  border-radius: 10px;
}

.error-state button {
  margin-top: 10px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {

  .views-grid {
    grid-template-columns: 1fr;
  }

  .author-header h1 {
    font-size: 26px;
  }

  .author-meta {
    flex-direction: column;
    gap: 8px;
  }

}

</style>
