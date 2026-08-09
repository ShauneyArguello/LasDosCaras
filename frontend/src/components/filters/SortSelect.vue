<template>
  <div class="sort-select">
    <label for="sort">Ordenar por</label>

    <select
      id="sort"
      v-model="selectedSort"
    >
      <option value="recent">Más recientes</option>
      <option value="likes">Más likes</option>
      <option value="dislikes">Más dislikes</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

type SortOption = 'likes' | 'dislikes' | 'recent'

const selectedSort = ref<SortOption>('recent')

const emit = defineEmits<{
  change: [sort: SortOption]
}>()

watch(selectedSort, (value) => {
  emit('change', value)
})
</script>