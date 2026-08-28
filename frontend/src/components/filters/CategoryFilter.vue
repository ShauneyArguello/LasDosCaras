<template>
  <div class="category-filter">
    <label for="category">Categoría</label>

    <select
      id="category"
      v-model="localSelectedCategory"
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
import {
  ref,
  watch,
} from 'vue'

import type {
  Category,
} from '../../models/category'

const props = withDefaults(
  defineProps<{
    categories: Category[]
    selectedCategory?: string
  }>(),
  {
    selectedCategory: '',
  }
)

const emit = defineEmits<{
  change: [categoryId: string]
}>()

const localSelectedCategory =
  ref(props.selectedCategory)

watch(
  () => props.selectedCategory,
  (value) => {
    if (
      value !==
      localSelectedCategory.value
    ) {
      localSelectedCategory.value =
        value
    }
  }
)

watch(
  localSelectedCategory,
  (value) => {
    if (
      value !==
      props.selectedCategory
    ) {
      emit('change', value)
    }
  }
)
</script>

<style scoped>
.category-filter {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.4rem;
}

.category-filter label {
  font-weight: 600;
  color: var(--text-primary);
}

.category-filter select {
  width: 100%;
  min-width: 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid #334155;
  border-radius: 10px;
  background: #172033;
  color: #ffffff;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
}

.category-filter select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
</style>
