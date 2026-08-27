<template>
  <section class="admin-moderation-page">

    <header class="page-header">
      <p class="eyebrow">
        SUPERADMIN
      </p>

      <h1>
        Moderación de contenido
      </h1>

      <p class="description">
        Administra el estado de las publicaciones del sistema.
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

    <section class="filters">
      <label for="status-filter">
        Estado
      </label>

      <select
        id="status-filter"
        v-model="selectedStatus"
        @change="changeStatus"
      >
        <option value="">
          Todas
        </option>

        <option value="PUBLISHED">
          Publicadas
        </option>

        <option value="UNPUBLISHED">
          Despublicadas
        </option>
      </select>
    </section>

    <div
      v-if="loading"
      class="loading-state"
      role="status"
      aria-live="polite"
    >
      <span class="spinner" aria-hidden="true"></span>
      <span>Cargando publicaciones...</span>
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
        @click="loadViews"
      >
        Reintentar
      </button>
    </div>

    <p
      v-else-if="views.length === 0"
      class="empty-state"
    >
      No hay publicaciones para mostrar.
    </p>

    <div
      v-else
      class="table-container"
    >
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Likes</th>
            <th>Dislikes</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="view in views"
            :key="view.id"
          >
            <td>
              {{ getViewTitle(view) }}
            </td>

            <td>
              {{ view.author.name }}
            </td>

            <td>
              {{ view.category.name }}
            </td>

            <td>
              {{ formatDate(view.createdAt) }}
            </td>

            <td>
              <span
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
            </td>

            <td>
              {{ view.totalLikes }}
            </td>

            <td>
              {{ view.totalDislikes }}
            </td>

            <td class="actions">

              <RouterLink
                :to="`/views/${view.id}`"
                class="detail-button"
              >
                Ver detalle
              </RouterLink>

              <button
                v-if="view.status === 'PUBLISHED'"
                type="button"
                class="unpublish-button"
                :disabled="changingId === view.id"
                @click="confirmUnpublish(view)"
              >
                Despublicar
              </button>

              <button
                v-else
                type="button"
                class="publish-button"
                :disabled="changingId === view.id"
                @click="confirmPublish(view)"
              >
                Republicar
              </button>

            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="totalPages > 1"
      class="pagination"
    >
      <button
        type="button"
        :disabled="page === 1 || loading"
        @click="previousPage"
      >
        Anterior
      </button>

      <span>
        Página {{ page }} de {{ totalPages }}
      </span>

      <button
        type="button"
        :disabled="page === totalPages || loading"
        @click="nextPage"
      >
        Siguiente
      </button>
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
  type AdminView,
  type AdminViewStatus,
  getAdminViews,
  publishView,
  unpublishView,
} from '../services/adminViewService'


const views =
  ref<AdminView[]>([])

const loading =
  ref(false)

const error =
  ref('')

const message =
  ref('')

const messageType =
  ref<'success' | 'error'>('success')

const selectedStatus =
  ref<'' | AdminViewStatus>('')

const page =
  ref(1)

const limit =
  ref(20)

const total =
  ref(0)

const changingId =
  ref('')


const totalPages =
  computed(() => {
    return Math.max(
      1,
      Math.ceil(total.value / limit.value)
    )
  })


function showMessage(
  text: string,
  type: 'success' | 'error'
) {
  message.value = text
  messageType.value = type

  setTimeout(() => {
    message.value = ''
  }, 3000)
}


async function loadViews() {

  loading.value = true
  error.value = ''

  try {

    const result =
      await getAdminViews(
        selectedStatus.value || undefined,
        page.value,
        limit.value
      )

    views.value =
      result.views

    total.value =
      result.total

  } catch (err) {

    console.error(
      'Error cargando publicaciones:',
      err
    )

    error.value =
      'No se pudieron cargar las publicaciones.'

  } finally {

    loading.value = false

  }
}


function getViewTitle(
  view: AdminView
): string {

  const side =
    view.sides.find(
      side => side.type === 'SIDE'
    )

  return side?.title ??
    'Sin título'
}


function formatDate(
  date: string
): string {

  return new Date(date)
    .toLocaleDateString('es-CR')
}


async function confirmUnpublish(
  view: AdminView
) {

  const confirmed =
    window.confirm(
      `¿Deseas despublicar "${getViewTitle(view)}"?`
    )

  if (!confirmed) {
    return
  }

  changingId.value =
    view.id

  try {

    await unpublishView(
      view.id
    )

    view.status =
      'UNPUBLISHED'

    showMessage(
      'Publicación despublicada correctamente.',
      'success'
    )

  } catch (err) {

    console.error(
      'Error despublicando publicación:',
      err
    )

    showMessage(
      'No se pudo despublicar la publicación.',
      'error'
    )

  } finally {

    changingId.value =
      ''

  }
}


async function confirmPublish(
  view: AdminView
) {

  const confirmed =
    window.confirm(
      `¿Deseas republicar "${getViewTitle(view)}"?`
    )

  if (!confirmed) {
    return
  }

  changingId.value =
    view.id

  try {

    await publishView(
      view.id
    )

    view.status =
      'PUBLISHED'

    showMessage(
      'Publicación republicada correctamente.',
      'success'
    )

  } catch (err) {

    console.error(
      'Error republicando publicación:',
      err
    )

    showMessage(
      'No se pudo republicar la publicación.',
      'error'
    )

  } finally {

    changingId.value =
      ''

  }
}


function changeStatus() {
  page.value = 1
  loadViews()
}


function previousPage() {

  if (page.value <= 1) {
    return
  }

  page.value--
  loadViews()
}


function nextPage() {

  if (page.value >= totalPages.value) {
    return
  }

  page.value++
  loadViews()
}


onMounted(() => {
  loadViews()
})

</script>


<style scoped>

.admin-moderation-page {
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

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.filters label {
  font-weight: 600;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
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

.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

th {
  background: var(--surface-muted);
  color: var(--text-primary);
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

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-button,
.unpublish-button,
.publish-button {
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

.unpublish-button {
  background: #dc2626;
}

.publish-button {
  background: #16a34a;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination button {
  padding: 8px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {

  .page-header h1 {
    font-size: 26px;
  }

  .filters {
    align-items: flex-start;
    flex-direction: column;
  }

  .actions {
    flex-direction: column;
  }

}

</style>
