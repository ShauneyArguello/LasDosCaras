import api from './api'
import type { Hashtag } from '../models/hashtag'

export async function getHashtags(
  query?: string
): Promise<Hashtag[]> {
  const response = await api.get('/api/hashtags', {
    params: query
      ? { q: query }
      : {},
  })

  return response.data.hashtags
}