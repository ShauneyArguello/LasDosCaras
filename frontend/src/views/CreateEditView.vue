<template>
  <section class="publish-page">
    <div class="page-heading">
      <p class="eyebrow">Publicaciones</p>
      <h1>{{ isEditing ? 'Editar publicación' : 'Crear publicación' }}</h1>
      <p>
        Completa ambas caras del tema con fuentes independientes para cada lado.
      </p>
    </div>

    <div
      v-if="isLoading"
      class="state-card loading-state"
      role="status"
      aria-live="polite"
    >
      <span class="spinner" aria-hidden="true"></span>
      <span>Cargando formulario...</span>
    </div>

    <div
      v-else-if="loadError"
      class="state-card state-card--error"
      role="alert"
    >
      <p>{{ loadError }}</p>
      <button type="button" @click="loadInitialData">
        Reintentar
      </button>
    </div>

    <form
      v-else
      class="publish-form"
      novalidate
      :aria-busy="isSubmitting"
      @submit.prevent="handleSubmit"
    >
      <p
        v-if="submitError"
        class="auth-message auth-message--error"
        role="alert"
      >
        {{ submitError }}
      </p>

      <section class="form-card">
        <div class="form-grid">
          <div>
            <BaseInput
              id="publication-title"
              v-model="form.title"
              label="Título de la publicación"
              required
              maxlength="120"
              autocomplete="off"
              placeholder="Ej.: Reforma educativa nacional"
              :aria-invalid="Boolean(fieldErrors.title)"
              :aria-describedby="fieldErrors.title ? 'publication-title-error' : 'publication-title-counter'"
              @input="fieldErrors.title = ''"
            />
            <p
              id="publication-title-counter"
              class="counter"
              :class="{ 'counter--limit': titleCount >= 120 }"
            >
              {{ titleCount }} / 120 caracteres
            </p>
            <p
              v-if="fieldErrors.title"
              id="publication-title-error"
              class="field-error"
            >
              {{ fieldErrors.title }}
            </p>
          </div>

          <label class="field-group" for="publication-category">
            <span>Categoría</span>
            <select
              id="publication-category"
              v-model="form.categoryId"
              required
              :aria-invalid="Boolean(fieldErrors.categoryId)"
              :aria-describedby="fieldErrors.categoryId ? 'publication-category-error' : undefined"
              @change="fieldErrors.categoryId = ''"
            >
              <option value="">Selecciona una categoría</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <small
              v-if="fieldErrors.categoryId"
              id="publication-category-error"
              class="field-error"
            >
              {{ fieldErrors.categoryId }}
            </small>
          </label>
        </div>
      </section>

      <section class="form-card">
        <div class="section-heading">
          <h2>Postura (Lado A)</h2>
          <p>Explica el argumento principal de esta cara.</p>
        </div>

        <BaseInput
          id="side-title"
          v-model="form.side.title"
          label="Título descriptivo de la postura"
          required
          autocomplete="off"
          placeholder="Título del Lado A"
          :aria-invalid="Boolean(fieldErrors.sideTitle)"
          :aria-describedby="fieldErrors.sideTitle ? 'side-title-error' : undefined"
          @input="fieldErrors.sideTitle = ''"
        />
        <p v-if="fieldErrors.sideTitle" id="side-title-error" class="field-error">
          {{ fieldErrors.sideTitle }}
        </p>

        <label class="field-group" for="side-description">
          <span>Argumento principal</span>
          <textarea
            id="side-description"
            v-model="form.side.description"
            required
            minlength="100"
            rows="7"
            placeholder="Escribe mínimo 100 caracteres..."
            :aria-invalid="Boolean(fieldErrors.sideDescription)"
            :aria-describedby="fieldErrors.sideDescription ? 'side-description-error' : 'side-description-counter'"
            @input="fieldErrors.sideDescription = ''"
          />
          <small id="side-description-counter">
            {{ form.side.description.length }} caracteres
          </small>
          <small
            v-if="fieldErrors.sideDescription"
            id="side-description-error"
            class="field-error"
          >
            {{ fieldErrors.sideDescription }}
          </small>
        </label>

        <SourceEditor
          title="Fuentes del Lado A"
          :sources="form.side.sources"
          :error="fieldErrors.sideSources"
          @add="addSource('side')"
          @remove="removeSource('side', $event)"
        />
      </section>

      <section class="form-card">
        <div class="section-heading">
          <h2>Contrapostura (Lado B)</h2>
          <p>Presenta el argumento opuesto con sus propias fuentes.</p>
        </div>

        <BaseInput
          id="counterpart-title"
          v-model="form.counterpart.title"
          label="Título descriptivo de la contrapostura"
          required
          autocomplete="off"
          placeholder="Título del Lado B"
          :aria-invalid="Boolean(fieldErrors.counterpartTitle)"
          :aria-describedby="fieldErrors.counterpartTitle ? 'counterpart-title-error' : undefined"
          @input="fieldErrors.counterpartTitle = ''"
        />
        <p
          v-if="fieldErrors.counterpartTitle"
          id="counterpart-title-error"
          class="field-error"
        >
          {{ fieldErrors.counterpartTitle }}
        </p>

        <label class="field-group" for="counterpart-description">
          <span>Argumento opuesto</span>
          <textarea
            id="counterpart-description"
            v-model="form.counterpart.description"
            required
            minlength="100"
            rows="7"
            placeholder="Escribe mínimo 100 caracteres..."
            :aria-invalid="Boolean(fieldErrors.counterpartDescription)"
            :aria-describedby="fieldErrors.counterpartDescription ? 'counterpart-description-error' : 'counterpart-description-counter'"
            @input="fieldErrors.counterpartDescription = ''"
          />
          <small id="counterpart-description-counter">
            {{ form.counterpart.description.length }} caracteres
          </small>
          <small
            v-if="fieldErrors.counterpartDescription"
            id="counterpart-description-error"
            class="field-error"
          >
            {{ fieldErrors.counterpartDescription }}
          </small>
        </label>

        <SourceEditor
          title="Fuentes del Lado B"
          :sources="form.counterpart.sources"
          :error="fieldErrors.counterpartSources"
          @add="addSource('counterpart')"
          @remove="removeSource('counterpart', $event)"
        />
      </section>

      <section class="form-card">
        <div class="section-heading">
          <h2>Hashtags</h2>
          <p>Presiona Enter o coma para agregar etiquetas. Máximo 10.</p>
        </div>

        <div class="tag-input">
          <div class="chips">
            <span
              v-for="tag in form.hashtags"
              :key="tag"
              class="chip"
            >
              #{{ tag }}
              <button
                type="button"
                :aria-label="`Eliminar hashtag ${tag}`"
                @click="removeHashtag(tag)"
              >
                ×
              </button>
            </span>
          </div>

          <input
            v-model="hashtagQuery"
            type="text"
            maxlength="50"
            autocomplete="off"
            placeholder="Escribe un hashtag"
            @keydown.enter.prevent="addHashtag(hashtagQuery)"
            @keydown.comma.prevent="addHashtag(hashtagQuery)"
          />
        </div>

        <div v-if="hashtagSuggestions.length" class="suggestions">
          <button
            v-for="hashtag in hashtagSuggestions"
            :key="hashtag.id"
            type="button"
            @click="addHashtag(hashtag.name)"
          >
            #{{ hashtag.name }}
          </button>
        </div>

        <p v-if="fieldErrors.hashtags" class="field-error">
          {{ fieldErrors.hashtags }}
        </p>
      </section>

      <div class="form-actions">
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ submitButtonText }}
        </BaseButton>
        <button
          class="secondary-button"
          type="button"
          :disabled="isSubmitting"
          @click="cancel"
        >
          Cancelar
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios'
import {
  computed,
  defineComponent,
  h,
  onMounted,
  reactive,
  ref,
  watch,
  type PropType,
} from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import type { Category } from '../models/category'
import type { Hashtag } from '../models/hashtag'
import type { ViewSource } from '../models/view'
import { getCategories } from '../services/categoryService'
import { getHashtags } from '../services/hashtagService'
import {
  createView,
  getViewById,
  updateView,
  type SaveViewPayload,
} from '../services/viewService'
import { useDebounce } from '../composables/useDebounce'
import {
  CACHE_KEYS,
  CacheService,
} from '../services/cacheService'

