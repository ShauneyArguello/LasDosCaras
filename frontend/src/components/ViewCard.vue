<template>
  <article class="view-card">
    <div class="view-header">
      <span class="category">
        {{ view.category.name }}
      </span>

      <span class="date">
        {{ formattedDate }}
      </span>
    </div>

    <h2>
      {{ sideA?.title || 'Sin título' }}
    </h2>

    <div class="author">
      Por {{ view.author.name }}
    </div>

    <div class="sides">
      <section class="side side-a">
        <h3>Lado A</h3>

        <p>
          {{ sideA?.description || 'Sin descripción disponible.' }}
        </p>
      </section>

      <section class="side side-b">
        <h3>Lado B</h3>

        <p>
          {{ sideB?.description || 'Sin descripción disponible.' }}
        </p>
      </section>
    </div>

    <div class="view-stats">
      <span>
        👍 {{ view.totalLikes ?? 0 }}
      </span>

      <span>
        👎 {{ view.totalDislikes ?? 0 }}
      </span>
    </div>

    <RouterLink
      :to="`/views/${view.id}`"
      class="detail-button"
    >
      Ver detalle
    </RouterLink>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { View } from '../models/view'

const props = defineProps<{
  view: View
}>()

const sideA = computed(() =>
  props.view.sides.find(
    side => side.type === 'SIDE'
  )
)

const sideB = computed(() =>
  props.view.sides.find(
    side => side.type === 'COUNTERPART'
  )
)

const formattedDate = computed(() => {
  if (!props.view.createdAt) {
    return ''
  }

  return new Date(
    props.view.createdAt
  ).toLocaleDateString()
})
</script>