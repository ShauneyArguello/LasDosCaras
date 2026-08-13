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

    logout() {
      this.token = null
      this.user = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('lasdoscaras_favorites')
    },
  },
})
