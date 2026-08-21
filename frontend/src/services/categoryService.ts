import api from './api'
import type { Category } from '../models/category'
import {
  CACHE_KEYS,
  CACHE_TTL,
  CacheService,
} from './cacheService'

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/api/categories')
    const categories = response.data.categories ?? []

    CacheService.set(CACHE_KEYS.categories, categories)

    return categories
  } catch (error) {
    const cached =
      CacheService.get<Category[]>(CACHE_KEYS.categories, CACHE_TTL.categories) ??
      CacheService.getStale<Category[]>(CACHE_KEYS.categories)

    if (cached) {
      window.dispatchEvent(new CustomEvent('lasdoscaras:cached-data'))
      return cached
    }

    throw error
  }
}

export async function getCategoryById(
  categoryId: string
): Promise<Category> {
  const response = await api.get(
    `/api/categories/${categoryId}`
  )

  return response.data.category
}
