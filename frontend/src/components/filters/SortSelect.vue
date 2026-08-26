<template>
  <div class="sort-select">
    <label for="sort">Ordenar por</label>

    <select
      id="sort"
      v-model="selectedSort"
    >
      <option value="recent">
        Más recientes
      </option>

      <option value="sideA">
        Más likes Lado A
      </option>

      <option value="sideB">
        Más likes Lado B
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export type SortOption =
  | 'recent'
  | 'sideA'
  | 'sideB'

const selectedSort =
  ref<SortOption>('recent')

const emit = defineEmits<{
  change: [sort: SortOption]
}>()

watch(selectedSort, (value) => {
  emit('change', value)
})
</script>

<style scoped>
.sort-select {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sort-select label {
  font-weight: 600;
  color: var(--text-primary);
}

.sort-select select {
  width: 100%;
  min-width: 210px;
  padding: 0.75rem 0.9rem;
  border: 1px solid #334155;
  border-radius: 10px;
  background: #172033;
  color: #ffffff;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
}

.sort-select select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
</style>
