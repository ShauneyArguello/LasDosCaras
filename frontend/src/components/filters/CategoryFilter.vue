<template>
  <div class="category-filter">
    <label for="category">Categoría</label>

    <select
      id="category"
      v-model="selectedCategory"
    >
      <option value="">Todas las categorías</option>

      <option
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Category } from '../../models/category'

defineProps<{
  categories: Category[]
}>()

const emit = defineEmits<{
  change: [categoryId: string]
}>()

const selectedCategory = ref('')

watch(selectedCategory, (value) => {
  emit('change', value)
})
</script>