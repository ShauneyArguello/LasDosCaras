import api from './api'
import type {
  View,
  ViewListResponse,
  ViewSource,
} from '../models/view'

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

export interface ViewSidePayload {
  title: string
  description: string
  sources: Omit<ViewSource, 'id'>[]
}

export interface SaveViewPayload {
  title?: string
  categoryId: string
  side: ViewSidePayload
  counterpart: ViewSidePayload
  hashtags?: string[]
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

export async function getViewById(
  viewId: string
): Promise<View> {
  const response = await api.get<{ view: View }>(
    `/api/views/${viewId}`
  )

  return response.data.view
}

export async function createView(
  payload: SaveViewPayload
): Promise<View> {
  const response = await api.post<{ view: View }>(
    '/api/views',
    payload
  )

  return response.data.view
}

export async function updateView(
  viewId: string,
  payload: SaveViewPayload
): Promise<View> {
  const response = await api.put<{ view: View }>(
    `/api/views/${viewId}`,
    payload
  )

  return response.data.view
}

export async function reactToViewSide(
  viewId: string,
  side: 'a' | 'b',
  type: 'LIKE' | 'DISLIKE'
): Promise<{
  likeCount: number
  dislikeCount: number
  myReaction: 'LIKE' | 'DISLIKE' | null
}> {
  const response = await api.post(
    `/api/views/${viewId}/sides/${side}/${type.toLowerCase()}`
  )

  return response.data
}

export async function favoriteView(
  viewId: string
): Promise<{ isFavorite: boolean }> {
  const response = await api.post<{ isFavorite: boolean }>(
    `/api/views/${viewId}/favorite`
  )

  return response.data
}

export async function unfavoriteView(
  viewId: string
): Promise<{ isFavorite: boolean }> {
  const response = await api.delete<{ isFavorite: boolean }>(
    `/api/views/${viewId}/favorite`
  )

  return response.data
}

export async function unpublishView(
  viewId: string
): Promise<void> {
  await api.patch(
    `/api/views/${viewId}/unpublish`
  )
}
