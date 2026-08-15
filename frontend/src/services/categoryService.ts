import api from './api'
import type { Category } from '../models/category'

export async function getCategories(): Promise<Category[]> {
  const response = await api.get('/api/categories')

  return response.data.categories
}

export async function getCategoryById(
  categoryId: string
): Promise<Category> {
  const response = await api.get(
    `/api/categories/${categoryId}`
  )

  return response.data.category
}