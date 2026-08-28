export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export interface UserListResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}