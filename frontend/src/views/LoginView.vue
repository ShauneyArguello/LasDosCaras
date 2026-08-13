<template>
  <section class="auth-page">
    <p class="eyebrow">Acceso</p>
    <h1>Iniciar sesión</h1>

    <form class="auth-form" novalidate :aria-busy="isSubmitting" @submit.prevent="handleSubmit">
      <BaseInput
        id="login-email"
        v-model="form.email"
        label="Correo electrónico"
        type="email"
        placeholder="correo@ejemplo.com"
        autocomplete="email"
        required
        :aria-invalid="Boolean(fieldErrors.email)"
        :aria-describedby="fieldErrors.email ? 'login-email-error' : undefined"
        @update:model-value="fieldErrors.email = ''"
      />
      <p v-if="fieldErrors.email" id="login-email-error" class="field-error">
        {{ fieldErrors.email }}
      </p>

      <div class="password-row">
        <BaseInput
          id="login-password"
          v-model="form.password"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Tu contraseña"
          autocomplete="current-password"
          required
          :aria-invalid="Boolean(fieldErrors.password)"
          :aria-describedby="fieldErrors.password ? 'login-password-error' : undefined"
          @update:model-value="fieldErrors.password = ''"
        />
        <button
          class="toggle-password"
          type="button"
          :aria-pressed="showPassword"
          aria-controls="login-password"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? 'Ocultar' : 'Mostrar' }}
        </button>
      </div>
      <p v-if="fieldErrors.password" id="login-password-error" class="field-error">
        {{ fieldErrors.password }}
      </p>

      <p v-if="errorMessage" class="auth-message auth-message--error">
        {{ errorMessage }}
      </p>

      <BaseButton type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Iniciando…' : 'Iniciar sesión' }}
      </BaseButton>

      <RouterLink class="auth-link" to="/register">
        ¿No tienes cuenta? Regístrate
      </RouterLink>
    </form>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios'
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import { getFavoriteIds, loginUser } from '../services/authService'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const fieldErrors = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

function clearMessages() {
  errorMessage.value = ''
  fieldErrors.email = ''
  fieldErrors.password = ''
}

function validateForm() {
  let isValid = true

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    fieldErrors.email = 'Ingresa un correo electrónico válido.'
    isValid = false
  }

  if (!form.password) {
    fieldErrors.password = 'Ingresa tu contraseña.'
    isValid = false
  }

  return isValid
}

function applyApiErrors(error: unknown) {
  if (!axios.isAxiosError(error)) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No se pudo iniciar sesión.'
    return
  }

  const status = error.response?.status
  const data = error.response?.data

  if (status === 401) {
    errorMessage.value = 'Correo o contraseña incorrectos.'
    return
  }

  if (status === 403) {
    const serverMessage = data?.error ?? data?.message

    if (serverMessage === 'Account is pending activation') {
      errorMessage.value = 'La cuenta está pendiente de activación.'
    } else if (serverMessage === 'Account is suspended') {
      errorMessage.value = 'La cuenta está suspendida.'
    } else {
      errorMessage.value = 'No tienes permiso para iniciar sesión.'
    }
    return
  }

  errorMessage.value =
    data?.message ??
    data?.error ??
    'No fue posible conectar con el servidor. Verifica la URL del API.'
}

async function handleSubmit() {
  clearMessages()

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const { token, user } = await loginUser({
      email: form.email.trim(),
      password: form.password,
    })

    if (!token) {
      throw new Error('El servidor no devolvió un token.')
    }

    authStore.setAuth(token, user)

    try {
      authStore.setFavorites(await getFavoriteIds())
    } catch (favoritesError) {
      console.warn('No se pudieron cargar los favoritos:', favoritesError)
      authStore.setFavorites([])
    }

    const requestedDestination =
      typeof route.query.redirect === 'string' &&
      route.query.redirect.startsWith('/') &&
      !route.query.redirect.startsWith('//')
        ? route.query.redirect
        : '/board'

    await router.push(requestedDestination)
  } catch (error) {
    applyApiErrors(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.auth-page {
  max-width: 520px;
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.auth-page h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 36px;
  line-height: 1.1;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.password-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 10px;
}

.toggle-password {
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
  cursor: pointer;
}

.toggle-password:hover {
  background: var(--surface-muted);
}

.auth-message,
.field-error {
  margin: 0;
  font-size: 14px;
}

.auth-message {
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 600;
}

.auth-message--error {
  border: 1px solid #fecaca;
  color: #991b1b;
  background: #fee2e2;
}

.field-error {
  color: #dc2626;
}

.auth-link {
  align-self: flex-start;
  color: var(--accent);
  font-weight: 700;
  text-decoration: none;
}

.auth-link:hover {
  color: var(--accent-strong);
}

@media (max-width: 520px) {
  .password-row {
    grid-template-columns: 1fr;
  }
}
</style>