type SourceForm = Omit<ViewSource, 'id'>
type SideKey = 'side' | 'counterpart'
type DraftForm = typeof form

const SourceEditor = defineComponent({
  name: 'SourceEditor',
  props: {
    title: {
      type: String,
      required: true,
    },
    sources: {
      type: Array as PropType<SourceForm[]>,
      required: true,
    },
    error: {
      type: String,
      default: '',
    },
  },
  emits: {
    add: () => true,
    remove: (_index: number) => true,
  },
  setup(props, { emit }) {
    function getYoutubeEmbedUrl(url: string) {
      const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
      )

      return match ? `https://www.youtube.com/embed/${match[1]}` : ''
    }

    return () =>
      h('div', { class: 'source-editor' }, [
        h('div', { class: 'source-header' }, [
          h('h3', props.title),
          h(
            'button',
            {
              type: 'button',
              class: 'secondary-button',
              onClick: () => emit('add'),
            },
            'Agregar fuente'
          ),
        ]),
        props.error
          ? h('p', { class: 'field-error' }, props.error)
          : null,
        ...props.sources.map((source, index) => {
          const section = props.title.includes('A') ? 'a' : 'b'
          const fieldId = `source-${section}-${index}`

          return h('div', { class: 'source-row', key: index }, [
            h('label', { class: 'field-group' }, [
              h('span', 'Tipo'),
              h(
                'select',
                {
                  id: `${fieldId}-type`,
                  required: true,
                  value: source.type,
                  onChange: (event: Event) => {
                    source.type = (event.target as HTMLSelectElement)
                      .value as SourceForm['type']
                  },
                },
                [
                  h('option', { value: 'LINK' }, 'Enlace'),
                  h('option', { value: 'YOUTUBE' }, 'YouTube'),
                  h('option', { value: 'DOCUMENT' }, 'Documento'),
                ]
              ),
            ]),
            h('label', { class: 'field-group' }, [
              h('span', 'URL'),
              h('input', {
                id: `${fieldId}-url`,
                type: 'url',
                required: true,
                value: source.url,
                placeholder: 'https://...',
                onInput: (event: Event) => {
                  source.url = (event.target as HTMLInputElement).value
                },
              }),
            ]),
            h('label', { class: 'field-group' }, [
              h('span', 'Título de la fuente'),
              h('input', {
                id: `${fieldId}-label`,
                required: true,
                value: source.label ?? '',
                placeholder: 'Nombre de referencia',
                onInput: (event: Event) => {
                  source.label = (event.target as HTMLInputElement).value
                },
              }),
            ]),
            h(
              'button',
              {
                type: 'button',
                class: 'danger-button',
                disabled: props.sources.length === 1,
                'aria-label': `Eliminar fuente ${index + 1} de ${props.title}`,
                onClick: () => emit('remove', index),
              },
              'Eliminar'
            ),
            source.type === 'YOUTUBE' && getYoutubeEmbedUrl(source.url)
              ? h('iframe', {
                  class: 'youtube-preview',
                  src: getYoutubeEmbedUrl(source.url),
                  title: 'Vista previa de YouTube',
                  allow:
                    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                  allowfullscreen: true,
                  loading: 'lazy',
                  referrerpolicy: 'strict-origin-when-cross-origin',
                })
              : null,
          ])
        }),
      ])
  },
})

