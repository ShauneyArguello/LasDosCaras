<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav" aria-label="Navegación principal">
      <RouterLink to="/" class="nav-item">
        🏠 Inicio
      </RouterLink>

      <RouterLink to="/dashboard" class="nav-item">
        📊 Dashboard
      </RouterLink>

      <RouterLink to="/profile" class="nav-item">
        👤 Perfil
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 240px;
  min-height: calc(100vh - 64px);
  padding: 24px 16px;
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
  box-sizing: border-box;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  padding: 12px 16px;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-item:hover {
  background: #e5e7eb;
}

.nav-item.router-link-active {
  background: #e5e7eb;
  font-weight: 600;
}
</style>