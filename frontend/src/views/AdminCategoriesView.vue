<template>
  <section class="admin-categories-page">

    <header class="page-header">
      <p class="eyebrow">
        SUPERADMIN
      </p>

      <h1>
        Gestión de categorías
      </h1>

      <p class="description">
        Crea, edita y elimina las categorías del sistema.
      </p>
    </header>

    <!-- Mensaje -->
    <p
      v-if="message"
      class="message"
      :class="messageType"
      role="status"
    >
      {{ message }}
    </p>

    <!-- Formulario -->
    <section class="category-form">

      <h2>
        {{
          editingCategoryId
            ? 'Editar categoría'
            : 'Nueva categoría'
        }}
      </h2>

      <div class="form-group">
        <label for="name">
          Nombre
        </label>

        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="Nombre de la categoría"
        />
      </div>

      <div class="form-group">
        <label for="description">
          Descripción
        </label>

        <textarea
          id="description"
          v-model="description"
          rows="3"
          placeholder="Descripción de la categoría"
        ></textarea>
      </div>

      <div class="form-actions">

        <button
          type="button"
          class="save-button"
          :disabled="saving"
          @click="saveCategory"
        >
          {{
            editingCategoryId
              ? 'Guardar cambios'
              : 'Crear categoría'
          }}
        </button>

        <button
          v-if="editingCategoryId"
          type="button"
          class="cancel-button"
          @click="cancelEdit"
        >
          Cancelar
        </button>

      </div>

    </section>

    <!-- Cargando -->
    <p v-if="loading">
      Cargando categorías...
    </p>

    <!-- Error -->
    <div
      v-else-if="error"
      class="error-state"
    >
      <p>
        {{ error }}
      </p>

      <button
        type="button"
        @click="loadCategories"
      >
        Reintentar
      </button>
    </div>

    <!-- Sin categorías -->
    <p
      v-else-if="categories.length === 0"
      class="empty-state"
    >
      No hay categorías registradas.
    </p>

    <!-- Tabla -->
    <div
      v-else
      class="table-container"
    >
      <table>

        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Publicaciones</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="category in categories"
            :key="category.id"
          >
            <td>
              {{ category.name }}
            </td>

            <td>
              {{
                category.description ||
                'Sin descripción'
              }}
            </td>

            <td>
              {{ category.viewsCount ?? 0 }}
            </td>

            <td>
              <span
                class="status-badge"
                :class="
                  category.active === false
                    ? 'inactive'
                    : 'active'
                "
              >
                {{
                  category.active === false
                    ? 'Inactiva'
                    : 'Activa'
                }}
              </span>
            </td>

            <td class="actions">

              <button
                type="button"
                class="edit-button"
                @click="startEdit(category)"
              >
                Editar
              </button>

              <button
                type="button"
                class="delete-button"
                :disabled="
                  deletingId === category.id
                "
                @click="confirmDelete(category)"
              >
                Eliminar
              </button>

            </td>

          </tr>

        </tbody>

      </table>
    </div>

  </section>
</template>


<script setup lang="ts">

import {
  onMounted,
  ref,
} from 'vue'

import axios from 'axios'

import type {
  Category,
} from '../models/category'

import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/adminCategoryService'


const categories =
  ref<Category[]>([])

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


const name =
  ref('')

const description =
  ref('')

const editingCategoryId =
  ref<string | null>(null)

const saving =
  ref(false)

const deletingId =
  ref('')


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


async function loadCategories() {

  loading.value =
    true

  error.value =
    ''

  try {

    categories.value =
      await getAdminCategories()

  } catch (err) {

    console.error(
      'Error cargando categorías:',
      err
    )

    error.value =
      'No se pudieron cargar las categorías.'

  } finally {

    loading.value =
      false

  }
}


function categoryNameExists():
  boolean {

  const normalizedName =
    name.value
      .trim()
      .toLowerCase()

  return categories.value.some(
    category =>
      category.name
        .trim()
        .toLowerCase() ===
        normalizedName &&
      category.id !==
        editingCategoryId.value
  )
}


async function saveCategory() {

  const cleanName =
    name.value.trim()

  const cleanDescription =
    description.value.trim()


  if (!cleanName) {

    showMessage(
      'El nombre de la categoría es obligatorio.',
      'error'
    )

    return
  }


  if (categoryNameExists()) {

    showMessage(
      'Ya existe una categoría con ese nombre.',
      'error'
    )

    return
  }


  saving.value =
    true


  try {

    if (editingCategoryId.value) {

      await updateCategory(
        editingCategoryId.value,
        cleanName,
        cleanDescription
      )

      showMessage(
        'Categoría actualizada correctamente.',
        'success'
      )

    } else {

      await createCategory(
        cleanName,
        cleanDescription
      )

      showMessage(
        'Categoría creada correctamente.',
        'success'
      )

    }


    clearForm()

    await loadCategories()

  } catch (err) {

    console.error(
      'Error guardando categoría:',
      err
    )


    if (
      axios.isAxiosError(err) &&
      err.response?.status === 409
    ) {

      showMessage(
        'Ya existe una categoría con ese nombre.',
        'error'
      )

    } else {

      showMessage(
        'No se pudo guardar la categoría.',
        'error'
      )

    }

  } finally {

    saving.value =
      false

  }
}


function startEdit(
  category: Category
) {

  editingCategoryId.value =
    category.id

  name.value =
    category.name

  description.value =
    category.description ?? ''

}


function cancelEdit() {

  clearForm()

}


function clearForm() {

  editingCategoryId.value =
    null

  name.value =
    ''

  description.value =
    ''

}


async function confirmDelete(
  category: Category
) {

  const confirmed =
    window.confirm(
      `¿Deseas eliminar la categoría "${category.name}"?`
    )


  if (!confirmed) {
    return
  }


  deletingId.value =
    category.id


  try {

    await deleteCategory(
      category.id
    )


    showMessage(
      'Categoría eliminada correctamente.',
      'success'
    )


    await loadCategories()

  } catch (err) {

    console.error(
      'Error eliminando categoría:',
      err
    )


    if (
      axios.isAxiosError(err) &&
      err.response?.status === 409
    ) {

      showMessage(
        'No se puede eliminar porque tiene publicaciones asociadas.',
        'error'
      )

    } else {

      showMessage(
        'No se pudo eliminar la categoría.',
        'error'
      )

    }

  } finally {

    deletingId.value =
      ''

  }
}


onMounted(() => {
  loadCategories()
})

</script>


<style scoped>

.admin-categories-page {
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


.category-form {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}


.category-form h2 {
  margin-top: 0;
}


.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}


.form-group label {
  font-weight: 600;
}


.form-group input,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}


.form-actions {
  display: flex;
  gap: 10px;
}


.save-button,
.cancel-button,
.edit-button,
.delete-button {
  padding: 9px 14px;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}


.save-button {
  background: #2563eb;
}


.cancel-button {
  background: #64748b;
}


.edit-button {
  background: #2563eb;
}


.delete-button {
  background: #dc2626;
}


button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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


.actions {
  display: flex;
  gap: 8px;
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


.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
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


@media (max-width: 768px) {

  .form-actions {
    flex-direction: column;
  }

  .actions {
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 26px;
  }

}

</style>