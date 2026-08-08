<template>
  <section class="base-card">
    <slot />
  </section>
</template>

<style scoped>
.base-card {
  padding: 24px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>