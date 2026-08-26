<template>
  <section class="profile-page">

    <header class="page-header">
      <p class="eyebrow">
        USUARIO
      </p>

      <h1>
        Mi perfil
      </h1>

      <p class="description">
        Consulta tus datos, publicaciones, favoritos e historial.
      </p>
    </header>

    <div
      v-if="message"
      class="message"
      :class="messageType"
      role="status"
    >
      {{ message }}
    </div>

    <p v-if="loading">
      Cargando perfil...
    </p>

    <div
      v-else-if="error"
      class="error-state"
    >
      <p>
        {{ error }}
      </p>

      <button
        type="button"
        @click="loadProfile"
      >
        Reintentar
      </button>
    </div>

    <template v-else>

      <section class="profile-card">

        <h2>
          Datos del usuario
        </h2>

        <div class="profile-grid">

          <div>
            <span class="label">
              Nombre
            </span>

            <p>
              {{ userName }}
            </p>
          </div>

          <div>
            <span class="label">
              Correo
            </span>

            <p>
              {{ currentUser?.email || 'No disponible' }}
            </p>
          </div>

          <div>
            <span class="label">
              Rol
            </span>

            <p>
              {{ userRole }}
            </p>
          </div>

          <div>
            <span class="label">
              Fecha de registro
            </span>

            <p>
              {{ userRegistrationDate }}
            </p>
          </div>

        </div>

        <button
          type="button"
          class="logout-button"
          @click="logout"
        >
          Cerrar sesión
        </button>

      </section>

      <section class="tabs">

        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'publications' }"
          @click="activeTab = 'publications'"
        >
          Mis Publicaciones
        </button>

        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'favorites' }"
          @click="activeTab = 'favorites'"
        >
          Mis Favoritos
        </button>

        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          Historial
        </button>

      </section>

      <section
        v-if="activeTab === 'publications'"
        class="content-section"
      >

        <h2>
          Mis Publicaciones
        </h2>

        <p
          v-if="myViews.length === 0"
          class="empty-state"
        >
          No tienes publicaciones registradas.
        </p>

        <div
          v-else
          class="card-list"
        >

          <article
            v-for="view in myViews"
            :key="view.id"
            class="view-card"
          >

            <div>

              <h3>
                {{ getViewTitle(view) }}
              </h3>

              <p>
                Categoría:
                {{ view.category.name }}
              </p>

              <p>
                Fecha:
                {{ formatDate(view.createdAt) }}
              </p>

              <span
                v-if="view.status"
                class="status-badge"
                :class="
                  view.status === 'PUBLISHED'
                    ? 'published'
                    : 'unpublished'
                "
              >
                {{
                  view.status === 'PUBLISHED'
                    ? 'Publicada'
                    : 'Despublicada'
                }}
              </span>

            </div>

            <div class="actions">

              <RouterLink
                :to="`/views/${view.id}`"
                class="detail-button"
              >
                Ver detalle
              </RouterLink>

              <RouterLink
                :to="`/views/${view.id}/edit`"
                class="edit-button"
              >
                Editar
              </RouterLink>

            </div>

          </article>

        </div>

      </section>

      <section
        v-if="activeTab === 'favorites'"
        class="content-section"
      >

        <h2>
          Mis Favoritos
        </h2>

        <p
          v-if="favoriteViews.length === 0"
          class="empty-state"
        >
          No tienes publicaciones favoritas.
        </p>

        <div
          v-else
          class="card-list"
        >

          <article
            v-for="view in favoriteViews"
            :key="view.id"
            class="view-card"
          >

            <div>

              <h3>
                {{ getViewTitle(view) }}
              </h3>

              <p>
                Autor:
                {{ view.author.name }}
              </p>

              <p>
                Categoría:
                {{ view.category.name }}
              </p>

            </div>

            <div class="actions">

              <RouterLink
                :to="`/views/${view.id}`"
                class="detail-button"
              >
                Ver detalle
              </RouterLink>

              <button
                type="button"
                class="remove-button"
                :disabled="removingFavoriteId === view.id"
                @click="removeFavorite(view.id)"
              >
                Quitar favorito
              </button>

            </div>

          </article>

        </div>

      </section>

      <section
        v-if="activeTab === 'history'"
        class="content-section"
      >

        <div class="section-header">

          <h2>
            Historial
          </h2>

          <button
            v-if="history.length > 0"
            type="button"
            class="clear-button"
            @click="clearHistory"
          >
            Limpiar historial
          </button>

        </div>

        <p
          v-if="history.length === 0"
          class="empty-state"
        >
          No hay publicaciones en el historial.
        </p>

        <div
          v-else
          class="card-list"
        >

          <RouterLink
            v-for="item in history"
            :key="`${item.id}-${item.fechaVista}`"
            :to="`/views/${item.id}`"
            class="history-card"
          >

            <strong>
              {{ item.titulo }}
            </strong>

            <span>
              {{ item.categoria }}
            </span>

            <span>
              {{ formatDate(item.fechaVista) }}
            </span>

          </RouterLink>

        </div>

      </section>

    </template>

  </section>
</template>


<script setup lang="ts">

import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  getCurrentUser,
  getFavoriteIds,
  type AuthUser,
} from '../services/authService'

import {
  getViewById,
  getViews,
  unfavoriteView,
} from '../services/viewService'

import type {
  View,
} from '../models/view'

