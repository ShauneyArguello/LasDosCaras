<template>
  <section class="page-hero">
    <p class="eyebrow">Las dos narrativas de cada tema</p>
    <h1>LasDosCaras</h1>
    <p class="hero-copy">
      Plataforma para explorar publicaciones con dos perspectivas opuestas,
      comparar argumentos y navegar contenido por categorias.
    </p>

    <div class="hero-actions">
      <RouterLink to="/board" class="primary-action">Ver tablero</RouterLink>
      <RouterLink to="/login" class="secondary-action">Iniciar sesion</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  max-width: 820px;
  padding: 48px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 48px;
  line-height: 1;
}

.hero-copy {
  max-width: 640px;
  margin: 18px 0 0;
  color: var(--text-secondary);
  font-size: 18px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.primary-action,
.secondary-action {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none;
}

.primary-action {
  background: var(--accent);
  color: #ffffff;
}

.secondary-action {
  border: 1px solid var(--border);
  color: var(--text-primary);
}

@media (max-width: 700px) {
  .page-hero {
    padding: 28px;
  }

  h1 {
    font-size: 36px;
  }
}
</style>
