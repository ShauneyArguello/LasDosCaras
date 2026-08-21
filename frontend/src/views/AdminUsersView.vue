<template>
  <section class="admin-users-page">

    <header class="page-header">
      <div>
        <p class="eyebrow">
          SUPERADMIN
        </p>

        <h1>
          Gestión de usuarios
        </h1>

        <p class="description">
          Administra el estado de los usuarios registrados.
        </p>
      </div>
    </header>

    <section class="search-section">
      <label for="search">
        Buscar usuario
      </label>

      <input
        id="search"
        v-model="search"
        type="text"
        placeholder="Nombre o correo"
        @keyup.enter="searchUsers"
      />

      <button
        type="button"
        @click="searchUsers"
      >
        Buscar
      </button>
    </section>

    <p
      v-if="message"
      class="message"
      :class="messageType"
      role="status"
    >
      {{ message }}
    </p>

    <p v-if="loading">
      Cargando usuarios...
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
        @click="loadUsers"
      >
        Reintentar
      </button>
    </div>

    <p
      v-else-if="users.length === 0"
      class="empty-state"
    >
      No se encontraron usuarios.
    </p>

    <div
      v-else
      class="table-container"
    >
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Fecha de registro</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
          >
            <td>
              {{ user.name }}
            </td>

            <td>
              {{ user.email }}
            </td>

            <td>
              {{ user.role }}
            </td>

            <td>
              <span
                class="status-badge"
                :class="
                  user.status === 'banned'
                    ? 'banned'
                    : 'active'
                "
              >
                {{
                  user.status === 'banned'
                    ? 'Baneado'
                    : 'Activo'
                }}
              </span>
            </td>

            <td>
              {{ formatDate(user.createdAt) }}
            </td>

            <td>
              <button
                v-if="user.status !== 'banned'"
                type="button"
                class="ban-button"
                :disabled="
                  actionLoading === user.id ||
                  isCurrentUser(user.id)
                "
                @click="confirmBan(user)"
              >
                Banear
              </button>

              <button
                v-else
                type="button"
                class="unban-button"
                :disabled="
                  actionLoading === user.id
                "
                @click="confirmUnban(user)"
              >
                Desbanear
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav
      v-if="totalPages > 1"
      class="pagination"
      aria-label="Paginación de usuarios"
    >
      <button
        type="button"
        :disabled="currentPage === 1"
        @click="previousPage"
      >
        Anterior
      </button>

      <span>
        Página {{ currentPage }}
        de {{ totalPages }}
      </span>

      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="nextPage"
      >
        Siguiente
      </button>
    </nav>

  </section>
</template>


<script setup lang="ts">

import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  getAdminUsers,
  banUser,
  unbanUser,
} from '../services/adminUserService'

import type {
  AdminUser,
} from '../models/user'
import {
  CACHE_KEYS,
  CacheService,
} from '../services/cacheService'


const users =
  ref<AdminUser[]>([])

const loading =
  ref(false)

const error =
  ref('')

const search =
  ref('')

const currentPage =
  ref(1)

const totalUsers =
  ref(0)

const pageSize =
  10

const actionLoading =
  ref('')

const message =
  ref('')

const messageType =
  ref<'success' | 'error'>(
    'success'
  )


const totalPages =
  computed(() => {
    return Math.max(
      1,
      Math.ceil(
        totalUsers.value /
        pageSize
      )
    )
  })


function getCurrentUserId():
  string | null {
  return (
    CacheService.getStale<{
      user?: {
        id?: string
      } | null
    }>(CACHE_KEYS.auth)?.user?.id ?? null
  )

}


function isCurrentUser(
  userId: string
): boolean {

  return (
    getCurrentUserId() ===
    userId
  )

}


function formatDate(
  date: string
): string {

  if (!date) {
    return ''
  }

  return new Date(
    date
  ).toLocaleDateString()

}


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


async function loadUsers() {

  loading.value =
    true

  error.value =
    ''

  try {

    const result =
      await getAdminUsers(
        currentPage.value,
        search.value
      )

    users.value =
      result.users

    totalUsers.value =
      result.total

  } catch (err) {

    console.error(
      'Error cargando usuarios:',
      err
    )

    error.value =
      'No se pudieron cargar los usuarios.'

  } finally {

    loading.value =
      false

  }

}


async function searchUsers() {

  currentPage.value =
    1

  await loadUsers()

}


async function confirmBan(
  user: AdminUser
) {

  if (
    isCurrentUser(user.id)
  ) {

    showMessage(
      'No puedes banear tu propio usuario.',
      'error'
    )

    return
  }

  const confirmed =
    window.confirm(
      `¿Deseas banear a ${user.name}?`
    )

  if (!confirmed) {
    return
  }

  actionLoading.value =
    user.id

  try {

    await banUser(
      user.id
    )

    showMessage(
      'Usuario baneado correctamente.',
      'success'
    )

    await loadUsers()

  } catch (err) {

    console.error(
      'Error baneando usuario:',
      err
    )

    showMessage(
      'No se pudo banear el usuario.',
      'error'
    )

  } finally {

    actionLoading.value =
      ''

  }

}


async function confirmUnban(
  user: AdminUser
) {

  const confirmed =
    window.confirm(
      `¿Deseas desbanear a ${user.name}?`
    )

  if (!confirmed) {
    return
  }

  actionLoading.value =
    user.id

  try {

    await unbanUser(
      user.id
    )

    showMessage(
      'Usuario desbaneado correctamente.',
      'success'
    )

    await loadUsers()

  } catch (err) {

    console.error(
      'Error desbaneando usuario:',
      err
    )

    showMessage(
      'No se pudo desbanear el usuario.',
      'error'
    )

  } finally {

    actionLoading.value =
      ''

  }

}


async function previousPage() {

  if (
    currentPage.value === 1
  ) {
    return
  }

  currentPage.value--

  await loadUsers()

}


async function nextPage() {

  if (
    currentPage.value >=
    totalPages.value
  ) {
    return
  }

  currentPage.value++

  await loadUsers()

}


onMounted(() => {
  loadUsers()
})

</script>


<style scoped>

.admin-users-page {
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


.search-section {
  display: flex;
  align-items: end;
  gap: 12px;
  margin-bottom: 24px;
}


.search-section label {
  display: none;
}


.search-section input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}


.search-section button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  cursor: pointer;
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
  background: #f8fafc;
}


.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
}


.status-badge.active {
  background: #dcfce7;
  color: #166534;
}


.status-badge.banned {
  background: #fee2e2;
  color: #991b1b;
}


.ban-button,
.unban-button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}


.ban-button {
  background: #dc2626;
}


.unban-button {
  background: #16a34a;
}


.ban-button:disabled,
.unban-button:disabled {
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
  opacity: 0.5;
  cursor: not-allowed;
}


@media (max-width: 768px) {

  .search-section {
    align-items: stretch;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 26px;
  }

}

</style>
