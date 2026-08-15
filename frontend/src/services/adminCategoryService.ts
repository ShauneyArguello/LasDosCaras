import api from './api'
import type { Category } from '../models/category'


export async function getAdminCategories():
  Promise<Category[]> {

  const response =
    await api.get(
      '/api/admin/categories'
    )

  return response.data.categories
}


export async function createCategory(
  name: string,
  description: string
): Promise<Category> {

  const response =
    await api.post(
      '/api/admin/categories',
      {
        name,
        description,
      }
    )

  return response.data.category
}


export async function updateCategory(
  categoryId: string,
  name: string,
  description: string
): Promise<Category> {

  const response =
    await api.put(
      `/api/admin/categories/${categoryId}`,
      {
        name,
        description,
      }
    )

  return response.data.category
}


export async function deleteCategory(
  categoryId: string
): Promise<void> {

  await api.delete(
    `/api/admin/categories/${categoryId}`
  )
}