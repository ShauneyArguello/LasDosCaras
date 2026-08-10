import api from './api'
import type { View, ViewListResponse } from '../models/view'

export interface ViewFilters {
  category?: string
  hashtag?: string
  sort?: 'likes' | 'dislikes' | 'recent'
  page?: number
  limit?: number
  autorId?: string
  autor?: 'me'
}

export interface SearchResult {
  views: View[]
  categories: unknown[]
  hashtags: unknown[]
  authors: unknown[]
}

export async function getViews(
  filters: ViewFilters = {}
): Promise<ViewListResponse> {
  const response = await api.get<ViewListResponse>(
    '/api/views',
    {
      params: filters,
    }
  )

  return response.data
}

export async function searchViews(
  query: string
): Promise<SearchResult> {
  const response = await api.get<SearchResult>(
    '/api/search',
    {
      params: {
        q: query,
      },
    }
  )

  return response.data
}