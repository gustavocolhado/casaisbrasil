export interface User {
  name: string
  username: string
  avatar: string
  verified: boolean
  location: string
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  userId?: string
  username?: string
  user?: {
    username: string
    image: string
  }
  type: 'user' | 'visitor'
  isLiked: boolean
  likesCount: number
  replies: Comment[]
}

export interface Post {
  id: string
  user: User
  content: string
  image?: string
  video?: string
  images?: string[] // Array de múltiplas imagens
  videos?: string[] // Array de múltiplos vídeos
  mediaType: 'none' | 'image' | 'video' | 'multiple'
  timestamp: string
  comments: number
  reactions: number
  commentsList?: Comment[] // Lista de comentários do post
} 