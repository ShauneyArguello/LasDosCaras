import api from './api'

export type AuthUser = {
  id?: string
  name?: string
  nombre?: string
  email?: string
  role?: string
  rol?: string
  status?: string
  createdAt?: string
  fechaRegistro?: string
}

type RegisterPayload = {
  name: string
  email: string
  password: string
}

type AuthResponse = {
  token?: string
  user?: AuthUser
  activationToken?: string
}

type LoginPayload = {
  email: string
  password: string
}

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post<AuthResponse>(
    '/api/auth/register',
    payload
  )

  const { activationToken, token } = response.data
  const user = response.data.user ?? null

  return {
    token,
    user,
    activationToken,
  }
}

export async function activateUser(
  activationToken: string
) {
  const response = await api.get<{ user: AuthUser }>(
    `/api/auth/activate/${activationToken}`
  )

  return response.data.user
}

export async function loginUser(
  payload: LoginPayload
) {
  const response = await api.post<AuthResponse>(
    '/api/auth/login',
    payload
  )

  const { token } = response.data
  const user = response.data.user ?? null

  return {
    token,
    user,
  }
}

export async function getFavoriteIds() {
  const response = await api.get<{ favorites: string[] }>(
    '/api/users/me/favorites'
  )

  return response.data.favorites ?? []
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<{ user: AuthUser }>(
    '/api/auth/me'
  )

  return response.data.user
}
