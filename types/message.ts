export interface Message {
  id: string
  senderId?: string
  receiverId?: string
  content?: string
  medias?: string[]
  timestamp: string
  read?: boolean
  sender?: {
    id: string
    name: string
    username: string
    image?: string
    premium: boolean
  }
  receiver?: {
    id: string
    name: string
    username: string
    image?: string
    premium: boolean
  }
  // Adicionado para compatibilidade com o frontend
  user?: {
    name: string
    avatar: string
    verified: boolean
  }
  preview?: string
}

export interface Conversation {
  id: string
  user: {
    id: string
    name: string
    username: string
    image?: string
    premium: boolean
    isOnline: boolean
  }
  lastMessage?: {
    content: string
    timestamp: string
    senderId: string
  }
  unreadCount: number
}

export interface SendMessageData {
  receiverId: string
  content: string
  medias?: string[]
}

export interface MessageNotification {
  id: string
  type: 'message'
  title: string
  message: string
  data: {
    senderId: string
    messageId: string
  }
  read: boolean
  createdAt: string
} 