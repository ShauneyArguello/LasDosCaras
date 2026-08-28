import api from './api'
import type { Category } from '../models/category'


type CategoryPayload = {
  nombre?: string
  descripcion?: string
  name?: string
  description?: string
  activa?: boolean
  isActive?: boolean
  active?: boolean
  deletedAt?: string | null
}

type CategoryResponse =
  Category |
  Category[] |
  {
    category?: Category
    categories?: Category[]
  }


function normalizeCategory(
  category: Category
): Category {

  const normalizedName =
    category.name ??
    category.nombre ??
    ''

  const normalizedDescription =
    category.description ??
    category.descripcion ??
    ''

  const normalizedViewsCount =
    category.viewsCount ??
    category.publicacionesCount ??
    category.publicationsCount ??
    0

  return {
    ...category,
    name: normalizedName,
    nombre: category.nombre ?? normalizedName,
    description: normalizedDescription,
    descripcion: category.descripcion ?? normalizedDescription,
    viewsCount: normalizedViewsCount,
    active:
      category.active ??
      category.isActive ??
      category.activa,
    isActive:
      category.isActive ??
      category.active ??
      category.activa,
  }
}


function normalizeCategoriesResponse(
  data: CategoryResponse
): Category[] {

  if (Array.isArray(data)) {
    return data.map(normalizeCategory)
  }

  if (
    'categories' in data &&
    Array.isArray(data.categories)
  ) {
    return data.categories.map(normalizeCategory)
  }

  return []
}


function normalizeCategoryResponse(
  data: CategoryResponse
): Category {

  if (
    !Array.isArray(data) &&
    'category' in data &&
    data.category
  ) {
    return normalizeCategory(data.category)
  }

  return normalizeCategory(data as Category)
}


function buildEnglishPayload(
  name: string,
  description: string,
  extra: CategoryPayload = {}
): CategoryPayload {

  return {
    name,
    description,
    ...extra,
  }
}


async function mutateCategory(
  method: 'post' | 'put',
  url: string,
  name: string,
  description: string,
  extra: CategoryPayload = {}
): Promise<Category> {
  const response = await api[method](
    url,
    buildEnglishPayload(name, description, extra)
  )

  return normalizeCategoryResponse(response.data)

}


export async function getAdminCategories():
  Promise<Category[]> {

  const response =
    await api.get(
      '/api/admin/categories'
    )

  return normalizeCategoriesResponse(
    response.data
  )
}


export async function createCategory(
  name: string,
  description: string
): Promise<Category> {

  return mutateCategory(
    'post',
    '/api/admin/categories',
    name,
    description
  )
}


export async function updateCategory(
  categoryId: string,
  name: string,
  description: string
): Promise<Category> {

  return mutateCategory(
    'put',
    `/api/admin/categories/${categoryId}`,
    name,
    description
  )
}


export async function deleteCategory(
  categoryId: string
): Promise<void> {

  await api.delete(
    `/api/admin/categories/${categoryId}`
  )
}


export async function activateCategory(
  categoryId: string,
  name: string,
  description: string
): Promise<Category> {

  return mutateCategory(
    'put',
    `/api/admin/categories/${categoryId}`,
    name,
    description,
    {
      activa: true,
      isActive: true,
      active: true,
      deletedAt: null,
    }
  )
}
