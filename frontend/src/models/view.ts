export interface ViewSource {
  id?: string
  type: 'LINK' | 'YOUTUBE' | 'DOCUMENT'
  url: string
  label?: string
}

export interface ViewSide {
  id?: string
  type: 'SIDE' | 'COUNTERPART'
  title: string
  description?: string
  sources?: ViewSource[]
  likeCount?: number
  dislikeCount?: number
  myReaction?: string | null
}

export interface ViewCategory {
  id: string
  name: string
}

export interface ViewAuthor {
  id: string
  name: string
}

export interface ViewHashtag {
  id: string
  name: string
}

export interface View {
  id: string
  category: ViewCategory
  author: ViewAuthor
  sides: ViewSide[]
  hashtags?: ViewHashtag[]
  createdAt?: string
  updatedAt?: string
  totalLikes?: number
  totalDislikes?: number
  isFavorite?: boolean
}

export interface ViewListResponse {
  total: number
  page: number
  limit: number
  views: View[]
}