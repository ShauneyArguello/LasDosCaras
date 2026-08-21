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
            v-if="canUnpublish"
            type="button"
            class="danger-button"
            :disabled="unpublishLoading"
            @click="handleUnpublish"
          >
            {{ unpublishLoading ? 'Despublicando...' : 'Despublicar' }}
          </button>

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

      <p
        v-if="actionMessage"
        :class="
          actionMessageType === 'error'
            ? 'inline-error'
            : 'success-message'
        "
        role="status"
      >
        {{ actionMessage }}
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

      <section
        class="comments-section"
        aria-labelledby="comments-title"
      >
        <header class="comments-header">
          <div>
            <p class="eyebrow">Conversación</p>
            <h2 id="comments-title">Hilos de comentarios</h2>
          </div>

          <span class="thread-count">
            {{ threads.length }}
            {{ threads.length === 1 ? 'hilo' : 'hilos' }}
          </span>
        </header>

        <p class="moderation-notice" role="note">
          Los comentarios pueden quedar pendientes de revisión y están sujetos
          a moderación para mantener una conversación respetuosa.
        </p>

        <form
          v-if="authStore.isAuthenticated"
          class="new-thread-form"
          @submit.prevent="submitNewThread"
        >
          <h3>Crear un hilo nuevo</h3>

          <label for="thread-title">Título del hilo (opcional)</label>
          <input
            id="thread-title"
            v-model="newThreadTitle"
            type="text"
            maxlength="120"
            placeholder="Tema de la conversación"
          />

          <label for="thread-content">Comentario inicial</label>
          <textarea
            id="thread-content"
            v-model="newThreadContent"
            required
            rows="4"
            placeholder="Escribe tu comentario..."
          ></textarea>

          <p
            v-if="threadFormError"
            class="inline-error"
            role="alert"
          >
            {{ threadFormError }}
          </p>

          <button
            type="submit"
            class="primary-button"
            :disabled="creatingThread"
          >
            {{ creatingThread ? 'Enviando...' : 'Crear hilo' }}
          </button>
        </form>

        <p v-else class="login-hint">
          <RouterLink
            :to="{ name: 'login', query: { redirect: route.fullPath } }"
          >
            Inicia sesión
          </RouterLink>
          para crear hilos o agregar comentarios.
        </p>

        <p v-if="threadsLoading" class="comments-state">
          Cargando comentarios...
        </p>

        <div
          v-else-if="threadsError"
          class="comments-state comments-state--error"
        >
          <p>{{ threadsError }}</p>
          <button type="button" @click="loadThreads">
            Reintentar
          </button>
        </div>

        <p
          v-else-if="threads.length === 0"
          class="comments-state"
        >
          Todavía no hay hilos. Sé la primera persona en iniciar la conversación.
        </p>

        <div v-else class="thread-list">
          <details
            v-for="thread in threads"
            :key="thread.id"
            class="thread-card"
          >
            <summary>
              <span>{{ thread.title || 'Conversación sin título' }}</span>
              <small>
                {{ thread.comments?.length ?? 0 }}
                {{ (thread.comments?.length ?? 0) === 1 ? 'comentario' : 'comentarios' }}
              </small>
            </summary>

            <div class="comment-list">
              <article
                v-for="comment in thread.comments"
                :key="comment.id"
                class="comment-card"
              >
                <header class="comment-meta">
                  <strong>{{ comment.user.name }}</strong>
                  <span>{{ formatCommentDate(comment.createdAt) }}</span>
                  <span
                    v-if="isPendingComment(comment.id)"
                    class="pending-badge"
                  >
                    Pendiente de moderación
                  </span>
                </header>

                <p>{{ comment.content }}</p>

                <div
                  v-if="comment.replies?.length"
                  class="reply-list"
                >
                  <article
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="comment-card comment-card--reply"
                  >
                    <header class="comment-meta">
                      <strong>{{ reply.user.name }}</strong>
                      <span>{{ formatCommentDate(reply.createdAt) }}</span>
                      <span
                        v-if="isPendingComment(reply.id)"
                        class="pending-badge"
                      >
                        Pendiente de moderación
                      </span>
                    </header>
                    <p>{{ reply.content }}</p>
                  </article>
                </div>
              </article>
            </div>

            <form
              v-if="authStore.isAuthenticated"
              class="comment-form"
              @submit.prevent="submitComment(thread.id)"
            >
              <label :for="`comment-${thread.id}`">
                Agregar comentario
              </label>
              <textarea
                :id="`comment-${thread.id}`"
                v-model="commentDrafts[thread.id]"
                required
                rows="3"
                placeholder="Escribe un comentario en este hilo..."
              ></textarea>
              <button
                type="submit"
                class="primary-button"
                :disabled="submittingThreadId === thread.id"
              >
                {{
                  submittingThreadId === thread.id
                    ? 'Enviando...'
                    : 'Enviar comentario'
                }}
              </button>
            </form>
          </details>
        </div>
      </section>
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
  reactive,
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
  unpublishView,
} from '../services/viewService'
import {
  createThreadComment,
  createViewThread,
  getViewThreads,
  type CommentThread,
} from '../services/commentService'
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
const unpublishLoading = ref(false)
const error = ref('')
const shareMessage = ref('')
const actionMessage = ref('')
const actionMessageType = ref<'success' | 'error'>('success')

