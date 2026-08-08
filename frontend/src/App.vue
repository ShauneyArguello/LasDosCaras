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
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.app-body {
  flex: 1;
  display: flex;
}

.app-content {
  flex: 1;
  padding: 32px;
  box-sizing: border-box;
}
</style>