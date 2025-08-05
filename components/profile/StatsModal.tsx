'use client'

import { useState, useEffect } from 'react'
import { X, Users, Eye, Heart, Star } from 'lucide-react'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  type: 'views' | 'following' | 'followers' | 'recommendations'
}

interface User {
  id: string
  username: string
  image?: string
}

interface Recommendation {
  id: string
  createdAt: string
  recommender: User
}

export default function StatsModal({ isOpen, onClose, username, type }: StatsModalProps) {
  const [data, setData] = useState<User[] | Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (isOpen && username) {
      fetchData()
    }
  }, [isOpen, username, type])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${username}/${type}`)
      if (response.ok) {
        const result = await response.json()
        setData(result[type] || result.following || result.followers || result.recommendations || [])
        setTotal(result.total || 0)
      }
    } catch (error) {
      console.error(`Erro ao buscar ${type}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'views':
        return 'Visualizações do Perfil'
      case 'following':
        return 'Seguindo'
      case 'followers':
        return 'Seguidores'
      case 'recommendations':
        return 'Recomendações'
      default:
        return 'Estatísticas'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'views':
        return <Eye className="w-5 h-5" />
      case 'following':
        return <Users className="w-5 h-5" />
      case 'followers':
        return <Heart className="w-5 h-5" />
      case 'recommendations':
        return <Star className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <h2 className="text-white font-semibold">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center mb-4">
                <p className="text-gray-400 text-sm">Total: {total}</p>
              </div>
              
              {type === 'views' ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Total de visualizações do perfil</p>
                  <p className="text-white text-2xl font-bold">{total}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Esta funcionalidade mostra o número total de vezes que o perfil foi visualizado
                  </p>
                </div>
              ) : type === 'recommendations' ? (
                <div className="space-y-3">
                  {(data as Recommendation[]).map((rec) => (
                    <div key={rec.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        {rec.recommender.image ? (
                          <img 
                            src={rec.recommender.image} 
                            alt={rec.recommender.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-semibold">
                            {rec.recommender.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{rec.recommender.username}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(rec.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(data as User[]).map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        {user.image ? (
                          <img 
                            src={user.image} 
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{user.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhum item encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 