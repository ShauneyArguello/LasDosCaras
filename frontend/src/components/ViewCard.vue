<template>
  <article class="view-card">
    <div class="view-header">

      <RouterLink
        :to="`/categories/${view.category.id}`"
        class="category-badge"
      >
        {{ view.category.name }}
      </RouterLink>

      <span class="date">
        {{ formattedDate }}
      </span>
    </div>

    <h2>
      {{ sideA?.title || 'Sin título' }}
    </h2>

    <RouterLink
      :to="`/authors/${view.author.id}`"
      class="author-link"
    >
      Por {{ view.author.name }}
    </RouterLink>

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

    <p class="excerpt">
      {{ excerpt }}
    </p>

    <div class="reaction-summary" aria-label="Reacciones por perspectiva">
      <span><strong>Lado A</strong> 👍 {{ sideA?.likeCount ?? 0 }} · 👎 {{ sideA?.dislikeCount ?? 0 }}</span>
      <span><strong>Lado B</strong> 👍 {{ sideB?.likeCount ?? 0 }} · 👎 {{ sideB?.dislikeCount ?? 0 }}</span>
    </div>

    <div class="card-actions">

      <button
        v-if="authStore.isAuthenticated"
        type="button"
        class="favorite-button"
        :class="{ active: isFavorite }"
        :disabled="favoriteLoading"
        @click="toggleFavorite"
        :aria-label="
          isFavorite
            ? 'Quitar de favoritos'
            : 'Agregar a favoritos'
        "
      >
        {{ isFavorite ? '♥' : '♡' }}
      </button>

      <button
        type="button"
        class="share-button"
        @click="shareView"
      >
        Compartir
      </button>

      <RouterLink
        :to="`/views/${view.id}`"
        class="detail-button"
      >
        Ver detalle
      </RouterLink>

    </div>

    <p
      v-if="shareMessage"
      class="share-message"
    >
      {{ shareMessage }}
    </p>

  </article>
</template>


<script setup lang="ts">

import {
  computed,
  onMounted,
  ref,
} from 'vue'

import type {
  View,
} from '../models/view'

import {
  favoriteView,
  unfavoriteView,
} from '../services/viewService'

import {
  useAuthStore,
} from '../stores/auth'
import {
  CACHE_KEYS,
  CacheService,
} from '../services/cacheService'
import {
  useNotificationStore,
} from '../stores/notifications'


const props = defineProps<{
  view: View
}>()


const authStore =
  useAuthStore()

const notifications =
  useNotificationStore()


const favoriteLoading =
  ref(false)

const shareMessage =
  ref('')


const isFavorite =
  ref(
    props.view.isFavorite ??
    false
  )


const sideA =
  computed(() =>
    props.view.sides.find(
      side =>
        side.type === 'SIDE'
    )
  )


const sideB =
  computed(() =>
    props.view.sides.find(
      side =>
        side.type === 'COUNTERPART'
    )
  )


const formattedDate =
  computed(() => {

    if (!props.view.createdAt) {
      return ''
    }

    return new Date(
      props.view.createdAt
    ).toLocaleDateString()

  })

const excerpt = computed(() => {
  const description = sideA.value?.description?.trim()

  if (!description) return 'Sin descripción disponible.'

  return description.length > 180
    ? `${description.slice(0, 180).trim()}…`
    : description
})


function getStoredFavorites():
  string[] {
  return (
    CacheService.getStale<string[]>(
      CACHE_KEYS.favorites
    ) ?? []
  )

}


function saveStoredFavorites(
  favorites: string[]
) {
  authStore.setFavorites(favorites)

}


function addFavoriteToStorage() {

  const favorites =
    getStoredFavorites()

  if (
    !favorites.includes(
      props.view.id
    )
  ) {
    favorites.push(
      props.view.id
    )
  }

  saveStoredFavorites(
    favorites
  )

}


