<template>
  <section class="author-page">
    <p v-if="loading">
      Cargando autor...
    </p>

    <p v-else-if="error">
      {{ error }}
    </p>

    <div v-else-if="author">
      <p class="eyebrow">AUTOR</p>

      <h1>
        {{ author.name }}
      </h1>

      <p>
        Publicaciones:
        {{ author.publishedViewsCount }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

interface Author {
  id: string
  name: string
  createdAt: string
  publishedViewsCount: number
}

const route = useRoute()

const author = ref<Author | null>(null)
const loading = ref(false)
const error = ref('')

async function loadAuthor() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
      `/api/authors/${route.params.id}`
    )

    author.value = response.data.author
  } catch (err) {
    console.error(
      'Error cargando autor:',
      err
    )

    error.value = 'No se pudo cargar el autor.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAuthor)
</script>

<style scoped>
.author-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px;
}

.eyebrow {
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 1px;
  color: #64748b;
}

h1 {
  margin-top: 8px;
}
</style>