const route = useRoute()
const router = useRouter()

const isEditing = computed(() => route.name === 'view-edit')
const viewId = computed(() => String(route.params.id ?? ''))

const categories = ref<Category[]>([])
const hashtagSuggestions = ref<Hashtag[]>([])
const hashtagQuery = ref('')
const debouncedHashtagQuery = useDebounce(hashtagQuery, 300)
const isLoading = ref(false)
const isSubmitting = ref(false)
const loadError = ref('')
const submitError = ref('')
const initialSnapshot = ref('')
const hasSubmitted = ref(false)
const allowNavigation = ref(false)

const form = reactive({
  title: '',
  categoryId: '',
  side: {
    title: '',
    description: '',
    sources: [createEmptySource()],
  },
  counterpart: {
    title: '',
    description: '',
    sources: [createEmptySource()],
  },
  hashtags: [] as string[],
})

const fieldErrors = reactive({
  title: '',
  categoryId: '',
  sideTitle: '',
  sideDescription: '',
  sideSources: '',
  counterpartTitle: '',
  counterpartDescription: '',
  counterpartSources: '',
  hashtags: '',
})

type FieldErrorKey = keyof typeof fieldErrors

const apiFieldMappings: Record<FieldErrorKey, string[]> = {
  title: ['title'],
  categoryId: ['categoryId', 'category.id', 'category'],
  sideTitle: ['side.title', 'sideTitle'],
  sideDescription: ['side.description', 'sideDescription'],
  sideSources: ['side.sources', 'sideSources', 'sources'],
  counterpartTitle: ['counterpart.title', 'counterpartTitle'],
  counterpartDescription: [
    'counterpart.description',
    'counterpartDescription',
  ],
  counterpartSources: ['counterpart.sources', 'counterpartSources'],
  hashtags: ['hashtags'],
}

