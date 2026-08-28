import api from './api'

export interface CommentAuthor {
  id: string
  name: string
}

export interface ViewComment {
  id: string
  content: string
  createdAt: string
  user: CommentAuthor
  replies?: ViewComment[]
}

export interface CommentThread {
  id: string
  title?: string | null
  createdAt: string
  comments: ViewComment[]
}

export async function getViewThreads(
  viewId: string
): Promise<CommentThread[]> {
  const response = await api.get<{ threads: CommentThread[] }>(
    `/api/views/${viewId}/threads`
  )

  return response.data.threads ?? []
}

export async function createViewThread(
  viewId: string,
  payload: {
    title?: string
    content: string
  }
): Promise<CommentThread> {
  const response = await api.post<{ thread: CommentThread }>(
    `/api/views/${viewId}/threads`,
    payload
  )

  return response.data.thread
}

export async function createThreadComment(
  viewId: string,
  threadId: string,
  content: string
): Promise<ViewComment> {
  const response = await api.post<{ comment: ViewComment }>(
    `/api/views/${viewId}/threads/${threadId}/comments`,
    { content }
  )

  return response.data.comment
}
