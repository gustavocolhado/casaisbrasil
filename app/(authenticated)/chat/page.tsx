'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, Send, User, Clock } from 'lucide-react'
import Link from 'next/link'

interface ChatRoom {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  participants: {
    id: string
    username: string
    image: string | null
  }[]
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/chat/rooms')
        if (response.ok) {
          const data = await response.json()
          setChatRooms(data.rooms || [])
        }
      } catch (error) {
        console.error('Erro ao carregar salas de chat:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchChatRooms()
    }
  }, [session])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Agora'
    } else if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d`
    }
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Faça login para ver suas conversas</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Chat</h1>
          </div>
          <div className="text-gray-400 text-sm">
            {chatRooms.length} conversa{chatRooms.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhuma conversa</h3>
            <p className="text-gray-400 mb-4">
              Você ainda não tem conversas. Comece a conversar com outros usuários!
            </p>
            <Link href="/search">
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors">
                Encontrar pessoas
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {chatRooms.map((room) => (
              <Link key={room.id} href={`/chat/${room.id}`}>
                <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-600 rounded-full overflow-hidden">
                        {room.participants[0]?.image ? (
                          <img
                            src={room.participants[0].image}
                            alt={room.participants[0].username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400 mx-auto mt-3" />
                        )}
                      </div>
                      {room.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {room.unreadCount > 9 ? '9+' : room.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold truncate">
                          {room.name || room.participants[0]?.username || 'Conversa'}
                        </h3>
                        <div className="flex items-center space-x-1 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(room.lastMessageTime)}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        {room.lastMessage || 'Nenhuma mensagem ainda'}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      <Send className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 