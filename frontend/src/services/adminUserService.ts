import api from './api'

import type {
  AdminUser,
  UserListResponse,
} from '../models/user'


export async function getAdminUsers(
  page = 1,
  search = '',
  limit = 10
): Promise<UserListResponse> {

  const response =
    await api.get<UserListResponse>(
      '/api/admin/users',
      {
        params: {
          page,
          search: search.trim() || undefined,
          limit,
        },
      }
    )

  return response.data
}


export async function banUser(
  userId: string
): Promise<AdminUser> {

  const response =
    await api.patch<{ user: AdminUser }>(
      `/api/admin/users/${userId}/ban`
    )

  return response.data.user
}


export async function unbanUser(
  userId: string
): Promise<AdminUser> {

  const response =
    await api.patch<{ user: AdminUser }>(
      `/api/admin/users/${userId}/unban`
    )

  return response.data.user
}
