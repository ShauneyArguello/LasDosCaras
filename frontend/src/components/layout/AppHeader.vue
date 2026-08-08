<template>
  <header class="app-header">
    <div class="header-left">
      <button class="menu-button" type="button" aria-label="Abrir menú">
        ☰
      </button>

      <div class="brand">
        <h1>LasDosCaras</h1>
      </div>
    </div>

    <div class="header-right">
      <span class="user-name">Usuario</span>

      <button class="profile-button" type="button" aria-label="Perfil">
        👤
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-button,
.profile-button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
}

.brand h1 {
  margin: 0;
  font-size: 20px;
}

.user-name {
  font-size: 14px;
  color: #4b5563;
}
</style>