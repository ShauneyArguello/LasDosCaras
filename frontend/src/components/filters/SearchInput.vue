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