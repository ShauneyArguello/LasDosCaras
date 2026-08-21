import { defineStore } from 'pinia'
import {
  CACHE_KEYS,
  CacheService,
} from '../services/cacheService'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const savedTheme = CacheService.getStale<Theme>(CACHE_KEYS.theme)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  return savedTheme ?? (prefersDark ? 'dark' : 'light')
}

export function applyInitialTheme() {
  document.documentElement.dataset.theme = getInitialTheme()
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: getInitialTheme(),
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
  },

  actions: {
    loadTheme() {
      this.theme = getInitialTheme()
      this.applyTheme()
    },

    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      CacheService.set(CACHE_KEYS.theme, this.theme)
      this.applyTheme()
    },

    applyTheme() {
      document.documentElement.dataset.theme = this.theme
    },
  },
})
