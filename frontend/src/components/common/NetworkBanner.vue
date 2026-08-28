<template>
  <div
    v-if="!networkStore.isOnline || networkStore.showingCachedData"
    class="network-banner"
    :class="{ 'network-banner--cached': networkStore.showingCachedData }"
    role="status"
    aria-live="polite"
  >
    {{
      networkStore.isOnline
        ? 'Mostrando información guardada — sin conexión al servidor.'
        : 'Sin conexión. Las acciones de escritura no están disponibles.'
    }}
  </div>
</template>

<script setup lang="ts">
import { useNetworkStore } from '../../stores/network'

const networkStore = useNetworkStore()
</script>

<style scoped>
.network-banner {
  padding: 10px 16px;
  border-bottom: 1px solid #fde68a;
  background: #fef3c7;
  color: #92400e;
  font-weight: 700;
  text-align: center;
}

.network-banner--cached {
  border-color: #bfdbfe;
  background: #dbeafe;
  color: #1e40af;
}
</style>
