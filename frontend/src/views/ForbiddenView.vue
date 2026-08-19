<template>
  <section class="error-page" aria-labelledby="forbidden-title">
    <div class="error-panel">
      <p class="eyebrow">Error 403</p>

      <h1 id="forbidden-title">
        Acceso denegado
      </h1>

      <p class="error-copy">
        Esta sección requiere permisos de superadmin. Si necesitas entrar,
        solicita el rol correspondiente a un administrador.
      </p>

      <p
        v-if="attemptedPath"
        class="blocked-route"
      >
        Ruta bloqueada: {{ attemptedPath }}
      </p>

      <RouterLink
        :to="{ name: 'board' }"
        class="error-action"
      >
        Volver al tablero
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const attemptedPath = computed(() => {
  return typeof route.query.redirect === 'string'
    ? route.query.redirect
    : ''
})
</script>

<style scoped>
.error-page {
  min-height: min(620px, calc(100vh - 220px));
  display: grid;
  place-items: center;
}

.error-panel {
  width: min(100%, 680px);
  padding: 40px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.error-panel h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 40px;
  line-height: 1.1;
}

.error-copy {
  max-width: 520px;
  margin: 16px auto 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.blocked-route {
  max-width: 100%;
  margin: 18px auto 0;
  padding: 10px 12px;
  overflow-wrap: anywhere;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-muted);
  color: var(--text-secondary);
  font-size: 14px;
}

.error-action {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 28px;
  padding: 0 18px;
  border-radius: 8px;
  background: var(--accent);
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
}

.error-action:hover {
  background: var(--accent-strong);
}

@media (max-width: 600px) {
  .error-page {
    min-height: auto;
    place-items: stretch;
  }

  .error-panel {
    padding: 28px 22px;
  }

  .error-panel h1 {
    font-size: 32px;
  }

  .error-action {
    width: 100%;
  }
}
</style>
