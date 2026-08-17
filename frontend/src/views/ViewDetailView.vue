<template>
  <section class="detail-page">
    <div v-if="loading" class="state-card">
      Cargando publicacion...
    </div>

    <div v-else-if="error" class="state-card state-card--error">
      <p>{{ error }}</p>
      <button type="button" @click="loadView">
        Reintentar
      </button>
    </div>

    <article v-else-if="view" class="detail-card">
      <header class="detail-header">
        <div>
          <p class="eyebrow">Detalle</p>
          <h1>{{ sideA?.title ?? 'Publicacion' }}</h1>

          <div class="meta-row">
            <span class="category-badge">
              {{ view.category.name }}
            </span>
            <RouterLink
              class="author-link"
              :to="`/authors/${view.author.id}`"
            >
              Por {{ view.author.name }}
            </RouterLink>
            <span v-if="view.createdAt">
              {{ formattedDate }}
            </span>
          </div>
        </div>

        <div class="header-actions">
          <RouterLink
            v-if="canEdit"
            class="secondary-link"
            :to="`/views/${view.id}/edit`"
          >
            Editar
          </RouterLink>

          <button
            v-if="authStore.isAuthenticated"
            type="button"
            class="secondary-button"
            :disabled="favoriteLoading"
            @click="toggleFavorite"
          >
            {{ isFavorite ? 'Quitar favorito' : 'Guardar favorito' }}
          </button>

          <button
            type="button"
            class="secondary-button"
            @click="shareView"
          >
            Compartir
          </button>
        </div>
      </header>

      <p v-if="shareMessage" class="success-message">
        {{ shareMessage }}
      </p>

      <div v-if="view.hashtags?.length" class="hashtags">
        <span
          v-for="hashtag in view.hashtags"
          :key="hashtag.id"
          class="hashtag"
        >
          #{{ hashtag.name }}
        </span>
      </div>

      <div class="sides-grid">
        <SidePanel
          v-if="sideA"
          title="Postura (Lado A)"
          side-key="a"
          :side="sideA"
          :is-authenticated="authStore.isAuthenticated"
          @react="handleReaction"
        />

        <SidePanel
          v-if="sideB"
          title="Contrapostura (Lado B)"
          side-key="b"
          :side="sideB"
          :is-authenticated="authStore.isAuthenticated"
          @react="handleReaction"
        />
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios'
import {
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
  type PropType,
} from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import type { ViewSide } from '../models/view'
import {
  favoriteView,
  getViewById,
  reactToViewSide,
  unfavoriteView,
} from '../services/viewService'
import { useAuthStore } from '../stores/auth'

const SidePanel = defineComponent({
  name: 'SidePanel',
  props: {
    title: {
      type: String,
      required: true,
    },
    sideKey: {
      type: String as PropType<'a' | 'b'>,
      required: true,
    },
    side: {
      type: Object as PropType<ViewSide>,
      required: true,
    },
    isAuthenticated: {
      type: Boolean,
      required: true,
    },
  },
  emits: {
    react: (_side: 'a' | 'b', _type: 'LIKE' | 'DISLIKE') => true,
  },
  setup(props, { emit }) {
    function getYoutubeEmbedUrl(url: string) {
      const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/
      )

      return match ? `https://www.youtube.com/embed/${match[1]}` : ''
    }

    return () =>
      h('section', { class: 'side-panel' }, [
        h('p', { class: 'side-label' }, props.title),
        h('h2', props.side.title),
        h('p', { class: 'side-description' }, props.side.description),
        h('div', { class: 'reaction-row' }, [
          h(
            'button',
            {
              type: 'button',
              disabled: !props.isAuthenticated,
              class: {
                'reaction-button': true,
                active: props.side.myReaction === 'LIKE',
              },
              onClick: () => emit('react', props.sideKey, 'LIKE'),
            },
            `Me gusta (${props.side.likeCount ?? 0})`
          ),
          h(
            'button',
            {
              type: 'button',
              disabled: !props.isAuthenticated,
              class: {
                'reaction-button': true,
                active: props.side.myReaction === 'DISLIKE',
              },
              onClick: () => emit('react', props.sideKey, 'DISLIKE'),
            },
            `No me gusta (${props.side.dislikeCount ?? 0})`
          ),
        ]),
        !props.isAuthenticated
          ? h(
              'p',
              { class: 'hint' },
              'Inicia sesion para reaccionar a esta postura.'
            )
          : null,
        h('div', { class: 'sources' }, [
          h('h3', 'Fuentes'),
          props.side.sources?.length
            ? props.side.sources.map((source) => {
                const embedUrl =
                  source.type === 'YOUTUBE'
                    ? getYoutubeEmbedUrl(source.url)
                    : ''

                return h('div', { class: 'source-item', key: source.id ?? source.url }, [
                  h('span', { class: 'source-type' }, source.type),
                  h(
                    'a',
                    {
                      href: source.url,
                      target: '_blank',
                      rel: 'noreferrer',
                    },
                    source.label || source.url
                  ),
                  embedUrl
                    ? h('iframe', {
                        class: 'youtube-preview',
                        src: embedUrl,
                        title: source.label || 'Video de YouTube',
                        allow:
                          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                        allowfullscreen: true,
                      })
                    : null,
                ])
              })
            : h('p', { class: 'hint' }, 'No hay fuentes registradas.'),
        ]),
      ])
  },
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const view = ref<Awaited<ReturnType<typeof getViewById>> | null>(null)
const loading = ref(false)
const favoriteLoading = ref(false)
const error = ref('')
const shareMessage = ref('')

const sideA = computed(() =>
  view.value?.sides.find((side) => side.type === 'SIDE')
)

const sideB = computed(() =>
  view.value?.sides.find((side) => side.type === 'COUNTERPART')
)

const formattedDate = computed(() => {
  if (!view.value?.createdAt) return ''
  return new Date(view.value.createdAt).toLocaleDateString()
})

const isFavorite = computed(() => Boolean(view.value?.isFavorite))

const canEdit = computed(() => {
  const user = authStore.user
  if (!user || !view.value) return false

  return (
    user.id === view.value.author.id ||
    authStore.isSuperadmin
  )
})

function saveToHistory() {
  if (!view.value) return

  const stored = localStorage.getItem('lasdoscaras_history')
  const history = stored ? JSON.parse(stored) as unknown[] : []
  const entry = {
    id: view.value.id,
    titulo: sideA.value?.title ?? 'Publicacion',
    categoria: view.value.category.name,
    fechaVista: new Date().toISOString(),
  }

  const next = [
    entry,
    ...history.filter((item) => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        (item as { id: string }).id !== view.value?.id
      )
    }),
  ].slice(0, 20)

  localStorage.setItem('lasdoscaras_history', JSON.stringify(next))
}

