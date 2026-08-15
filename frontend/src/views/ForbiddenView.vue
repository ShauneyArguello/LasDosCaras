<template>
  <section class="forbidden-page">
    <h1>403</h1>

    <h2>Acceso denegado</h2>

    <p>
      No tienes permisos para acceder a esta sección.
    </p>

    <RouterLink
      to="/board"
      class="back-button"
    >
      Volver al tablero
    </RouterLink>
  </section>
</template>

<style scoped>
.forbidden-page {
  max-width: 600px;
  margin: 80px auto;
  padding: 32px;
  text-align: center;
}

.forbidden-page h1 {
  margin: 0;
  font-size: 64px;
  color: #dc2626;
}

.forbidden-page h2 {
  margin-bottom: 12px;
}

.back-button {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 16px;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  text-decoration: none;
}
</style>