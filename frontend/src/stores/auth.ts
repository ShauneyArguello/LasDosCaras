import { defineStore } from 'pinia'
import {
  CACHE_KEYS,
  CacheService,
} from '../services/cacheService'

export type AuthUser = {
  id?: string
  nombre?: string
  name?: string
  email?: string
  rol?: string
  role?: string
  createdAt?: string
  fechaRegistro?: string
}

type StoredAuth = {
  token: string
  user: AuthUser | null
}

function readStoredAuth(): StoredAuth {
  const cachedAuth = CacheService.getStale<StoredAuth>(CACHE_KEYS.auth)

  if (cachedAuth?.token) {
    return cachedAuth
  }

  const token = CacheService.getRaw('token') ?? ''
  const storedUser = CacheService.getRaw('user')
  let user: AuthUser | null = null

  if (storedUser) {
    try {
      user = JSON.parse(storedUser) as AuthUser
    } catch {
      user = null
    }
  }

  if (token) {
    const legacyAuth = {
      token,
      user,
    }

    CacheService.set(CACHE_KEYS.auth, legacyAuth)
    return legacyAuth
  }

  return {
    token: '',
    user: null,
  }
}

const storedAuth = readStoredAuth()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: storedAuth.token || null,
    user: storedAuth.user,
    favorites:
      CacheService.getStale<string[]>(CACHE_KEYS.favorites) ??
      readLegacyFavorites(),
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),

    isSuperadmin: (state) => {
      const role =
        state.user?.role ??
        state.user?.rol

      return role?.toLowerCase() === 'superadmin'
    },
  },

  actions: {
    setAuth(token: string, user?: AuthUser | null) {
      this.token = token
      this.user = user ?? null

      CacheService.set(CACHE_KEYS.auth, {
        token,
        user: this.user,
      })

      CacheService.setRaw('token', token)

      if (user) {
        CacheService.setRaw('user', JSON.stringify(user))
      } else {
        CacheService.removeRaw('user')
      }
    },

    setToken(token: string) {
      this.setAuth(token)
    },

    setFavorites(favorites: string[]) {
      this.favorites = favorites
      CacheService.set(CACHE_KEYS.favorites, favorites)
    },

    logout() {
      this.token = null
      this.user = null
      this.favorites = []

      CacheService.remove(CACHE_KEYS.auth)
      CacheService.remove(CACHE_KEYS.favorites)
      CacheService.removeRaw('token')
      CacheService.removeRaw('user')
      CacheService.removeRaw(CACHE_KEYS.favorites)
    },
  },
})

function readLegacyFavorites(): string[] {
  const stored = CacheService.getRaw(CACHE_KEYS.favorites)

  if (!stored) return []

  try {
    const parsed: unknown = JSON.parse(stored)

    return Array.isArray(parsed) ? parsed as string[] : []
  } catch {
    return []
  }
}
