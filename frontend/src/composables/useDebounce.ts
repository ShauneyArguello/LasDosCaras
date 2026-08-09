import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(source: Ref<T>, delay = 300) {
  const debouncedValue = ref(source.value) as Ref<T>

  let timeout: ReturnType<typeof setTimeout>

  watch(source, (value) => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      debouncedValue.value = value
    }, delay)
  })

  return debouncedValue
}