<template>
  <div class="hashtag-filter">
    <label for="hashtag-search">
      Hashtags
    </label>

    <input
      id="hashtag-search"
      v-model="searchText"
      type="search"
      placeholder="Buscar hashtag..."
    />

    <div class="hashtag-chips">
      <button
        v-for="hashtag in hashtags"
        :key="hashtag.id"
        type="button"
        class="hashtag-chip"
        :class="{
          active: hashtag.name === selectedHashtag
        }"
        @click="selectHashtag(hashtag.name)"
      >
        #{{ hashtag.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Hashtag } from '../../models/hashtag'
import { useDebounce } from '../../composables/useDebounce'

const props = defineProps<{
  hashtags: Hashtag[]
  selectedHashtag?: string
}>()

const emit = defineEmits<{
  change: [hashtag: string]
  search: [query: string]
}>()

const searchText = ref('')

const debouncedSearch = useDebounce(
  searchText,
  300
)

watch(debouncedSearch, (value) => {
  emit('search', value.trim())
})

function selectHashtag(
  hashtag: string
) {
  emit(
    'change',
    hashtag === props.selectedHashtag
      ? ''
      : hashtag
  )
}
</script>

<style scoped>
.hashtag-filter {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.5rem;
}

.hashtag-filter label {
  font-weight: 600;
  color: #e5e7eb;
}

.hashtag-filter input {
  width: 100%;
  min-width: 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid #334155;
  border-radius: 10px;
  background: #172033;
  color: #ffffff;
  font-size: 0.95rem;
  outline: none;
}

.hashtag-filter input::placeholder {
  color: #94a3b8;
}

.hashtag-filter input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.hashtag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hashtag-chip {
  max-width: 100%;
  padding: 0.45rem 0.75rem;
  border: 1px solid #334155;
  border-radius: 999px;
  background: #172033;
  color: #cbd5e1;
  cursor: pointer;
  overflow-wrap: anywhere;
  transition: 0.2s ease;
}

.hashtag-chip:hover {
  border-color: #3b82f6;
  color: #ffffff;
}

.hashtag-chip.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}
</style>
