<template>
  <section class="admin-categories-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">
          SUPERADMIN
        </p>

        <h1>
          Gestión de categorías
        </h1>

        <p class="description">
          Crea, edita y administra las categorías del sistema.
        </p>
      </div>

      <button
        type="button"
        class="primary-button"
        @click="startCreate"
      >
        Nueva Categoría
      </button>
    </header>

    <p
      v-if="message"
      class="message"
      :class="messageType"
      role="status"
    >
      {{ message }}
    </p>

    <section
      v-if="isFormOpen"
      class="category-form"
      aria-labelledby="category-form-title"
    >
      <div class="form-header">
        <h2 id="category-form-title">
          {{
            editingCategoryId
              ? 'Editar categoría'
              : 'Nueva categoría'
          }}
        </h2>

        <button
          type="button"
          class="ghost-button"
          @click="cancelForm"
        >
          Cerrar
        </button>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="name">
            Nombre
          </label>

          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Nombre de la categoría"
            :aria-invalid="Boolean(nameError)"
            :aria-describedby="nameError ? 'name-error' : undefined"
            @input="nameError = ''"
          />

          <p
            v-if="nameError"
            id="name-error"
            class="field-error"
          >
            {{ nameError }}
          </p>
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

      </div>

      <div class="form-actions">
        <button
          type="button"
          class="save-button"
          :disabled="saving"
          @click="saveCategory"
        >
          {{
            saving
              ? 'Guardando...'
              : editingCategoryId
                ? 'Guardar cambios'
                : 'Crear categoría'
          }}
        </button>

        <button
          type="button"
          class="cancel-button"
          @click="cancelForm"
        >
          Cancelar
        </button>
      </div>
    </section>

    <div
      v-if="loading"
      class="loading-state"
      role="status"
      aria-live="polite"
    >
      <span class="spinner" aria-hidden="true"></span>
      <span>Cargando categorías...</span>
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
        class="secondary-button"
        @click="loadCategories"
      >
        Reintentar
      </button>
    </div>

    <p
      v-else-if="categories.length === 0"
      class="empty-state"
    >
      No hay categorías registradas.
    </p>

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
              {{ getCategoryName(category) }}
            </td>

            <td class="category-description">
              {{
                getCategoryDescription(category) ||
                'Sin descripción'
              }}
            </td>

            <td>
              {{ getViewsCount(category) }}
            </td>

            <td>
              <span
                class="status-badge"
                :class="
                  isCategoryActive(category)
                    ? 'active'
                    : 'inactive'
                "
              >
                {{
                  isCategoryActive(category)
                    ? 'Activa'
                    : 'Inactiva'
                }}
              </span>
            </td>

            <td class="actions">
              <template v-if="isCategoryActive(category)">
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
                  :disabled="actionLoadingId === category.id"
                  @click="openDeleteDialog(category)"
                >
                  Eliminar
                </button>
              </template>

              <span
                v-else
                class="inactive-note"
              >
                Sin opción de reactivación disponible
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="categoryToDelete"
      class="modal-backdrop"
      role="presentation"
      @click.self="closeDeleteDialog"
    >
      <section
        class="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <h2 id="delete-dialog-title">
          Eliminar categoría
        </h2>

        <p>
          ¿Deseas eliminar la categoría
          <strong>"{{ getCategoryName(categoryToDelete) }}"</strong>?
        </p>

        <p
          v-if="getViewsCount(categoryToDelete) > 0"
          class="warning-text"
        >
          Esta categoría tiene {{ getViewsCount(categoryToDelete) }}
          publicaciones asociadas. Si el API no permite eliminarla,
          se mostrará el aviso correspondiente.
        </p>

        <div class="dialog-actions">
          <button
            type="button"
            class="cancel-button"
            @click="closeDeleteDialog"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="delete-button"
            :disabled="actionLoadingId === categoryToDelete.id"
            @click="deleteSelectedCategory"
          >
            Confirmar eliminación
          </button>
        </div>
      </section>
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
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from '../services/adminCategoryService'

import {
  getViews,
} from '../services/viewService'

import {
  CacheService,
} from '../services/cacheService'


type CategoryDescriptionMap =
  Record<string, string>

const CATEGORY_DESCRIPTIONS_KEY =
  'lasdoscaras_admin_category_descriptions'


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

const isFormOpen =
  ref(false)

const name =
  ref('')

const description =
  ref('')

const nameError =
  ref('')

const editingCategoryId =
  ref<string | null>(null)

const saving =
  ref(false)

const actionLoadingId =
  ref('')

const categoryToDelete =
  ref<Category | null>(null)


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


function getCategoryName(
  category: Category
): string {

  return (
    category.name ??
    category.nombre ??
    ''
  )

}


function getCategoryDescription(
  category: Category
): string {

  const savedDescriptions =
    getStoredCategoryDescriptions()

  return (
    category.description ??
    category.descripcion ??
    savedDescriptions[category.id] ??
    ''
  )

}


function getStoredCategoryDescriptions():
  CategoryDescriptionMap {

  return (
    CacheService.getStale<CategoryDescriptionMap>(
      CATEGORY_DESCRIPTIONS_KEY
    ) ?? {}
  )

}


function saveCategoryDescription(
  categoryId: string,
  value: string
) {

  const descriptions =
    getStoredCategoryDescriptions()

  if (value) {
    descriptions[categoryId] =
      value
  } else {
    delete descriptions[categoryId]
  }

  CacheService.set(
    CATEGORY_DESCRIPTIONS_KEY,
    descriptions
  )

}


function removeCategoryDescription(
  categoryId: string
) {

  saveCategoryDescription(
    categoryId,
    ''
  )

}


