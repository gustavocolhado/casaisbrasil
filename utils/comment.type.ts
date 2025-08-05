export interface Comment {
  id: string
  content: string
  createdAt: string
  userId?: string
  postId: string
  parentId?: string | null
  likesCount: number
  isLiked: boolean
  type: 'user' | 'visitor'
  user?: {
    username: string
    image?: string
    premium?: boolean
  }
  username?: string // Para comentários de visitantes
  replies: Comment[]
}

export interface VisitorComment {
  id: string
  content: string
  createdAt: string
  username: string
  postId: string
  post?: {
    id: string
  } | null
}

export interface CreateCommentData {
  postId: string
  content: string
  userId?: string
  username?: string
  parentId?: string
} 