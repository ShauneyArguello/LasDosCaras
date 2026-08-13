<template>
  <section class="auth-page">
    <p class="eyebrow">Acceso</p>
    <h1>Login</h1>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <BaseInput
        id="login-email"
        v-model="form.email"
        label="Correo electronico"
        type="email"
        placeholder="correo@ejemplo.com"
      />
      <p v-if="fieldErrors.email" class="field-error">
        {{ fieldErrors.email }}
      </p>

      <div class="password-row">
        <BaseInput
          id="login-password"
          v-model="form.password"
          label="Contrasena"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Tu contrasena"
        />
        <button
          class="toggle-password"
          type="button"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? 'Ocultar' : 'Mostrar' }}
        </button>
      </div>
      <p v-if="fieldErrors.password" class="field-error">
        {{ fieldErrors.password }}
      </p>

      <p v-if="errorMessage" class="auth-message auth-message--error">
        {{ errorMessage }}
      </p>

      <BaseButton type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Iniciando...' : 'Iniciar sesion' }}
      </BaseButton>

      <RouterLink class="auth-link" to="/register">
        No tienes cuenta? Registrate
      </RouterLink>
    </form>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios'
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import { loginUser } from '../services/authService'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
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
    fieldErrors.email = 'Ingresa un correo electronico valido.'
    isValid = false
  }

  if (!form.password) {
    fieldErrors.password = 'Ingresa tu contrasena.'
    isValid = false
  }

  return isValid
}

function applyApiErrors(error: unknown) {
  if (!axios.isAxiosError(error)) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No se pudo iniciar sesion.'
    return
  }

  const status = error.response?.status
  const data = error.response?.data

  if (status === 401) {
    errorMessage.value = 'Correo o contrasena incorrectos.'
    return
  }

  if (status === 403) {
    errorMessage.value =
      data?.message === 'Account is pending activation'
        ? 'La cuenta esta pendiente de activacion.'
        : 'No tienes permiso para iniciar sesion.'
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
      throw new Error('El servidor no devolvio un token.')
    }

    authStore.setAuth(token, user)
    await router.push('/board')
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