function withStoredDescription(
  category: Category
): Category {

  const description =
    getCategoryDescription(category)

  return {
    ...category,
    description,
    descripcion: category.descripcion ?? description,
  }

}


function getViewsCount(
  category: Category
): number {

  return (
    category.viewsCount ??
    category.publicacionesCount ??
    category.publicationsCount ??
    0
  )

}


function isCategoryActive(
  category: Category
): boolean {

  if (typeof category.isActive === 'boolean') {
    return category.isActive
  }

  if (typeof category.activa === 'boolean') {
    return category.activa
  }

  if (typeof category.active === 'boolean') {
    return category.active
  }

  return !category.deletedAt

}


async function loadCategories() {

  loading.value =
    true

  error.value =
    ''

  try {

    const categoryList =
      await getAdminCategories()

    const categoriesWithCount =
      await Promise.all(
        categoryList.map(
          async (rawCategory) => {

            const category =
              withStoredDescription(rawCategory)

            try {

              const result =
                await getViews({
                  category: category.id,
                  page: 1,
                  limit: 1,
                })

              return {
                ...category,
                viewsCount: result.total,
              }

            } catch (err) {

              console.error(
                `Error contando publicaciones de ${category.id}:`,
                err
              )

              return {
                ...category,
                viewsCount: 0,
              }

            }

          }
        )
      )

    categories.value =
      categoriesWithCount

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
      getCategoryName(category)
        .trim()
        .toLowerCase() ===
        normalizedName &&
      category.id !==
        editingCategoryId.value
  )

}


function validateForm():
  boolean {

  const cleanName =
    name.value.trim()

  nameError.value =
    ''

  if (!cleanName) {
    nameError.value =
      'El nombre de la categoría es obligatorio.'

    return false
  }

  if (categoryNameExists()) {
    nameError.value =
      'Ya existe una categoría con ese nombre.'

    return false
  }

  return true

}


async function saveCategory() {

  if (!validateForm()) {
    return
  }

  const cleanName =
    name.value.trim()

  const cleanDescription =
    description.value.trim()

  saving.value =
    true

  try {

    if (editingCategoryId.value) {

      const savedCategory =
        await updateCategory(
        editingCategoryId.value,
        cleanName,
        cleanDescription
      )

      saveCategoryDescription(
        savedCategory.id ?? editingCategoryId.value,
        cleanDescription
      )

      showMessage(
        'Categoría actualizada correctamente.',
        'success'
      )

    } else {

      const savedCategory =
        await createCategory(
        cleanName,
        cleanDescription
      )

      saveCategoryDescription(
        savedCategory.id,
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

      nameError.value =
        'Ya existe una categoría con ese nombre.'

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


function startCreate() {

  clearForm()

  isFormOpen.value =
    true

}


function startEdit(
  category: Category
) {

  editingCategoryId.value =
    category.id

  name.value =
    getCategoryName(category)

  description.value =
    getCategoryDescription(category)

  nameError.value =
    ''

  isFormOpen.value =
    true

}


function cancelForm() {

  clearForm()

}


function clearForm() {

  editingCategoryId.value =
    null

  name.value =
    ''

  description.value =
    ''

  nameError.value =
    ''

  isFormOpen.value =
    false

}


function openDeleteDialog(
  category: Category
) {

  categoryToDelete.value =
    category

}


function closeDeleteDialog() {

  if (actionLoadingId.value) {
    return
  }

  categoryToDelete.value =
    null

}


async function deleteSelectedCategory() {

  if (!categoryToDelete.value) {
    return
  }

  const category =
    categoryToDelete.value

  actionLoadingId.value =
    category.id

  try {

    await deleteCategory(
      category.id
    )

    showMessage(
      'Categoría eliminada correctamente.',
      'success'
    )

    removeCategoryDescription(
      category.id
    )

    categoryToDelete.value =
      null

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

    actionLoadingId.value =
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1,
.category-form h2,
.confirm-dialog h2 {
  margin: 0;
}

.page-header h1 {
  font-size: 32px;
}

.eyebrow {
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: bold;
}

.description {
  color: var(--text-secondary);
}

.category-form {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.form-header,
.form-actions,
.dialog-actions,
.actions {
  display: flex;
  gap: 10px;
}

.form-header {
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.form-group textarea {
  min-height: 90px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
}

.form-group input[aria-invalid='true'] {
  border-color: #dc2626;
}

.form-actions {
  margin-top: 18px;
}

.primary-button,
.secondary-button,
.save-button,
.cancel-button,
.ghost-button,
.edit-button,
.delete-button {
  padding: 9px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.primary-button,
.save-button,
.edit-button {
  background: #2563eb;
  color: white;
}

.secondary-button,
.cancel-button,
.ghost-button {
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
}

.delete-button {
  background: #dc2626;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  vertical-align: middle;
}

th {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.actions {
  align-items: center;
  flex-wrap: wrap;
}

.category-description {
  max-width: 420px;
  color: var(--text-secondary);
  line-height: 1.45;
  overflow-wrap: anywhere;
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

.inactive-note {
  color: #991b1b;
  font-size: 0.85rem;
  font-weight: 600;
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

.field-error {
  margin: 0;
  color: #dc2626;
  font-size: 14px;
}

.error-state,
.empty-state {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(15 23 42 / 0.55);
}

.confirm-dialog {
  width: min(100%, 460px);
  padding: 22px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 24px 60px rgb(15 23 42 / 0.24);
}

.confirm-dialog p {
  color: #475569;
}

.warning-text {
  padding: 12px;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: #fff7ed;
  color: #9a3412;
  font-weight: 600;
}

.dialog-actions {
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 768px) {
  .page-header,
  .form-header,
  .form-actions,
  .dialog-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 26px;
  }
}
</style>
