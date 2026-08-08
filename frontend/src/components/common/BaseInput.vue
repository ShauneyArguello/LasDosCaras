<template>
  <div class="input-group">
    <label v-if="label" :for="id">
      {{ label }}
    </label>

    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="updateValue"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  label?: string
  type?: string
  placeholder?: string
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 14px;
  font-weight: 600;
}

.input-group input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
}

.input-group input:focus {
  border-color: #2563eb;
}
</style>