import {
  useAuthStore,
} from '../stores/auth'
import {
  CACHE_KEYS,
  CacheService,
} from '../services/cacheService'


interface HistoryItem {
  id: string
  titulo: string
  categoria: string
  fechaVista: string
}


const router =
  useRouter()

const authStore =
  useAuthStore()


const currentUser =
  ref<AuthUser | null>(null)

const myViews =
  ref<View[]>([])

const favoriteViews =
  ref<View[]>([])

const history =
  ref<HistoryItem[]>([])


const loading =
  ref(false)

const error =
  ref('')

const message =
  ref('')

const messageType =
  ref<'success' | 'error'>(
    'success'
  )

const activeTab =
  ref<
    'publications' |
    'favorites' |
    'history'
  >('publications')

const removingFavoriteId =
  ref('')


const userName =
  computed(() => {
    return (
      currentUser.value?.name ??
      currentUser.value?.nombre ??
      'Usuario'
    )
  })


const userRole =
  computed(() => {

    const role =
      currentUser.value?.role ??
      currentUser.value?.rol ??
      ''

    if (
      role.toUpperCase() ===
      'SUPERADMIN'
    ) {
      return 'Super Admin'
    }

    return 'Usuario'
  })


const userRegistrationDate =
  computed(() => {
    return formatDate(
      currentUser.value?.createdAt ??
      currentUser.value?.fechaRegistro
    )
  })


function showMessage(
  text: string,
  type: 'success' | 'error'
) {

  message.value =
    text

  messageType.value =
    type

  setTimeout(() => {
    message.value = ''
  }, 3000)
}


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


function loadHistory() {
  history.value =
    CacheService.getStale<HistoryItem[]>(
      CACHE_KEYS.history
    ) ?? []
}


async function loadFavoriteViews() {

  const favoriteIds =
    await getFavoriteIds()

  authStore.setFavorites(
    favoriteIds
  )

  const results =
    await Promise.allSettled(
      favoriteIds.map(
        id => getViewById(id)
      )
    )

  favoriteViews.value =
    results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<View> =>
          result.status === 'fulfilled'
      )
      .map(
        result =>
          result.value
      )
}


async function loadProfile() {

  loading.value =
    true

  error.value =
    ''

  try {

    currentUser.value =
      await getCurrentUser()

    const myViewsResponse =
      await getViews({
        autor: 'me',
        sort: 'recent',
        page: 1,
        limit: 100,
      })

    myViews.value =
      myViewsResponse.views

    await loadFavoriteViews()

    loadHistory()

  } catch (err) {

    console.error(
      'Error cargando perfil:',
      err
    )

    error.value =
      'No se pudo cargar la información del perfil.'

  } finally {

    loading.value =
      false

  }
}


async function removeFavorite(
  viewId: string
) {

  removingFavoriteId.value =
    viewId

  try {

    await unfavoriteView(
      viewId
    )

    favoriteViews.value =
      favoriteViews.value.filter(
        view =>
          view.id !== viewId
      )

    authStore.setFavorites(
      authStore.favorites.filter(
        id =>
          id !== viewId
      )
    )

    showMessage(
      'Publicación eliminada de favoritos.',
      'success'
    )

  } catch (err) {

    console.error(
      'Error eliminando favorito:',
      err
    )

    showMessage(
      'No se pudo eliminar la publicación de favoritos.',
      'error'
    )

  } finally {

    removingFavoriteId.value =
      ''

  }
}


function clearHistory() {

  const confirmed =
    window.confirm(
      '¿Deseas limpiar todo el historial?'
    )

  if (!confirmed) {
    return
  }

  history.value =
    []

  CacheService.remove(CACHE_KEYS.history)

  showMessage(
    'Historial eliminado correctamente.',
    'success'
  )
}


function logout() {

  authStore.logout()

  router.push(
    '/board'
  )
}


onMounted(() => {
  loadProfile()
})

</script>


<style scoped>

.profile-page {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
}

.eyebrow {
  margin-bottom: 6px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: bold;
}

.description {
  color: #64748b;
}

.profile-card,
.content-section {
  margin-bottom: 24px;
  padding: 20px;
  border: 1px solid #334155;
  border-radius: 12px;
}

.profile-card h2,
.content-section h2 {
  margin-top: 0;
}

.profile-grid {
  display: grid;
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
  gap: 20px;
  margin-bottom: 20px;
}

.label {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
}

.logout-button {
  padding: 9px 14px;
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: white;
  cursor: pointer;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 16px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.tab-button.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.view-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  border: 1px solid #334155;
  border-radius: 10px;
}

.view-card h3 {
  margin-top: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-button,
.edit-button,
.remove-button,
.clear-button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  cursor: pointer;
}

.detail-button {
  background: #2563eb;
}

.edit-button {
  background: #64748b;
}

.remove-button,
.clear-button {
  background: #dc2626;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.published {
  background: #dcfce7;
  color: #166534;
}

.status-badge.unpublished {
  background: #fee2e2;
  color: #991b1b;
}

.history-card {
  display: grid;
  grid-template-columns:
    2fr 1fr 1fr;
  gap: 16px;
  padding: 14px;
  border: 1px solid #334155;
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.message {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
}

.message.success {
  background: #dcfce7;
  color: #166534;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
}

.error-state,
.empty-state {
  padding: 16px;
  border: 1px solid #334155;
  border-radius: 10px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-direction: column;
  }

  .view-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .history-card {
    grid-template-columns: 1fr;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

}

</style>