const titleCount = computed(() => form.title.length)
const submitButtonText = computed(() => {
  if (isSubmitting.value) return 'Guardando...'
  return isEditing.value ? 'Guardar cambios' : 'Publicar'
})

const isDirty = computed(() => {
  return JSON.stringify(form) !== initialSnapshot.value
})

function createEmptySource(): SourceForm {
  return {
    type: 'LINK',
    url: '',
    label: '',
  }
}

function resetFieldErrors() {
  fieldErrors.title = ''
  fieldErrors.categoryId = ''
  fieldErrors.sideTitle = ''
  fieldErrors.sideDescription = ''
  fieldErrors.sideSources = ''
  fieldErrors.counterpartTitle = ''
  fieldErrors.counterpartDescription = ''
  fieldErrors.counterpartSources = ''
  fieldErrors.hashtags = ''
  submitError.value = ''
}

function firstApiError(value: unknown): string {
  if (Array.isArray(value)) {
    return firstApiError(value[0])
  }

  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

    return firstApiError(record.message ?? record._errors)
  }

  return ''
}

function getApiErrorAtPath(
  errors: Record<string, unknown>,
  path: string
): string {
  if (Object.prototype.hasOwnProperty.call(errors, path)) {
    return firstApiError(errors[path])
  }

  const nestedValue = path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined

    return (current as Record<string, unknown>)[key]
  }, errors)

  return firstApiError(nestedValue)
}

function applyApiFieldErrors(errors: unknown) {
  if (!errors || typeof errors !== 'object') return false

  let hasFieldError = false
  const apiErrors = errors as Record<string, unknown>

  Object.entries(apiFieldMappings).forEach(([field, paths]) => {
    const message =
      paths.map((path) => getApiErrorAtPath(apiErrors, path)).find(Boolean) ??
      ''

    if (message) {
      fieldErrors[field as FieldErrorKey] = message
      hasFieldError = true
    }
  })

  return hasFieldError
}

