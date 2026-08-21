import { defineStore } from 'pinia'

export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'

export interface AppNotification {
  id: number
  message: string
  type: NotificationType
}

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as AppNotification[],
    nextId: 1,
  }),

  actions: {
    notify(
      message: string,
      type: NotificationType = 'info',
      duration = DEFAULT_DURATIONS[type]
    ) {
      const notification: AppNotification = {
        id: this.nextId,
        message,
        type,
      }

      this.nextId += 1
      this.notifications = [
        ...this.notifications,
        notification,
      ].slice(-4)

      window.setTimeout(() => {
        this.dismiss(notification.id)
      }, duration)
    },

    dismiss(id: number) {
      this.notifications = this.notifications.filter(
        (notification) => notification.id !== id
      )
    },
  },
})
