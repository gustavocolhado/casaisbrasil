'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Search, MoreVertical, Send, Image, Smile } from 'lucide-react'
import { Conversation, Message } from '@/types/message'
import { useSocket } from '@/lib/socketContext'
import { usePremium } from '@/lib/hooks/usePremium'
import { useRouter } from 'next/navigation'

// Hook para detectar se é mobile
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [matches, query])

  return matches
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isPremium, loading: premiumLoading } = usePremium()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showConversation, setShowConversation] = useState(false)
  const [userManuallyWentBack, setUserManuallyWentBack] = useState(false)
  
  // Usar o socket global do contexto
  const { socket, onlineUsers: globalOnlineUsers } = useSocket()
  const onlineUsers = globalOnlineUsers.map(user => user.id)

  useEffect(() => {
    fetchConversations()
  }, [])

  // Monitorar mudanças no showConversation
  useEffect(() => {
    console.log('🔍 showConversation mudou para:', showConversation)
  }, [showConversation])

  // Monitorar mudanças no userManuallyWentBack
  useEffect(() => {
    console.log('🔍 userManuallyWentBack mudou para:', userManuallyWentBack)
  }, [userManuallyWentBack])

  useEffect(() => {
    // Verificar se há um usuário específico na URL
    const targetUser = searchParams.get('user')
    if (targetUser && !selectedConversation && !userManuallyWentBack) {
      console.log('🔍 URL tem usuário, mas usuário não voltou manualmente')
      // Primeiro tentar encontrar nas conversas existentes
      const existingConversation = conversations.find(c => c.user.username === targetUser)
      if (existingConversation) {
        handleConversationSelect(existingConversation)
      } else {
        // Se não encontrar, buscar o usuário e criar conversa
        fetchUserConversation(targetUser)
      }
    }
  }, [searchParams, conversations, selectedConversation, userManuallyWentBack])

  const fetchUserConversation = async (username: string) => {
    try {
      const response = await fetch(`/api/messages/user/${username}`)
      if (response.ok) {
        const conversation = await response.json()
        
        // Verificar se pode iniciar conversa (se não é premium)
        // Aguardar o carregamento do status premium antes de verificar
        if (premiumLoading) {
          console.log('Aguardando carregamento do status premium...')
          return
        }
        
        console.log('Status premium verificado:', isPremium)
        if (!isPremium) {
          console.log('Usuário não é premium, verificando se pode iniciar conversa...')
          const canStartResponse = await fetch('/api/messages/can-start-conversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              targetUserId: conversation.user.id,
            }),
          })
          
          if (canStartResponse.ok) {
            const { canStartConversation } = await canStartResponse.json()
            console.log('Pode iniciar conversa:', canStartConversation)
            if (!canStartConversation) {
              // Não pode iniciar conversa, redirecionar para premium
              console.log('Redirecionando para premium - não pode iniciar conversa')
              router.push('/premium')
              return
            }
          } else {
            console.log('Erro ao verificar se pode iniciar conversa:', canStartResponse.status)
          }
        } else {
          console.log('Usuário é premium, pode iniciar conversa livremente')
        }
        
        setSelectedConversation(conversation)
        fetchMessages(conversation.user.id)
        if (isMobile) {
          console.log('🔍 fetchUserConversation: Definindo showConversation como true (mobile)')
          setShowConversation(true)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar conversa do usuário:', error)
    }
  }

  // Configurar listeners do socket para mensagens
  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (message: Message) => {
      // Atualizar mensagens se estiver na conversa correta
      if (selectedConversation && 
          (message.senderId === selectedConversation.user.id || 
           message.receiverId === selectedConversation.user.id)) {
        setMessages(prev => [...prev, message])
      }
      
      // Atualizar conversas
      fetchConversations()
    }

    socket.on('receive_message', handleReceiveMessage)

    return () => {
      socket.off('receive_message', handleReceiveMessage)
    }
  }, [socket, selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/conversation/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    }
  }

  const handleConversationSelect = useCallback((conversation: Conversation) => {
    console.log('🔍 handleConversationSelect chamado para:', conversation.user.name)
    setSelectedConversation(conversation)
    fetchMessages(conversation.user.id)
    setUserManuallyWentBack(false) // Resetar flag quando seleciona nova conversa
    if (isMobile) {
      console.log('🔍 Definindo showConversation como true (mobile)')
      setShowConversation(true)
    }
  }, [isMobile])

  const handleBackToList = useCallback(() => {
    console.log('🔍 handleBackToList chamado')
    console.log('🔍 Estado atual antes: showConversation =', showConversation)
    setShowConversation(false)
    setSelectedConversation(null)
    setMessages([])
    console.log('🔍 Estado atualizado: showConversation = false')
    
    // Forçar re-render
    setTimeout(() => {
      console.log('🔍 Estado após timeout: showConversation =', showConversation)
    }, 100)
  }, [showConversation])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    // Aguardar o carregamento do status premium antes de verificar
    if (premiumLoading) {
      console.log('Aguardando carregamento do status premium para enviar mensagem...')
      return
    }

    console.log('Status premium para enviar mensagem:', isPremium)
    // Verificar se é premium para enviar mensagem
    if (!isPremium) {
      console.log('Usuário não é premium, redirecionando para premium para enviar mensagem')
      router.push('/premium')
      return
    } else {
      console.log('Usuário é premium, pode enviar mensagem')
    }

    setSending(true)
    try {
      const response = await fetch(`/api/messages/conversation/${selectedConversation.user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        setNewMessage('')
        
        // Enviar via socket para atualização em tempo real
        if (socket) {
          socket.emit('send_message', {
            senderId: session?.user?.id,
            receiverId: selectedConversation.user.id,
            content: newMessage,
            timestamp: new Date().toISOString()
          })
        }
        
        // Atualizar conversas
        fetchConversations()
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading || premiumLoading) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // Renderização para mobile
  if (isMobile) {
    console.log('🔍 Renderização mobile - showConversation:', showConversation)
    return (
      <div className="min-h-screen bg-dark-gray">
        {!showConversation ? (
          // Lista de conversas (mobile)
          <div className="flex flex-col h-screen">
                         {/* Header - Fixed */}
             <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-dark-gray">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <button 
                     onClick={() => router.back()}
                     className="p-2 hover:bg-gray-700 rounded-full"
                   >
                     <ArrowLeft className="w-5 h-5 text-white" />
                   </button>
                   <h1 className="text-xl font-bold text-white">Mensagens</h1>
                 </div>
                 <button className="p-2 hover:bg-gray-700 rounded-full">
                   <MoreVertical className="w-5 h-5 text-white" />
                 </button>
               </div>
              
              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            {/* Lista de Conversas - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-dark-gray px-4">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhuma conversa encontrada</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className="py-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                          {conversation.user.image ? (
                            <img 
                              src={conversation.user.image} 
                              alt={conversation.user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-semibold">
                              {conversation.user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Indicador online */}
                        {onlineUsers.includes(conversation.user.id) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-gray"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium truncate">
                            {conversation.user.name}
                          </span>
                          {conversation.lastMessage && (
                            <span className="text-gray-400 text-xs">
                              {formatTimestamp(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        
                        {conversation.lastMessage && (
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-gray-400 text-sm truncate">
                              {conversation.lastMessage.senderId === session?.user?.id ? 'Você: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          // Conversa (mobile)
          <div className="flex flex-col h-screen">
            {/* Chat Header - Fixed */}
            <div className="flex-shrink-0 p-4 border-b border-gray-700 flex items-center justify-between bg-dark-gray">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    console.log('🔍 Botão de voltar clicado!')
                    console.log('🔍 Estado atual: showConversation =', showConversation)
                    setShowConversation(false)
                    setSelectedConversation(null)
                    setMessages([])
                    setUserManuallyWentBack(true)
                    console.log('🔍 Estados atualizados - usuário voltou manualmente')
                  }}
                  className="p-2 hover:bg-gray-700 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    {selectedConversation?.user.image ? (
                      <img 
                        src={selectedConversation.user.image} 
                        alt={selectedConversation.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {selectedConversation?.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {selectedConversation && onlineUsers.includes(selectedConversation.user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-gray"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-white font-medium">{selectedConversation?.user.name}</h2>
                  <p className="text-gray-400 text-sm">
                    {selectedConversation && onlineUsers.includes(selectedConversation.user.id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 bg-dark-gray">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhuma mensagem ainda</p>
                  <p className="text-gray-500 text-sm mt-2">Envie uma mensagem para começar a conversa</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === session?.user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-lg px-4 py-2 ${
                          isOwn 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-700 text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-pink-100' : 'text-gray-400'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Message Input - Fixed */}
            <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-dark-gray">
              {!isPremium && (
                <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 text-sm">⚠️</span>
                    <span className="text-yellow-300 text-sm">
                      Você precisa ser premium para enviar mensagens. 
                      <button 
                        onClick={() => router.push('/premium')}
                        className="text-pink-400 hover:text-pink-300 underline ml-1"
                      >
                        Tornar-se premium
                      </button>
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-700 rounded-full">
                  <Image className="w-5 h-5 text-gray-400" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={!isPremium ? "Mensagem... (Premium necessário)" : "Mensagem..."}
                    className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 pr-12 ${
                      !isPremium ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!isPremium}
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-600 rounded">
                    <Smile className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim() || !isPremium}
                  className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Renderização para desktop (comportamento atual)
  return (
    <div className="min-h-screen bg-dark-gray flex">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-1/3 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Mensagens</h1>
            <button className="p-2 hover:bg-gray-700 rounded-full">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                      {conversation.user.image ? (
                        <img 
                          src={conversation.user.image} 
                          alt={conversation.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-semibold">
                          {conversation.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Indicador online */}
                    {onlineUsers.includes(conversation.user.id) && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-gray"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium truncate">
                        {conversation.user.name}
                      </span>
                      {conversation.lastMessage && (
                        <span className="text-gray-400 text-xs">
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-gray-400 text-sm truncate">
                          {conversation.lastMessage.senderId === session?.user?.id ? 'Você: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    {selectedConversation.user.image ? (
                      <img 
                        src={selectedConversation.user.image} 
                        alt={selectedConversation.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {selectedConversation.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {onlineUsers.includes(selectedConversation.user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-gray"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-white font-medium">{selectedConversation.user.name}</h2>
                  <p className="text-gray-400 text-sm">
                    {onlineUsers.includes(selectedConversation.user.id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhuma mensagem ainda</p>
                  <p className="text-gray-500 text-sm mt-2">Envie uma mensagem para começar a conversa</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === session?.user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-lg px-4 py-2 ${
                          isOwn 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-700 text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-pink-100' : 'text-gray-400'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              {!isPremium && (
                <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 text-sm">⚠️</span>
                    <span className="text-yellow-300 text-sm">
                      Você precisa ser premium para enviar mensagens. 
                      <button 
                        onClick={() => router.push('/premium')}
                        className="text-pink-400 hover:text-pink-300 underline ml-1"
                      >
                        Tornar-se premium
                      </button>
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-700 rounded-full">
                  <Image className="w-5 h-5 text-gray-400" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={!isPremium ? "Mensagem... (Premium necessário)" : "Mensagem..."}
                    className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 pr-12 ${
                      !isPremium ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!isPremium}
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-600 rounded">
                    <Smile className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim() || !isPremium}
                  className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Suas mensagens</h2>
              <p className="text-gray-400">Selecione uma conversa para começar a enviar mensagens</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 