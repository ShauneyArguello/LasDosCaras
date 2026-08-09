import api from './api'
import type { Category } from '../models/category'

export async function getCategories(): Promise<Category[]> {
  const response = await api.get('/api/categories')

  return response.data.categories
}