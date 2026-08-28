import api from './api'
import type { Hashtag } from '../models/hashtag'
import {
  CACHE_KEYS,
  CACHE_TTL,
  CacheService,
} from './cacheService'

export async function getHashtags(
  query?: string
): Promise<Hashtag[]> {
  try {
    const response = await api.get('/api/hashtags', {
      params: query
        ? { q: query }
        : {},
    })

    const hashtags = response.data.hashtags ?? []

    if (!query) {
      CacheService.set(CACHE_KEYS.hashtags, hashtags)
    }

    return hashtags
  } catch (error) {
    if (!query) {
      const cached =
        CacheService.get<Hashtag[]>(CACHE_KEYS.hashtags, CACHE_TTL.hashtags) ??
        CacheService.getStale<Hashtag[]>(CACHE_KEYS.hashtags)

      if (cached) {
        window.dispatchEvent(new CustomEvent('lasdoscaras:cached-data'))
        return cached
      }
    }

    throw error
  }
}
