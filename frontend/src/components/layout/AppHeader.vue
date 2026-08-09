<template>
  <header class="app-header">
    <div class="header-left">
      <RouterLink to="/" class="brand" aria-label="Ir al inicio">
        <span class="brand-mark">LDC</span>
        <span class="brand-text">LasDosCaras</span>
      </RouterLink>

      <nav class="top-nav" aria-label="Navegacion superior">
        <RouterLink to="/board">Tablero</RouterLink>
        <RouterLink to="/profile">Perfil</RouterLink>
      </nav>
    </div>

    <div class="header-right">
      <button class="theme-button" type="button" @click="themeStore.toggleTheme">
        {{ themeStore.isDark ? 'Modo claro' : 'Modo oscuro' }}
      </button>

      <template v-if="authStore.token">
        <span class="user-name">{{ authStore.user?.name ?? 'Usuario' }}</span>
        <button class="logout-button" type="button" @click="authStore.logout">
          Salir
        </button>
      </template>

      <template v-else>
        <RouterLink to="/login" class="login-link">Login</RouterLink>
        <RouterLink to="/register" class="register-link">Registro</RouterLink>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
</script>

<style scoped>
.app-header {
  min-height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 28px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  text-decoration: none;
}

.brand-mark {
  display: inline-grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 8px;
  background: var(--accent);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.brand-text {
  font-size: 20px;
  font-weight: 800;
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-nav a,
.login-link,
.register-link,
.theme-button,
.logout-button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  color: var(--text-secondary);
  background: transparent;
  font: inherit;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}

.top-nav a:hover,
.login-link:hover,
.theme-button:hover,
.logout-button:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.top-nav a.router-link-active {
  background: var(--surface-muted);
  color: var(--text-primary);
  font-weight: 700;
}

.register-link {
  background: var(--accent);
  color: #ffffff;
  font-weight: 700;
}

.register-link:hover {
  background: var(--accent-strong);
  color: #ffffff;
}

.theme-button {
  border-color: var(--border);
}

.user-name {
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 760px) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }

  .header-left,
  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .top-nav {
    width: 100%;
    flex-wrap: wrap;
  }

  .top-nav a {
    flex: 0 1 auto;
  }

  .theme-button,
  .login-link,
  .register-link,
  .logout-button {
    flex: 0 1 auto;
  }
}
</style>