async function loadView() {
  loading.value = true
  error.value = ''

  try {
    view.value = await getViewById(String(route.params.id))
    saveToHistory()
  } catch (err) {
    console.error('Error cargando detalle:', err)

    if (axios.isAxiosError(err) && err.response?.status === 404) {
      error.value = 'Esta publicacion no existe o fue eliminada.'
    } else {
      error.value = 'No se pudo cargar el detalle de la publicacion.'
    }
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  if (!view.value || favoriteLoading.value) return

  favoriteLoading.value = true

  try {
    const result = isFavorite.value
      ? await unfavoriteView(view.value.id)
      : await favoriteView(view.value.id)

    view.value = {
      ...view.value,
      isFavorite: result.isFavorite,
    }
  } catch (err) {
    console.error('Error actualizando favorito:', err)
  } finally {
    favoriteLoading.value = false
  }
}

async function handleReaction(
  side: 'a' | 'b',
  type: 'LIKE' | 'DISLIKE'
) {
  if (!authStore.isAuthenticated) {
    router.push({
      name: 'login',
      query: { redirect: route.fullPath },
    })
    return
  }

  if (!view.value) return

  try {
    const result = await reactToViewSide(view.value.id, side, type)
    const sideType = side === 'a' ? 'SIDE' : 'COUNTERPART'

    view.value = {
      ...view.value,
      sides: view.value.sides.map((item) =>
        item.type === sideType
          ? {
              ...item,
              likeCount: result.likeCount,
              dislikeCount: result.dislikeCount,
              myReaction: result.myReaction,
            }
          : item
      ),
    }
  } catch (err) {
    console.error('Error registrando reaccion:', err)
  }
}

async function shareView() {
  if (!view.value) return

  const url = window.location.href
  const title = sideA.value?.title ?? 'Publicacion'

  try {
    if (navigator.share) {
      await navigator.share({ title, url })
      return
    }

    await navigator.clipboard.writeText(url)
    shareMessage.value = 'Enlace copiado.'
    setTimeout(() => {
      shareMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('No se pudo compartir:', err)
  }
}

onMounted(loadView)
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.state-card,
.detail-card {
  padding: 1.5rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.state-card--error {
  color: #991b1b;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.detail-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 38px;
  line-height: 1.1;
}

.meta-row,
.header-actions,
.hashtags,
.reaction-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.meta-row {
  margin-top: 1rem;
  color: var(--text-secondary);
}

.category-badge,
.hashtag,
.source-type {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--accent);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
}

.hashtag,
.source-type {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.author-link,
.secondary-link {
  color: var(--accent-strong);
  font-weight: 700;
  text-decoration: none;
}

.author-link:hover,
.secondary-link:hover {
  text-decoration: underline;
}

.secondary-button,
.reaction-button,
.state-card button {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
  cursor: pointer;
}

.reaction-button.active {
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}

.reaction-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.success-message {
  margin: 1rem 0 0;
  color: #16a34a;
  font-weight: 700;
}

.hashtags {
  margin: 1.25rem 0;
}

.sides-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

:deep(.side-panel) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface-muted);
  overflow: hidden;
}

:deep(.side-label) {
  margin: 0;
  color: var(--accent-strong);
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
}

:deep(.side-panel h2) {
  margin: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

:deep(.side-description) {
  color: var(--text-secondary);
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

:deep(.sources) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:deep(.sources h3) {
  margin: 0;
}

:deep(.source-item) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}

:deep(.source-item a) {
  color: var(--accent-strong);
  overflow-wrap: anywhere;
  word-break: break-word;
}

:deep(.youtube-preview) {
  width: 100%;
  min-height: 260px;
  border: 0;
  border-radius: 12px;
}

:deep(.hint) {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 860px) {
  .detail-header {
    flex-direction: column;
  }

  .sides-grid {
    grid-template-columns: 1fr;
  }
}
</style>