function removeFavoriteFromStorage() {

  const favorites =
    getStoredFavorites()
      .filter(
        id =>
          id !== props.view.id
      )

  saveStoredFavorites(
    favorites
  )

}


async function toggleFavorite() {

  if (
    !authStore.isAuthenticated ||
    favoriteLoading.value
  ) {
    return
  }

  favoriteLoading.value =
    true

  try {

    if (isFavorite.value) {

      await unfavoriteView(
        props.view.id
      )

      isFavorite.value =
        false

      removeFavoriteFromStorage()

      notifications.notify(
        'Publicación eliminada de favoritos.',
        'success'
      )

    } else {

      await favoriteView(
        props.view.id
      )

      isFavorite.value =
        true

      addFavoriteToStorage()

      notifications.notify(
        'Publicación agregada a favoritos.',
        'success'
      )

    }

  } catch (error) {

    console.error(
      'Error actualizando favorito:',
      error
    )

    notifications.notify(
      error instanceof Error
        ? error.message
        : 'No se pudo actualizar el favorito.',
      'error'
    )

  } finally {

    favoriteLoading.value =
      false

  }

}


async function shareView() {

  const url =
    `${window.location.origin}/views/${props.view.id}`

  const title =
    sideA.value?.title ||
    'Publicación'

  try {

    if (navigator.share) {

      await navigator.share({
        title,
        url,
      })

      return
    }

    await navigator.clipboard.writeText(
      url
    )

    shareMessage.value =
      'Enlace copiado'

    notifications.notify(
      'Enlace copiado.',
      'success'
    )

    setTimeout(() => {
      shareMessage.value = ''
    }, 2000)

  } catch (error) {

    console.error(
      'No se pudo compartir:',
      error
    )

    notifications.notify(
      'No se pudo compartir la publicación.',
      'error'
    )

  }

}


onMounted(() => {

  if (
    !authStore.isAuthenticated
  ) {
    return
  }

  const favorites =
    getStoredFavorites()

  if (
    props.view.isFavorite ||
    favorites.includes(
      props.view.id
    )
  ) {

    isFavorite.value =
      true

    addFavoriteToStorage()

  }

})

</script>


<style scoped>

.view-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid #26344d;
  border-radius: 16px;
  background: #121c2f;
  overflow: hidden;
}


.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 0;
}


.category-badge {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: #2563eb;
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  overflow-wrap: anywhere;
}


.category-badge:hover {
  background: #1d4ed8;
}


.date {
  flex: 0 0 auto;
  color: #94a3b8;
  font-size: 0.85rem;
}


.view-card h2 {
  margin: 0;
  color: #f8fafc;
  overflow-wrap: anywhere;
  word-break: break-word;
}


.author-link {
  width: fit-content;
  max-width: 100%;
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
  overflow-wrap: anywhere;
}


.author-link:hover {
  text-decoration: underline;
}


.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}


.hashtag {
  max-width: 100%;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: #1e293b;
  color: #93c5fd;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}


.excerpt {
  margin: 0;
  color: #cbd5e1;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.55;
}

.reaction-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.reaction-summary span {
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  color: #cbd5e1;
  background: #17233a;
}


.card-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}


.favorite-button,
.share-button {
  min-height: 42px;
  padding: 0.65rem 1rem;
  border: 1px solid #334155;
  border-radius: 10px;
  background: #1e293b;
  color: white;
  cursor: pointer;
}


.favorite-button {
  font-size: 1.5rem;
  line-height: 1;
}


.favorite-button.active {
  color: #ef4444;
}


.favorite-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.detail-button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  font-weight: 700;
}


.share-message {
  margin: 0;
  color: #86efac;
  font-size: 0.85rem;
}


@media (max-width: 600px) {

  .view-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .detail-button,
  .share-button {
    width: 100%;
    box-sizing: border-box;
  }

  .favorite-button {
    align-self: flex-start;
  }

}

</style>
