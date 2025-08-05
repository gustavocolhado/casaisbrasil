'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Eye, Clock, MapPin, User, Heart, MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PremiumGuard from '@/components/premium/PremiumGuard'

interface Visitor {
  id: string
  name: string | null
  username: string
  image: string | null
  age: number | null
  city: string | null
  state: string | null
  lastSeen: string | null
  bio: string | null
  email: string | null
}

interface Visit {
  id: string
  visitorId: string
  visitedId: string
  visitedAt: string
  visitor: Visitor
}

interface VisitsResponse {
  visits: Visit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function VisitsPage() {
  const { data: session } = useSession()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchVisits()
  }, [])

  const fetchVisits = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/visits?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar visitas')
      }

      const data: VisitsResponse = await response.json()
      setVisits(data.visits)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Erro ao buscar visitas:', error)
      setError('Erro ao carregar visitas')
    } finally {
      setLoading(false)
    }
  }

  const enrichVisitorData = async (visitorId: string) => {
    try {
      const response = await fetch('/api/visits/update-visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitorId }),
      })
      const data = await response.json()
      if (data.success) {
        // Recarregar as visitas para mostrar os dados atualizados
        fetchVisits()
      }
      return data.visitor
    } catch (error) {
      console.error('Erro ao enriquecer dados do visitante:', error)
      return null
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
    return diffInMinutes < 5 // Considera online se esteve ativo nos últimos 5 minutos
  }

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchVisits(pagination.page + 1)
    }
  }

  if (loading && visits.length === 0) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <PremiumGuard>
      <div className="min-h-screen bg-dark-gray">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/home"
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Visitas Recebidas</h1>
                <p className="text-gray-400">
                  {pagination.total} {pagination.total === 1 ? 'pessoa visitou' : 'pessoas visitaram'} seu perfil
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => fetchVisits()}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Nenhuma visita ainda</h2>
            <p className="text-gray-400 mb-6">
              Quando alguém visitar seu perfil, aparecerá aqui
            </p>
            <Link 
              href="/home"
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors inline-flex items-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Ver outros perfis</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div 
                key={visit.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                      {visit.visitor?.image ? (
                        <img 
                          src={visit.visitor.image} 
                          alt={visit.visitor.name || 'Visitante'}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    {/* Indicador online */}
                    {visit.visitor?.lastSeen && isOnline(visit.visitor.lastSeen) && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>

                  {/* Informações do visitante */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <Link 
                        href={`/${visit.visitor?.username || '#'}`}
                        className="text-white font-semibold hover:text-pink-400 transition-colors truncate"
                      >
                        {visit.visitor?.name || visit.visitor?.username || 'Visitante desconhecido'}
                      </Link>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(visit.visitedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      {visit.visitor?.age && (
                        <span>{visit.visitor.age} anos</span>
                      )}
                      {(visit.visitor?.city || visit.visitor?.state) && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {visit.visitor.city}
                            {visit.visitor.city && visit.visitor.state && ', '}
                            {visit.visitor.state}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/${visit.visitor?.username || '#'}`}
                      className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                      title="Ver perfil"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                    </Link>
                    <Link
                      href={`/messages?user=${visit.visitor?.username || ''}`}
                      className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                      title="Enviar mensagem"
                    >
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                    </Link>
                    <button
                      className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                      title="Curtir perfil"
                    >
                      <Heart className="w-5 h-5 text-gray-400" />
                    </button>
                    {!visit.visitor?.name && (
                      <button
                        onClick={async () => {
                          const enrichedData = await enrichVisitorData(visit.visitorId)
                          if (enrichedData) {
                            alert('Dados do visitante atualizados! A página será recarregada.')
                          }
                        }}
                        className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                        title="Atualizar dados do visitante"
                      >
                        <Eye className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {pagination.page < pagination.totalPages && (
              <div className="text-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Carregando...' : 'Carregar mais'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </PremiumGuard>
  )
} 