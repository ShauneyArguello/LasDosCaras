<template>
  <div class="app-layout">
    <AppHeader />

    <div class="app-body">
      <AppSidebar />

      <main class="app-content">
        <RouterView />
      </main>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.loadTheme()
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--app-bg);
  color: var(--text-primary);
}

.app-body {
  flex: 1;
  display: flex;
}

.app-content {
  flex: 1;
  min-width: 0;
  padding: 32px;
}

@media (max-width: 900px) {
  .app-body {
    flex-direction: column;
  }

  .app-content {
    padding: 20px;
  }
}
</style>
