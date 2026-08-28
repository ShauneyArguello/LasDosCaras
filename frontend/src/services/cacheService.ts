export interface CacheEntry<T> {
  value: T
  timestamp: number
}

export const CACHE_KEYS = {
  auth: 'lasdoscaras_auth',
  categories: 'lasdoscaras_categories',
  hashtags: 'lasdoscaras_hashtags',
  filters: 'lasdoscaras_filters',
  favorites: 'lasdoscaras_favorites',
  draft: 'lasdoscaras_draft',
  theme: 'lasdoscaras_theme',
  history: 'lasdoscaras_history',
  views: 'lasdoscaras_views',
} as const

export const CACHE_TTL = {
  categories: 60 * 60 * 1000,
  hashtags: 30 * 60 * 1000,
} as const

export class CacheService {
  static get<T>(key: string, ttl?: number): T | null {
    const entry = this.readEntry<T>(key)

    if (!entry) return null

    if (ttl && Date.now() - entry.timestamp > ttl) {
      return null
    }

    return entry.value
  }

  static getStale<T>(key: string): T | null {
    return this.readEntry<T>(key)?.value ?? null
  }

  static set<T>(key: string, value: T): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
    }

    localStorage.setItem(key, JSON.stringify(entry))
  }

  static remove(key: string): void {
    localStorage.removeItem(key)
  }

  static getRaw(key: string): string | null {
    return localStorage.getItem(key)
  }

  static setRaw(key: string, value: string): void {
    localStorage.setItem(key, value)
  }

  static removeRaw(key: string): void {
    localStorage.removeItem(key)
  }

  static readEntry<T>(key: string): CacheEntry<T> | null {
    const stored = localStorage.getItem(key)

    if (!stored) return null

    try {
      const parsed: unknown = JSON.parse(stored)

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'value' in parsed &&
        'timestamp' in parsed &&
        typeof (parsed as CacheEntry<T>).timestamp === 'number'
      ) {
        return parsed as CacheEntry<T>
      }

      return {
        value: parsed as T,
        timestamp: 0,
      }
    } catch {
      return null
    }
  }
}
