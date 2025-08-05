'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Grid3X3, List, Filter, Star, MapPin, Users } from 'lucide-react'

interface User {
  id: string
  name: string | null
  username: string
  email: string | null
  city: string | null
  state: string | null
  premium: boolean
  image: string | null
  role: string | null
  interests: string[]
  fetishes: string[]
  objectives: string[]
  age: number | null
  bio: string | null
  followersCount: number
  viewsCount: number
  recommendationsCount: number
}

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

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

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    setCurrentPage(1)
    setHasMore(true)
    
    try {
      const response = await fetch(`/api/search?page=1&limit=12`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResults(data.users || [])
        setHasMore(data.hasMore || false)
      } else {
        console.error('Erro ao carregar dados:', data.message || data.error)
        setSearchResults([])
        setHasMore(false)
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
      setSearchResults([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    const nextPage = currentPage + 1
    
    try {
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: '12'
      })
      
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim())
      }
      
      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      
      if (response.ok && data.users) {
        // Filtrar usuários duplicados
        const existingIds = new Set(searchResults.map(user => user.id))
        const newUsers = data.users.filter((user: User) => !existingIds.has(user.id))
        
        if (newUsers.length > 0) {
          setSearchResults(prev => [...prev, ...newUsers])
          setCurrentPage(nextPage)
        }
        
        setHasMore(data.hasMore && data.users.length > 0)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Erro ao carregar mais dados:', error)
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    setCurrentPage(1)
    setHasMore(true)
    
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '12'
      })
      
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim())
      }
      
      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResults(data.users || [])
        setHasMore(data.hasMore || false)
      } else {
        console.error('Erro na busca:', data.message || data.error)
        setSearchResults([])
        setHasMore(false)
      }
    } catch (error) {
      console.error('Erro na busca:', error)
      setSearchResults([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  // Calcular distância simulada baseada na atividade
  const getDistance = (user: User) => {
    if (user.recommendationsCount > 20) return 'A menos de 2 km'
    if (user.recommendationsCount > 10) return '9 km'
    if (user.followersCount > 50) return '13 km'
    if (user.viewsCount > 100) return '18 km'
    return '25 km'
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header com barra de pesquisa */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Barra de pesquisa */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Pesquisar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-gray-700 text-white px-4 py-2 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Botões de visualização e filtros */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-gray-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-gray-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Grid de usuários */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {searchResults.map((user, index) => (
                  <div 
                    key={user.id} 
                    ref={index === searchResults.length - 1 ? lastElementRef : undefined}
                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors"
                    onClick={() => router.push(`/${user.username}`)}
                  >
                    {/* Imagem do usuário */}
                    <div className="relative aspect-[3/4] bg-gray-700">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || user.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`${user.image ? 'hidden' : ''} w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center`}>
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                      {user.premium && (
                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    
                    {/* Informações do usuário */}
                    <div className="p-3">
                      <h3 className="font-semibold text-white text-sm mb-1 truncate">
                        {user.name || user.username}
                      </h3>
                      <p className="text-gray-400 text-xs mb-1">
                        @{user.username}
                      </p>
                      {user.role && (
                        <p className="text-gray-300 text-xs mb-1">
                          {user.role}
                        </p>
                      )}
                      {(user.city || user.state) && (
                        <div className="flex items-center text-gray-400 text-xs mb-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{[user.city, user.state].filter(Boolean).join('/')}</span>
                        </div>
                      )}
                      {user.age && (
                        <p className="text-gray-300 text-xs mb-1">
                          {user.age} anos
                        </p>
                      )}
                      <p className="text-green-400 text-xs font-medium">
                        {getDistance(user)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Lista de usuários */
              <div className="space-y-3">
                {searchResults.map((user, index) => (
                  <div 
                    key={user.id} 
                    ref={index === searchResults.length - 1 ? lastElementRef : undefined}
                    className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-750 transition-colors"
                    onClick={() => router.push(`/${user.username}`)}
                  >
                    {/* Avatar */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || user.username}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`${user.image ? 'hidden' : ''} w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center`}>
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                      {user.premium && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    
                    {/* Informações */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm mb-1">
                        {user.name || user.username}
                      </h3>
                      <p className="text-gray-400 text-xs mb-1">
                        @{user.username}
                      </p>
                      <p className="text-gray-300 text-xs mb-1">
                        {user.role && `${user.role} • `}
                        {[user.city, user.state].filter(Boolean).join('/')}
                        {user.age && ` • ${user.age} anos`}
                      </p>
                      <p className="text-green-400 text-xs font-medium">
                        {getDistance(user)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading para carregar mais */}
            {loadingMore && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}

            {searchResults.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-400">Nenhum usuário encontrado</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 