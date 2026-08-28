<template>
  <button
    class="base-button"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    type: 'button',
    disabled: false,
  }
)
</script>

<style scoped>
.base-button {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.base-button:hover {
  background: #1d4ed8;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>