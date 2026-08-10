<template>
  <section class="placeholder-page">
    <p class="eyebrow">BUSQUEDA</p>
    <h1>Resultados</h1>
    <p v-if="query">
      Resultados para: "{{ query }}"
    </p>
    <p v-else>
      Ingresa un termino de busqueda.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const query = computed(() => String(route.query.q ?? '').trim())
</script>
