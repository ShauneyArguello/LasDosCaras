<template>
  <section class="error-page" aria-labelledby="not-found-title">
    <div class="error-panel">
      <p class="eyebrow">Error 404</p>

      <h1 id="not-found-title">
        Pagina no encontrada
      </h1>

      <p class="error-copy">
        La ruta que intentaste abrir no existe o fue movida. Puedes volver al
        tablero principal para seguir explorando publicaciones.
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
