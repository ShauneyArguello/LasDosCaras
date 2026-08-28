import api from './api'

export type AdminViewStatus =
  | 'PUBLISHED'
  | 'UNPUBLISHED'

export interface AdminViewSide {
  id: string
  type: 'SIDE' | 'COUNTERPART'
  title: string
  description: string
  likeCount: number
  dislikeCount: number
}

export interface AdminView {
  id: string
  status: AdminViewStatus
  createdAt: string

  author: {
    id: string
    name: string
  }

  category: {
    id: string
    name: string
  }

  sides: AdminViewSide[]

  hashtags: {
    id: string
    name: string
  }[]

  totalLikes: number
  totalDislikes: number
}

export interface AdminViewsResponse {
  total: number
  page: number
  limit: number
  views: AdminView[]
}

export async function getAdminViews(
  status?: AdminViewStatus,
  page = 1,
  limit = 20
): Promise<AdminViewsResponse> {

  const response = await api.get(
    '/api/admin/views',
    {
      params: {
        status: status || undefined,
        page,
        limit,
      },
    }
  )

  return response.data
}

export async function unpublishView(
  viewId: string
): Promise<void> {

  await api.patch(
    `/api/views/${viewId}/unpublish`
  )
}

export async function publishView(
  viewId: string
): Promise<void> {

  await api.patch(
    `/api/views/${viewId}/publish`
  )
}