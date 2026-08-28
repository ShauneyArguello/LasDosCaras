<template>
  <div class="search-input">
    <label for="search">Buscar publicaciones</label>

    <input
      id="search"
      v-model="searchText"
      type="search"
      placeholder="Buscar publicaciones..."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounce } from '../../composables/useDebounce'

const searchText = ref('')

const debouncedSearch = useDebounce(searchText, 300)

const emit = defineEmits<{
  search: [value: string]
}>()

watch(debouncedSearch, (value) => {
  emit('search', value.trim())
})
</script>

<style scoped>
.search-input {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.4rem;
}

.search-input label {
  font-weight: 600;
  color: #e5e7eb;
}

.search-input input {
  width: 100%;
  min-width: 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid #334155;
  border-radius: 10px;
  background: #172033;
  color: #ffffff;
  font-size: 0.95rem;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input input::placeholder {
  color: #cbd5e1;
}

.search-input input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
</style>
