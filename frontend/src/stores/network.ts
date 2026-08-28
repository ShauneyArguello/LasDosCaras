import { defineStore } from 'pinia'

export const useNetworkStore = defineStore('network', {
  state: () => ({
    isOnline: navigator.onLine,
    showingCachedData: false,
  }),

  actions: {
    init() {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
      window.addEventListener('lasdoscaras:cached-data', this.handleCachedData)
    },

    handleOnline() {
      this.isOnline = true
      this.showingCachedData = false
      window.dispatchEvent(new CustomEvent('lasdoscaras:online'))
    },

    handleOffline() {
      this.isOnline = false
    },

    setCachedDataState(value: boolean) {
      this.showingCachedData = value
    },

    handleCachedData() {
      this.showingCachedData = true
    },
  },
})
