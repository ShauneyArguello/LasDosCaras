<template>
  <div class="notification-stack" aria-live="polite">
    <div
      v-for="notification in notificationStore.notifications"
      :key="notification.id"
      class="notification"
      :class="`notification--${notification.type}`"
      :role="notification.type === 'error' ? 'alert' : 'status'"
    >
      <span>{{ notification.message }}</span>
      <button
        type="button"
        aria-label="Cerrar notificación"
        @click="notificationStore.dismiss(notification.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '../../stores/notifications'

const notificationStore = useNotificationStore()
</script>

<style scoped>
.notification-stack {
  position: fixed;
  z-index: 80;
  right: 20px;
  bottom: 20px;
  display: grid;
  gap: 10px;
  width: min(420px, calc(100vw - 32px));
}

.notification {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.notification--success {
  border-color: #86efac;
  background: #dcfce7;
  color: #166534;
}

.notification--error {
  border-color: #fecaca;
  background: #fee2e2;
  color: #991b1b;
}

.notification--warning {
  border-color: #fde68a;
  background: #fef3c7;
  color: #92400e;
}

.notification--info {
  border-color: #bfdbfe;
  background: #dbeafe;
  color: #1e40af;
}

.notification button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}
</style>