const threads = ref<CommentThread[]>([])
const threadsLoading = ref(false)
const threadsError = ref('')
const creatingThread = ref(false)
const newThreadTitle = ref('')
const newThreadContent = ref('')
const threadFormError = ref('')
const commentDrafts = reactive<Record<string, string>>({})
const submittingThreadId = ref('')
const pendingCommentIds = ref<string[]>([])

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

const canUnpublish = computed(() => {
  return (
    authStore.isSuperadmin &&
    view.value?.status !== 'UNPUBLISHED'
  )
})

function formatCommentDate(date: string): string {
  return new Date(date).toLocaleString('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function isPendingComment(commentId: string): boolean {
  return pendingCommentIds.value.includes(commentId)
}

function markCommentPending(commentId: string) {
  if (!pendingCommentIds.value.includes(commentId)) {
    pendingCommentIds.value = [
      ...pendingCommentIds.value,
      commentId,
    ]
  }
}

function showActionMessage(
  message: string,
  type: 'success' | 'error' = 'success'
) {
  actionMessage.value = message
  actionMessageType.value = type

  window.setTimeout(() => {
    actionMessage.value = ''
  }, 4000)
}

function handleCommentError(
  err: unknown,
  fallback: string
): string {
  if (!axios.isAxiosError(err)) {
    return fallback
  }

  if (err.response?.status === 401) {
    router.push({
      name: 'login',
      query: { redirect: route.fullPath },
    })

    return 'Debes iniciar sesión para comentar.'
  }

  if (
    err.response?.status === 400 ||
    err.response?.status === 422
  ) {
    return err.response.data?.error ?? 'Revisa el contenido del comentario.'
  }

  return fallback
}

async function loadThreads() {
  if (!view.value) return

  threadsLoading.value = true
  threadsError.value = ''

  try {
    threads.value = await getViewThreads(view.value.id)
  } catch (err) {
    console.error('Error cargando hilos:', err)
    threadsError.value = 'No se pudieron cargar los hilos de comentarios.'
  } finally {
    threadsLoading.value = false
  }
}

async function submitNewThread() {
  if (!view.value || creatingThread.value) return

  const content = newThreadContent.value.trim()
  const title = newThreadTitle.value.trim()

  threadFormError.value = ''

  if (!content) {
    threadFormError.value = 'Escribe el comentario inicial del hilo.'
    return
  }

  creatingThread.value = true

  try {
    const thread = await createViewThread(view.value.id, {
      title: title || undefined,
      content,
    })

    threads.value = [
      ...threads.value,
      thread,
    ]

    thread.comments?.forEach((comment) => {
      markCommentPending(comment.id)
    })

    newThreadTitle.value = ''
    newThreadContent.value = ''
    showActionMessage(
      'Hilo enviado. El comentario inicial está pendiente de moderación.'
    )
  } catch (err) {
    console.error('Error creando hilo:', err)
    threadFormError.value = handleCommentError(
      err,
      'No se pudo crear el hilo.'
    )
  } finally {
    creatingThread.value = false
  }
}

async function submitComment(threadId: string) {
  if (!view.value || submittingThreadId.value) return

  const content = (commentDrafts[threadId] ?? '').trim()

  if (!content) {
    showActionMessage(
      'Escribe un comentario antes de enviarlo.',
      'error'
    )
    return
  }

  submittingThreadId.value = threadId

  try {
    const comment = await createThreadComment(
      view.value.id,
      threadId,
      content
    )

    threads.value = threads.value.map((thread) => {
      if (thread.id !== threadId) return thread

      return {
        ...thread,
        comments: [
          ...(thread.comments ?? []),
          comment,
        ],
      }
    })

    markCommentPending(comment.id)
    commentDrafts[threadId] = ''
    showActionMessage(
      'Comentario enviado. Estado: pendiente de moderación.'
    )
  } catch (err) {
    console.error('Error enviando comentario:', err)
    showActionMessage(
      handleCommentError(err, 'No se pudo enviar el comentario.'),
      'error'
    )
  } finally {
    submittingThreadId.value = ''
  }
}

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
    await loadThreads()
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

    const nextFavorites = result.isFavorite
      ? Array.from(new Set([
          ...authStore.favorites,
          view.value.id,
        ]))
      : authStore.favorites.filter(
          id => id !== view.value?.id
        )

    authStore.setFavorites(nextFavorites)
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

async function handleUnpublish() {
  if (!view.value || !canUnpublish.value || unpublishLoading.value) {
    return
  }

  const confirmed = window.confirm(
    '¿Deseas despublicar esta publicación? Dejará de aparecer en el tablero.'
  )

  if (!confirmed) return

  unpublishLoading.value = true

  try {
    await unpublishView(view.value.id)
    view.value = {
      ...view.value,
      status: 'UNPUBLISHED',
    }
    showActionMessage('Publicación despublicada correctamente.')
  } catch (err) {
    console.error('Error despublicando publicación:', err)
    showActionMessage(
      'No se pudo despublicar la publicación.',
      'error'
    )
  } finally {
    unpublishLoading.value = false
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
.danger-button,
.primary-button,
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

.danger-button {
  border-color: #dc2626;
  background: #dc2626;
  color: #ffffff;
}

.primary-button {
  width: fit-content;
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}

.danger-button:disabled,
.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.comments-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.comments-header h2,
.new-thread-form h3 {
  margin: 0;
}

.thread-count,
.pending-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
}

.pending-badge {
  background: #fef3c7;
  color: #92400e;
}

.moderation-notice {
  margin: 0;
  padding: 0.9rem 1rem;
  border: 1px solid #f59e0b;
  border-radius: 10px;
  background: #fffbeb;
  color: #92400e;
  line-height: 1.5;
}

.new-thread-form,
.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-muted);
}

