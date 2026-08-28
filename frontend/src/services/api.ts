import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
} from 'axios'
import router from '../router'
import {
  CACHE_KEYS,
  CacheService,
} from './cacheService'
import { useNotificationStore } from '../stores/notifications'

type RetryableConfig = AxiosRequestConfig & {
  _networkRetry?: boolean
}

function getStoredToken(): string {
  const cachedAuth = CacheService.getStale<{
    token: string
  }>(CACHE_KEYS.auth)

  return cachedAuth?.token ?? CacheService.getRaw('token') ?? ''
}

function clearStoredAuth() {
  CacheService.remove(CACHE_KEYS.auth)
  CacheService.remove(CACHE_KEYS.favorites)
  CacheService.removeRaw('token')
  CacheService.removeRaw('user')
  CacheService.removeRaw(CACHE_KEYS.favorites)
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function notifyError(message: string) {
  try {
    useNotificationStore().notify(message, 'error')
  } catch {
    // Pinia may not be active during module initialization.
  }
}

function shouldSkipGlobalNotification(url?: string) {
  return Boolean(
    url?.includes('/api/auth/login') ||
    url?.includes('/api/auth/register')
  )
}

function getHttpErrorMessage(status?: number) {
  if (status === 400) return 'Revisa los datos enviados.'
  if (status === 401) return 'Su sesión ha expirado.'
  if (status === 403) return 'No tienes permiso para esta acción.'
  if (status === 404) return 'El recurso solicitado no existe.'
  if (status === 409) return 'El recurso ya existe o tiene datos relacionados.'
  if (status === 422) return 'Los datos no cumplen las reglas requeridas.'
  if (status && status >= 500) {
    return 'Ocurrió un error en el servidor. Intente más tarde.'
  }

  return 'No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.'
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase() ?? 'get'

  if (!navigator.onLine && method !== 'get') {
    notifyError('No es posible realizar esta acción sin conexión al servidor.')

    return Promise.reject(
      new Error('No es posible realizar esta acción sin conexión al servidor.')
    )
  }

  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined
    const method = config?.method?.toLowerCase() ?? 'get'

    if (!error.response && config && method === 'get' && !config._networkRetry) {
      config._networkRetry = true
      await sleep(500)
      return api.request(config)
    }

    if (!shouldSkipGlobalNotification(config?.url)) {
      notifyError(getHttpErrorMessage(error.response?.status))
    }

    if (error.response?.status === 401) {
      clearStoredAuth()

      if (router.currentRoute.value.name !== 'login') {
        await router.push({
          name: 'login',
          query: {
            redirect: router.currentRoute.value.fullPath,
            expired: '1',
          },
        })
      }
    }

    return Promise.reject(error)
  }
)

export default api;
