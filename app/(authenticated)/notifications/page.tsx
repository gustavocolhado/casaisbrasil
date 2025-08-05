'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/lib/socketContext'
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Eye, 
  Star, 
  ArrowLeft, 
  Check, 
  Trash2, 
  CheckCheck,
  UserPlus,
  ThumbsUp,
  MessageSquare
} from 'lucide-react'

interface Notification {
  id: string
  type: 'follow' | 'message' | 'like' | 'comment' | 'comment_like' | 'comment_reply'
  title: string
  message: string
  data?: {
    postId?: string
    commentId?: string
    senderId?: string
    followerId?: string
    messageId?: string
  }
  read: boolean
  createdAt: string
  user?: {
    id: string
    username: string
    image: string | null
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const { data: session } = useSession()
  const { notifications: socketNotifications, addNotification } = useSocket()

  const observer = useRef<IntersectionObserver>()
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, hasMore])

  // Carregar notificações iniciais
  useEffect(() => {
    loadInitialNotifications()
    loadUnreadCount()
  }, [])

  // Escutar notificações em tempo real do socket
  useEffect(() => {
    if (socketNotifications.length > 0) {
      const latestNotification = socketNotifications[0]
      // Verificar se a notificação já não existe na lista
      const exists = notifications.find(n => n.id === latestNotification.id)
      if (!exists) {
        setNotifications(prev => [latestNotification, ...prev])
        setUnreadCount(prev => prev + 1)
      }
    }
  }, [socketNotifications])

  const loadInitialNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=20&offset=0')
      const data = await response.json()
      
      if (response.ok) {
        setNotifications(data.notifications || [])
        setHasMore((data.notifications || []).length === 20)
        setCurrentPage(1)
      } else {
        console.error('Erro ao carregar notificações:', data.error)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    const offset = currentPage * 20
    
    try {
      const response = await fetch(`/api/notifications?limit=20&offset=${offset}`)
      const data = await response.json()
      
      if (response.ok && data.notifications) {
        // Filtrar notificações duplicadas
        const existingIds = new Set(notifications.map(n => n.id))
        const newNotifications = data.notifications.filter((n: Notification) => !existingIds.has(n.id))
        
        if (newNotifications.length > 0) {
          setNotifications(prev => [...prev, ...newNotifications])
          setCurrentPage(prev => prev + 1)
        }
        
        setHasMore(data.notifications.length === 20)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Erro ao carregar mais notificações:', error)
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/count')
      const data = await response.json()
      
      if (response.ok) {
        setUnreadCount(data.count || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar contagem de não lidas:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'markAllAsRead' })
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-5 h-5 text-blue-500" />
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'message':
        return <MessageCircle className="w-5 h-5 text-green-500" />
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-purple-500" />
      case 'comment_like':
        return <ThumbsUp className="w-5 h-5 text-orange-500" />
      case 'comment_reply':
        return <MessageSquare className="w-5 h-5 text-indigo-500" />
      case 'view':
        return <Eye className="w-5 h-5 text-cyan-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida se não estiver lida
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Navegar baseado no tipo da notificação
    if (notification.data?.postId) {
      router.push(`/post/${notification.data.postId}`)
    } else if (notification.data?.senderId) {
      router.push(`/${notification.user?.username}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Notificações</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-400">{unreadCount} não lidas</p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar todas como lidas</span>
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  ref={index === notifications.length - 1 ? lastElementRef : undefined}
                  className={`bg-gray-800 rounded-lg p-4 border-l-4 transition-all cursor-pointer hover:bg-gray-750 ${
                    notification.read ? 'border-gray-600' : 'border-pink-500'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm">{notification.title}</h3>
                      <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                        title="Marcar como lida"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading para carregar mais */}
            {loadingMore && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}

            {notifications.length === 0 && !loading && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhuma notificação</h3>
                <p className="text-gray-400">Você não tem notificações no momento</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 