.new-thread-form label,
.comment-form label {
  font-weight: 700;
}

.new-thread-form input,
.new-thread-form textarea,
.comment-form textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
  font: inherit;
  resize: vertical;
}

.inline-error,
.comments-state--error {
  color: #dc2626;
}

.login-hint,
.comments-state {
  margin: 0;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-secondary);
}

.login-hint a {
  color: var(--accent-strong);
  font-weight: 700;
}

.thread-list,
.comment-list,
.reply-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.thread-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-muted);
  overflow: hidden;
}

.thread-card summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  color: var(--text-primary);
  font-weight: 800;
  cursor: pointer;
}

.thread-card[open] summary {
  border-bottom: 1px solid var(--border);
}

.comment-list,
.comment-form {
  margin: 1rem;
}

.comment-card {
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.comment-card p {
  margin: 0.75rem 0 0;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.comment-card--reply {
  margin-left: 1.25rem;
  background: var(--surface-muted);
}

.comment-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.comment-meta strong {
  color: var(--text-primary);
}

@media (max-width: 860px) {
  .detail-header {
    flex-direction: column;
  }

  .sides-grid {
    grid-template-columns: 1fr;
  }

  .comments-header,
  .thread-card summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .comment-card--reply {
    margin-left: 0;
  }
}
</style>
