'use client'

import { useState, useEffect } from 'react'
import { Message } from '@/types/message'
import { getMessages } from '@/lib/api/messages'
import { useSession } from 'next-auth/react'

export default function MessageList() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true)
      try {
        // Usar o ID do usuário da sessão se disponível, senão usar um ID real do banco
        const userId = session?.user?.id || '68802016555a862871d86117' // ID real do banco
        const data = await getMessages(userId, 10, 0)
        setMessages(data)
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error)
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400">Nenhuma mensagem encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => {
        // Verificar se message.user existe antes de renderizar
        if (!message.user) {
          return null // Não renderizar mensagens sem usuário
        }

        return (
          <div key={message.id} className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                {message.user.avatar ? (
                  <img 
                    src={message.user.avatar} 
                    alt={message.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg font-semibold">
                    {message.user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium truncate">
                  {message.user.name}
                </span>
                {message.user.verified && (
                  <span className="text-blue-400 text-sm">✓</span>
                )}
              </div>
              <p className="text-gray-400 text-sm truncate">
                {message.preview}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <span className="text-gray-500 text-xs">
                {message.timestamp}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
} 