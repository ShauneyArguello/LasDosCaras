<template>
  <section class="auth-page">
    <p class="eyebrow">Cuenta nueva</p>
    <h1>Registro</h1>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        id="name"
        v-model="form.name"
        label="Nombre completo"
        placeholder="Tu nombre completo"
        autocomplete="name"
        required
        :minlength="3"
        :aria-invalid="Boolean(fieldErrors.name)"
        :aria-describedby="fieldErrors.name ? 'name-error' : undefined"
        @update:model-value="fieldErrors.name = ''"
      />
      <p v-if="fieldErrors.name" id="name-error" class="field-error">
        {{ fieldErrors.name }}
      </p>

      <BaseInput
        id="email"
        v-model="form.email"
        label="Correo electrónico"
        type="email"
        placeholder="correo@ejemplo.com"
        autocomplete="email"
        required
        :aria-invalid="Boolean(fieldErrors.email)"
        :aria-describedby="fieldErrors.email ? 'email-error' : undefined"
        @update:model-value="fieldErrors.email = ''"
      />
      <p v-if="fieldErrors.email" id="email-error" class="field-error">
        {{ fieldErrors.email }}
      </p>

      <BaseInput
        id="password"
        v-model="form.password"
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        autocomplete="new-password"
        required
        :minlength="8"
        :aria-invalid="Boolean(fieldErrors.password)"
        aria-describedby="password-strength password-error"
        @update:model-value="fieldErrors.password = ''"
      />
      <div
        id="password-strength"
        class="password-strength"
        :class="passwordStrengthClass"
        role="status"
        aria-live="polite"
      >
        <span>Fortaleza: {{ passwordStrengthLabel }}</span>
        <span class="password-strength__bars" aria-hidden="true">
          <i v-for="level in 4" :key="level" :class="{ active: level <= passwordStrength }" />
        </span>
      </div>
      <p v-if="fieldErrors.password" id="password-error" class="field-error">
        {{ fieldErrors.password }}
      </p>

      <BaseInput
        id="confirm-password"
        v-model="form.confirmPassword"
        label="Confirmar contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        autocomplete="new-password"
        required
        :minlength="8"
        :aria-invalid="Boolean(fieldErrors.confirmPassword)"
        :aria-describedby="fieldErrors.confirmPassword ? 'confirm-password-error' : undefined"
        @update:model-value="fieldErrors.confirmPassword = ''"
      />
      <p v-if="fieldErrors.confirmPassword" id="confirm-password-error" class="field-error">
        {{ fieldErrors.confirmPassword }}
      </p>

      <p v-if="errorMessage" class="auth-message auth-message--error">
        {{ errorMessage }}
      </p>

      <p v-if="successMessage" class="auth-message auth-message--success">
        {{ successMessage }}
      </p>

      <BaseButton type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Registrando…' : 'Registrarse' }}
      </BaseButton>

      <RouterLink class="auth-link" to="/login">
        ¿Ya tienes cuenta? Inicia sesión
      </RouterLink>
    </form>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import { activateUser, registerUser } from '../services/authService'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const fieldErrors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const passwordStrength = computed(() => {
  let score = 0

  if (form.password.length >= 8) score++
  if (/[A-Z]/.test(form.password)) score++
  if (/[0-9]/.test(form.password)) score++
  if (/[^A-Za-z0-9]/.test(form.password)) score++

  return score
})

const passwordStrengthLabel = computed(() => {
  if (!form.password) return 'sin completar'
  if (passwordStrength.value <= 1) return 'débil'
  if (passwordStrength.value <= 3) return 'media'
  return 'fuerte'
})

const passwordStrengthClass = computed(() => ({
  'password-strength--weak': form.password && passwordStrength.value <= 1,
  'password-strength--medium': passwordStrength.value > 1 && passwordStrength.value <= 3,
  'password-strength--strong': passwordStrength.value > 3,
}))

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
  fieldErrors.name = ''
  fieldErrors.email = ''
  fieldErrors.password = ''
  fieldErrors.confirmPassword = ''
}

function validateForm() {
  let isValid = true

  if (form.name.trim().length < 3) {
    fieldErrors.name = 'El nombre debe tener al menos 3 caracteres.'
    isValid = false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    fieldErrors.email = 'Ingresa un correo electrónico válido.'
    isValid = false
  }

  if (form.password.length < 8) {
    fieldErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    isValid = false
  }

  if (form.confirmPassword !== form.password) {
    fieldErrors.confirmPassword = 'Las contraseñas no coinciden.'
    isValid = false
  }

  return isValid
}

function applyApiErrors(error: unknown) {
  if (!axios.isAxiosError(error)) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No se pudo registrar el usuario.'
    return
  }

  const status = error.response?.status
  const data = error.response?.data

  if (status === 409) {
    fieldErrors.email = 'El correo ya está registrado.'
    return
  }

  if (status === 400 || status === 422) {
    const apiFields = data?.details?.fieldErrors ?? data?.errors ?? {}
    const firstError = (value: string | string[] | undefined) =>
      Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

    fieldErrors.name = firstError(apiFields.name)
    fieldErrors.email = firstError(apiFields.email)
    fieldErrors.password = firstError(apiFields.password)
    errorMessage.value =
      data?.error === 'Validation failed'
        ? 'Revisa los datos indicados en el formulario.'
        : data?.message ?? data?.error ?? 'Revisa los datos del formulario.'
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
    const { token, user, activationToken } = await registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    })

    if (token) {
      authStore.setAuth(token, user)
      await router.push('/board')
      return
    }

    if (activationToken) {
      await activateUser(activationToken)
    }

    successMessage.value = 'Cuenta creada correctamente. Redirigiendo al login...'
    await router.push('/login')
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

.auth-message--success {
  border: 1px solid #bbf7d0;
  color: #166534;
  background: #dcfce7;
}

.field-error {
  color: #dc2626;
}

.password-strength {
  display: grid;
  gap: 6px;
  margin: 0 0 2px;
  color: var(--text-secondary);
  font-size: 13px;
}

.password-strength__bars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.password-strength__bars i {
  height: 5px;
  border-radius: 999px;
  background: var(--border);
  transition: background-color 180ms ease;
}

.password-strength--weak {
  color: #dc2626;
}

.password-strength--weak .active {
  background: #dc2626;
}

.password-strength--medium {
  color: #ca8a04;
}

.password-strength--medium .active {
  background: #ca8a04;
}

.password-strength--strong {
  color: #16a34a;
}

.password-strength--strong .active {
  background: #16a34a;
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
</style>
