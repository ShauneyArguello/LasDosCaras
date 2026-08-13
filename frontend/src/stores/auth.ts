import { defineStore } from 'pinia'

type AuthUser = {
  id?: string
  nombre?: string
  name?: string
  email?: string
  rol?: string
  role?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') as string | null,
    user: JSON.parse(localStorage.getItem('user') ?? 'null') as AuthUser | null,
    favorites: JSON.parse(
      localStorage.getItem('lasdoscaras_favorites') ?? '[]'
    ) as string[],
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    setAuth(token: string, user?: AuthUser | null) {
      this.token = token
      this.user = user ?? null

      localStorage.setItem('token', token)

      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },

    setToken(token: string) {
      this.setAuth(token)
    },

    setFavorites(favorites: string[]) {
      this.favorites = favorites
      localStorage.setItem(
        'lasdoscaras_favorites',
        JSON.stringify(favorites)
      )
    },

    logout() {
      this.token = null
      this.user = null
      this.favorites = []

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('lasdoscaras_favorites')
    },
  },
})