function normalizeTag(tag: string) {
  return tag.trim().replace(/^#/, '').toLowerCase()
}

function addHashtag(value: string) {
  const tag = normalizeTag(value)

  if (!tag) return

  if (form.hashtags.includes(tag)) {
    hashtagQuery.value = ''
    fieldErrors.hashtags = ''
    return
  }

  if (form.hashtags.length >= 10) {
    fieldErrors.hashtags = 'Solo puedes agregar hasta 10 hashtags.'
    return
  }

  form.hashtags.push(tag)

  hashtagQuery.value = ''
  fieldErrors.hashtags = ''
}

function removeHashtag(tag: string) {
  form.hashtags = form.hashtags.filter((item) => item !== tag)
}

function addSource(side: SideKey) {
  form[side].sources.push(createEmptySource())
}

function removeSource(side: SideKey, index: number) {
  if (form[side].sources.length === 1) return
  form[side].sources.splice(index, 1)
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateSources(sources: SourceForm[]) {
  if (sources.length === 0) return false

  return sources.every((source) => {
    return Boolean(
      source.type &&
      source.url.trim() &&
      isValidUrl(source.url.trim()) &&
      source.label?.trim()
    )
  })
}

function validateForm() {
  resetFieldErrors()
  let valid = true

  if (!form.title.trim()) {
    fieldErrors.title = 'El título de la publicación es requerido.'
    valid = false
  } else if (form.title.length > 120) {
    fieldErrors.title = 'El título no puede superar 120 caracteres.'
    valid = false
  }

  if (!form.categoryId) {
    fieldErrors.categoryId = 'Selecciona una categoría.'
    valid = false
  }

  if (!form.side.title.trim()) {
    fieldErrors.sideTitle = 'El título del Lado A es requerido.'
    valid = false
  }

  if (form.side.description.trim().length < 100) {
    fieldErrors.sideDescription =
      'El argumento del Lado A debe tener al menos 100 caracteres.'
    valid = false
  }

  if (!validateSources(form.side.sources)) {
    fieldErrors.sideSources =
      'Agrega al menos una fuente válida con URL y título para el Lado A.'
    valid = false
  }

  if (!form.counterpart.title.trim()) {
    fieldErrors.counterpartTitle = 'El título del Lado B es requerido.'
    valid = false
  }

  if (form.counterpart.description.trim().length < 100) {
    fieldErrors.counterpartDescription =
      'El argumento del Lado B debe tener al menos 100 caracteres.'
    valid = false
  }

  if (!validateSources(form.counterpart.sources)) {
    fieldErrors.counterpartSources =
      'Agrega al menos una fuente válida con URL y título para el Lado B.'
    valid = false
  }

  if (!valid) {
    submitError.value =
      'Hay campos incompletos o inválidos. Revisa los mensajes marcados en rojo.'
  }

  return valid
}

function scrollToFirstError() {
  requestAnimationFrame(() => {
    const firstError = document.querySelector(
      '.field-error, .auth-message--error'
    )

    firstError?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
}

function sanitizeSources(sources: SourceForm[]) {
  return sources.map((source) => ({
    type: source.type,
    url: source.url.trim(),
    label: source.label?.trim() || undefined,
  }))
}

function buildPayload(): SaveViewPayload {
  return {
    title: form.title.trim(),
    categoryId: form.categoryId,
    side: {
      title: form.side.title.trim(),
      description: form.side.description.trim(),
      sources: sanitizeSources(form.side.sources),
    },
    counterpart: {
      title: form.counterpart.title.trim(),
      description: form.counterpart.description.trim(),
      sources: sanitizeSources(form.counterpart.sources),
    },
    hashtags: form.hashtags,
  }
}

function fillFormFromView(view: Awaited<ReturnType<typeof getViewById>>) {
  const side = view.sides.find((item) => item.type === 'SIDE')
  const counterpart = view.sides.find((item) => item.type === 'COUNTERPART')

  form.title = side?.title ?? ''
  form.categoryId = view.category.id
  form.side.title = side?.title ?? ''
  form.side.description = side?.description ?? ''
  form.side.sources = side?.sources?.length
    ? side.sources.map((source) => ({
        type: source.type,
        url: source.url,
        label: source.label ?? '',
      }))
    : [createEmptySource()]
  form.counterpart.title = counterpart?.title ?? ''
  form.counterpart.description = counterpart?.description ?? ''
  form.counterpart.sources = counterpart?.sources?.length
    ? counterpart.sources.map((source) => ({
        type: source.type,
        url: source.url,
        label: source.label ?? '',
      }))
    : [createEmptySource()]
  form.hashtags = view.hashtags?.map((tag) => tag.name) ?? []
}

function fillFormFromDraft(draft: DraftForm) {
  form.title = draft.title ?? ''
  form.categoryId = draft.categoryId ?? ''
  form.side.title = draft.side?.title ?? ''
  form.side.description = draft.side?.description ?? ''
  form.side.sources = draft.side?.sources?.length
    ? draft.side.sources
    : [createEmptySource()]
  form.counterpart.title = draft.counterpart?.title ?? ''
  form.counterpart.description = draft.counterpart?.description ?? ''
  form.counterpart.sources = draft.counterpart?.sources?.length
    ? draft.counterpart.sources
    : [createEmptySource()]
  form.hashtags = draft.hashtags ?? []
}

function restoreDraftIfAvailable() {
  if (isEditing.value) return

  const draft =
    CacheService.getStale<DraftForm>(
      CACHE_KEYS.draft
    )

  if (!draft) return

  const shouldRestore = window.confirm(
    'Hay un borrador guardado. ¿Deseas restaurarlo?'
  )

  if (shouldRestore) {
    fillFormFromDraft(draft)
  } else {
    CacheService.remove(CACHE_KEYS.draft)
  }
}

async function loadInitialData() {
  isLoading.value = true
  loadError.value = ''

  try {
    const [categoryList, currentView] = await Promise.all([
      getCategories(),
      isEditing.value ? getViewById(viewId.value) : Promise.resolve(null),
    ])

    categories.value = categoryList

    if (currentView) {
      fillFormFromView(currentView)
    } else {
      restoreDraftIfAvailable()
    }

    initialSnapshot.value = JSON.stringify(form)
    hasSubmitted.value = false
    allowNavigation.value = false
  } catch (error) {
    console.error('Error cargando formulario:', error)
    loadError.value =
      'No se pudo cargar la información necesaria para esta pantalla.'
  } finally {
    isLoading.value = false
  }
}

async function loadHashtagSuggestions(query: string) {
  if (!query.trim()) {
    hashtagSuggestions.value = []
    return
  }

  try {
    const result = await getHashtags(query)
    hashtagSuggestions.value = result.filter(
      (hashtag) => !form.hashtags.includes(hashtag.name)
    )
  } catch (error) {
    console.error('Error cargando sugerencias de hashtags:', error)
    hashtagSuggestions.value = []
  }
}

function applySubmitError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    submitError.value =
      error instanceof Error ? error.message : 'No se pudo guardar la publicación.'
    return
  }

  const status = error.response?.status
  const data = error.response?.data

  if (status === 400 || status === 422) {
    resetFieldErrors()

    const apiFields =
      data?.details?.fieldErrors ??
      data?.fieldErrors ??
      data?.errors ??
      {}
    const hasFieldErrors = applyApiFieldErrors(apiFields)

    submitError.value =
      hasFieldErrors
        ? 'Revisa los campos indicados en el formulario.'
        : data?.message ?? data?.error ?? 'Revisa los datos del formulario.'

    if (hasFieldErrors) {
      scrollToFirstError()
    }

    return
  }

  if (status === 401) {
    router.push({
      name: 'login',
      query: { redirect: route.fullPath },
    })
    return
  }

  if (status === 403) {
    submitError.value =
      'No tienes permiso para editar esta publicación.'
    return
  }

  submitError.value =
    data?.error ??
    'No fue posible conectar con el servidor.'
}

async function handleSubmit() {
  if (isSubmitting.value) return

  if (!validateForm()) {
    scrollToFirstError()
    return
  }

  isSubmitting.value = true

  try {
    const payload = buildPayload()
    const savedView = isEditing.value
      ? await updateView(viewId.value, payload)
      : await createView(payload)

    hasSubmitted.value = true
    CacheService.remove(CACHE_KEYS.draft)
    initialSnapshot.value = JSON.stringify(form)
    await router.push(`/views/${savedView.id}`)
  } catch (error) {
    applySubmitError(error)
  } finally {
    isSubmitting.value = false
  }
}

function cancel() {
  if (
    isDirty.value &&
    !window.confirm('Tienes cambios sin guardar. ¿Deseas salir?')
  ) {
    return
  }

  allowNavigation.value = true
  CacheService.remove(CACHE_KEYS.draft)
  router.back()
}

watch(debouncedHashtagQuery, loadHashtagSuggestions)

watch(
  form,
  () => {
    if (
      isEditing.value ||
      isLoading.value ||
      hasSubmitted.value
    ) {
      return
    }

    CacheService.set(CACHE_KEYS.draft, {
      title: form.title,
      categoryId: form.categoryId,
      side: {
        title: form.side.title,
        description: form.side.description,
        sources: form.side.sources,
      },
      counterpart: {
        title: form.counterpart.title,
        description: form.counterpart.description,
        sources: form.counterpart.sources,
      },
      hashtags: form.hashtags,
    })
  },
  {
    deep: true,
  }
)

onBeforeRouteLeave(() => {
  if (hasSubmitted.value || allowNavigation.value || !isDirty.value) {
    return true
  }

  return window.confirm('Tienes cambios sin guardar. ¿Deseas salir?')
})

onMounted(loadInitialData)
</script>

<style scoped>
.publish-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-heading {
  max-width: 760px;
}

.page-heading h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 36px;
  line-height: 1.1;
}

.page-heading p {
  color: var(--text-secondary);
}

.publish-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-card,
.state-card {
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.state-card--error {
  color: #991b1b;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(220px, 0.7fr);
  gap: 1rem;
}

.section-heading h2,
.source-header h3 {
  margin: 0;
}

.section-heading p {
  margin: 0.35rem 0 1rem;
  color: var(--text-secondary);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
}

.field-group input,
.field-group select,
.field-group textarea,
.tag-input input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
}

.field-group textarea {
  resize: vertical;
}

.field-group small,
.counter {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.counter--limit,
.field-error {
  color: #dc2626;
}

.field-group .field-error {
  color: #dc2626;
  font-weight: 600;
}

:deep(.field-error) {
  color: #dc2626;
  font-weight: 600;
}

.field-group textarea[aria-invalid='true'],
.field-group input[aria-invalid='true'],
.field-group select[aria-invalid='true'] {
  border-color: #dc2626;
}

.source-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.source-header,
.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.source-row {
  display: grid;
  grid-template-columns: 150px minmax(220px, 1fr) minmax(180px, 0.8fr) auto;
  align-items: end;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-muted);
}

.youtube-preview {
  grid-column: 1 / -1;
  width: 100%;
  min-height: 260px;
  border: 0;
  border-radius: 12px;
}

.tag-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chips,
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip,
.suggestions button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--text-primary);
}

.chip button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.suggestions button,
.secondary-button,
.danger-button {
  cursor: pointer;
}

.secondary-button,
.danger-button {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
}

.danger-button {
  color: #dc2626;
}

.danger-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.auth-message {
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.auth-message--error {
  border: 1px solid #fecaca;
  color: #991b1b;
  background: #fee2e2;
}

:deep(.source-editor) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

:deep(.source-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

:deep(.source-header h3) {
  margin: 0;
}

:deep(.source-row) {
  display: grid;
  grid-template-columns: 150px minmax(220px, 1fr) minmax(180px, 0.8fr) auto;
  align-items: end;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-muted);
}

:deep(.field-group) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
}

:deep(.field-group input),
:deep(.field-group select) {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
}

:deep(.youtube-preview) {
  grid-column: 1 / -1;
  width: 100%;
  min-height: 260px;
  border: 0;
  border-radius: 12px;
}

:deep(.secondary-button),
:deep(.danger-button) {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
}

:deep(.danger-button) {
  color: #dc2626;
}

:deep(.danger-button:disabled) {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 820px) {
  .form-grid,
  .source-row,
  :deep(.source-row) {
    grid-template-columns: 1fr;
  }
}
</style>
