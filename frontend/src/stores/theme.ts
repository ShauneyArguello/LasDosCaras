import { defineStore } from 'pinia'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'lasdoscaras_theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light' as Theme,
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
  },

  actions: {
    loadTheme() {
      const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

      this.theme = savedTheme ?? (prefersDark ? 'dark' : 'light')
      this.applyTheme()
    },

    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, this.theme)
      this.applyTheme()
    },

    applyTheme() {
      document.documentElement.dataset.theme = this.theme
    },
  },
})
