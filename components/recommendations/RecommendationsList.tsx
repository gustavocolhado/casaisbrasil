'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Heart, Star, MapPin, Users, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  username: string
  name?: string | null
  image?: string | null
  age?: number | null
  city?: string | null
  state?: string | null
  role?: string | null
  bio?: string | null
  premium?: boolean
  followersCount: number
  postsCount: number
  recommendedAt: string
}

interface RecommendationsListProps {
  variant?: 'desktop' | 'mobile'
}

export default function RecommendationsList({ variant = 'desktop' }: RecommendationsListProps) {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchUsers = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/recommendations/received?page=${pageNum}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar recomendações')
      }

      const data = await response.json()
      
      if (pageNum === 1) {
        setUsers(data.users)
      } else {
        setUsers(prev => [...prev, ...data.users])
      }
      
      setHasMore(data.page < data.totalPages)
      setPage(data.page)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setError('Erro ao carregar recomendações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchUsers()
    }
  }, [session])

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchUsers(page + 1)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Agora mesmo'
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d atrás`
    }
  }

  const getRoleLabel = (role: string | null) => {
    if (!role) return ''
    
    const roleLabels: { [key: string]: string } = {
      'homem': 'Homem',
      'mulher': 'Mulher',
      'transex': 'Transex',
      'travesti': 'Travesti',
      'casal_homem_mulher': 'Casal (H+M)',
      'casal_homens': 'Casal (H+H)',
      'casal_mulheres': 'Casal (M+M)'
    }
    
    return roleLabels[role] || role
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Faça login para ver suas recomendações</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Usuários que me Recomendaram
        </h1>
        <p className="text-gray-400">
          {users.length} usuário{users.length !== 1 ? 's' : ''} te recomendaram
        </p>
      </div>

      {/* Users List */}
      {users.length === 0 && !loading ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhuma recomendação ainda
          </h3>
          <p className="text-gray-400">
            Quando outros usuários te recomendarem, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <Link href={`/${user.username}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-600 rounded-full overflow-hidden">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`${user.image ? 'hidden' : ''} w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center`}>
                        <span className="text-white text-lg font-bold">
                          {(user.name || user.username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {user.premium && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Link href={`/${user.username}`}>
                      <h3 className="font-semibold text-white hover:text-pink-400 transition-colors truncate">
                        {user.name || user.username}
                      </h3>
                    </Link>
                    {user.premium && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                    )}
                  </div>

                  {/* Location and Age */}
                  <div className="flex items-center space-x-4 text-gray-400 text-sm mb-2">
                    {user.age && (
                      <span>{user.age} anos</span>
                    )}
                    {(user.city || user.state) && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">
                          {[user.city, user.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Role */}
                  {user.role && (
                    <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full mb-2">
                      {getRoleLabel(user.role)}
                    </span>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-gray-400 text-sm mb-2">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{user.followersCount}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      <span>{user.postsCount}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(user.recommendedAt)}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <Link href={`/${user.username}`}>
                    <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Ver Perfil
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? 'Carregando...' : 'Carregar Mais'}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && users.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
} 