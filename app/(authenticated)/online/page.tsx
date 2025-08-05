'use client'

import { useState, useEffect } from 'react'
import { useSocket } from '@/lib/socketContext'
import { useSession } from 'next-auth/react'
import { Heart, Users, Eye, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'

interface OnlineUser {
  id: string
  username: string
  image: string | null
  city: string | null
  socketId?: string
  followersCount: number
  connectedAt?: string
  lastSeen?: string
  postsCount?: number
}

export default function OnlinePage() {
  const { onlineUsers: socketUsers } = useSocket()
  const { data: session } = useSession()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<OnlineUser[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'followers' | 'name'>('recent')
  const [loading, setLoading] = useState(true)

  // Buscar usuários online da API
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users/online')
        if (response.ok) {
          const data = await response.json()
          setOnlineUsers(data.users)
        }
      } catch (error) {
        console.error('Erro ao buscar usuários online:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOnlineUsers()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchOnlineUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = [...onlineUsers]

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.city && user.city.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Ordenar
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => {
          const dateA = a.lastSeen ? new Date(a.lastSeen).getTime() : 0
          const dateB = b.lastSeen ? new Date(b.lastSeen).getTime() : 0
          return dateB - dateA
        })
        break
      case 'followers':
        filtered.sort((a, b) => b.followersCount - a.followersCount)
        break
      case 'name':
        filtered.sort((a, b) => a.username.localeCompare(b.username))
        break
    }

    setFilteredUsers(filtered)
  }, [onlineUsers, searchTerm, sortBy])

  const formatOnlineCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div className="min-h-screen bg-dark-gray">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h1 className="text-xl font-semibold text-white">
                  Online Agora
                </h1>
              </div>
              <div className="text-gray-400">
                {formatOnlineCount(onlineUsers.length)} usuários
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por username ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
              >
                <option value="recent">Mais recentes</option>
                <option value="followers">Mais seguidores</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando usuários online...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário online'}
            </h3>
            <p className="text-gray-400">
              {searchTerm 
                ? 'Tente ajustar sua busca' 
                : 'Seja o primeiro a aparecer online!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {/* User Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <img
                      src={user.image || '/default-avatar.png'}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${user.username}`}
                      className="text-white font-medium hover:text-pink-400 transition-colors truncate block"
                    >
                      {user.username}
                    </Link>
                    {user.city && (
                      <p className="text-gray-400 text-sm truncate">
                        📍 {user.city}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{user.followersCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>Online</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    href={`/${user.username}`}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-center py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    Ver perfil
                  </Link>
                  <button className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 