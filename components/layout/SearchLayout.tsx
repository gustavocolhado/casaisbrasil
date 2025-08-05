'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Filter, List, Grid3X3, ArrowLeft } from 'lucide-react'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import UserCard from '@/components/search/UserCard'
import SearchFilters from '@/components/search/SearchFilters'

interface User {
  id: string
  username: string
  name?: string | null
  city?: string | null
  state?: string | null
  premium?: boolean
  image?: string | null
  role?: string | null
  interests?: string[]
  age?: number | null
}

interface SearchLayoutProps {
  variant?: 'desktop' | 'mobile'
}

export default function SearchLayout({ variant = 'desktop' }: SearchLayoutProps) {
  const [activeInboxTab, setActiveInboxTab] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<any>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  
  // Ref para o elemento de observação do infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastUserElementRef = useRef<HTMLDivElement | null>(null)

  // Função para carregar todos os usuários (sem filtros)
  const loadAllUsers = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?page=${page}&limit=12`)
      const data = await response.json()
      
      if (page === 1) {
        setUsers(data.users || [])
      } else {
        setUsers(prev => [...prev, ...(data.users || [])])
      }
      
      setHasMore(data.hasMore || false)
      setCurrentPage(page)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  // Busca simples por texto
  const searchUsers = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      // Se não há query, carrega todos os usuários
      loadAllUsers(page)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=12`)
      const data = await response.json()
      
      if (page === 1) {
        setUsers(data.users || [])
      } else {
        setUsers(prev => [...prev, ...(data.users || [])])
      }
      
      setHasMore(data.hasMore || false)
      setCurrentPage(page)
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setLoading(false)
    }
  }

  // Busca com filtros
  const searchWithFilters = async (searchFilters: any, page: number = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?page=${page}&limit=12`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchFilters),
      })
      const data = await response.json()
      
      if (page === 1) {
        setUsers(data.users || [])
      } else {
        setUsers(prev => [...prev, ...(data.users || [])])
      }
      
      setHasMore(data.hasMore || false)
      setCurrentPage(page)
    } catch (error) {
      console.error('Erro na busca com filtros:', error)
    } finally {
      setLoading(false)
    }
  }

  // Callback para o infinite scroll
  const lastUserElementRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        if (filters) {
          searchWithFilters(filters, currentPage + 1)
        } else if (searchQuery) {
          searchUsers(searchQuery, currentPage + 1)
        } else {
          loadAllUsers(currentPage + 1)
        }
      }
    })
    
    if (node) observerRef.current.observe(node)
    lastUserElementRef.current = node
  }, [loading, hasMore, filters, searchQuery, currentPage, searchWithFilters, searchUsers, loadAllUsers])

  // Carregar usuários iniciais ao montar o componente
  useEffect(() => {
    loadAllUsers(1)
    
    // Cleanup do observer quando o componente for desmontado
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Busca por texto com debounce
  useEffect(() => {
    if (!initialLoad) {
      const timeoutId = setTimeout(() => {
        if (searchQuery.trim()) {
          searchUsers(searchQuery, 1)
        } else {
          loadAllUsers(1)
        }
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, initialLoad])

  // Aplicar filtros
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    setShowFilters(false)
    setSearchQuery('') // Limpar busca por texto quando aplicar filtros
    searchWithFilters(newFilters, 1)
  }

  // Limpar filtros
  const clearFilters = () => {
    setFilters(null)
    setSearchQuery('')
    loadAllUsers(1)
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = filters && (
    (filters.userTypes && filters.userTypes.length > 0 && filters.userTypes.length < 5) ||
    (filters.lookingFor && filters.lookingFor !== 'Todos') ||
    (filters.location && filters.location !== 'São Paulo/SP') ||
    (filters.distance && filters.distance !== 'Não importa / Todos') ||
    (filters.ageRange && (filters.ageRange.min !== 18 || filters.ageRange.max !== 80)) ||
    (filters.lastAccess && filters.lastAccess !== '30') ||
    (filters.interests && filters.interests.length > 0) ||
    (filters.fetishes && filters.fetishes.length > 0) ||
    (filters.objectives && filters.objectives.length > 0)
  )

  // Carregar mais resultados (mantido para compatibilidade)
  const loadMore = () => {
    if (loading || !hasMore) return
    
    if (filters) {
      searchWithFilters(filters, currentPage + 1)
    } else if (searchQuery) {
      searchUsers(searchQuery, currentPage + 1)
    } else {
      loadAllUsers(currentPage + 1)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gray flex justify-center">
      {variant === 'desktop' ? (
        <div className="w-full max-w-7xl flex">
          <LeftSidebar />
          
          <div className="flex-1 bg-dark-gray overflow-y-auto">
            {showFilters ? (
              <SearchFilters 
                onFiltersChange={handleFiltersChange}
                onBack={() => setShowFilters(false)}
                activeFilters={filters}
              />
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white">Pesquisar</h1>
                    <div className="flex items-center space-x-2">
                      {/* View Mode Toggle */}
                      <div className="flex bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('list')}
                          className={`
                            p-2 rounded-md transition-colors
                            ${viewMode === 'list' 
                              ? 'bg-gray-600 text-white' 
                              : 'text-gray-400 hover:text-white'
                            }
                          `}
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`
                            p-2 rounded-md transition-colors
                            ${viewMode === 'grid' 
                              ? 'bg-gray-600 text-white' 
                              : 'text-gray-400 hover:text-white'
                            }
                          `}
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Filter Button */}
                      <button
                        onClick={() => setShowFilters(true)}
                        className={`p-2 rounded-lg transition-colors relative ${
                          hasActiveFilters 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Filter className="w-5 h-5" />
                        {hasActiveFilters && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-light-gray text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  {/* Filtros ativos */}
                  {hasActiveFilters && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Filtros ativos:</span>
                        <div className="flex flex-wrap gap-2">
                          {filters.userTypes && filters.userTypes.length > 0 && filters.userTypes.length < 5 && (
                            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                              {filters.userTypes.length} tipo(s)
                            </span>
                          )}
                          {filters.lookingFor && filters.lookingFor !== 'Todos' && (
                            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                              Busca: {filters.lookingFor}
                            </span>
                          )}
                          {filters.location && filters.location !== 'São Paulo/SP' && (
                            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                              {filters.location}
                            </span>
                          )}
                          {filters.distance && filters.distance !== 'Não importa / Todos' && (
                            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                              {filters.distance}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={clearFilters}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Limpar filtros
                      </button>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                <div className="p-6">
                  {initialLoad && loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                      <p className="text-gray-400 mt-4">Carregando usuários...</p>
                    </div>
                  ) : users.length > 0 ? (
                    <>
                      <div className={`
                        ${viewMode === 'grid' 
                          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
                          : 'space-y-3'
                        }
                      `}>
                        {users.map((user, index) => (
                          <div
                            key={user.id}
                            ref={index === users.length - 1 ? lastUserElementRefCallback : null}
                          >
                            <UserCard 
                              user={user} 
                              viewMode={viewMode}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Loading indicator para infinite scroll */}
                      {loading && !initialLoad && (
                        <div className="text-center mt-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                          <p className="text-gray-400 mt-2">Carregando mais usuários...</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">Nenhum usuário encontrado</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <RightSidebar activeInboxTab={activeInboxTab} setActiveInboxTab={setActiveInboxTab} />
        </div>
      ) : (
        // Versão Mobile
        <div className="w-full flex flex-col">
          <div className="flex-1 bg-dark-gray overflow-y-auto">
            {showFilters ? (
              <SearchFilters 
                onFiltersChange={handleFiltersChange}
                onBack={() => setShowFilters(false)}
                activeFilters={filters}
              />
            ) : (
              <>
                {/* Header Mobile */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-white">Pesquisar</h1>
                    <div className="flex items-center space-x-2">
                      {/* View Mode Toggle Mobile */}
                      <div className="flex bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('list')}
                          className={`
                            p-1.5 rounded-md transition-colors
                            ${viewMode === 'list' 
                              ? 'bg-gray-600 text-white' 
                              : 'text-gray-400 hover:text-white'
                            }
                          `}
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`
                            p-1.5 rounded-md transition-colors
                            ${viewMode === 'grid' 
                              ? 'bg-gray-600 text-white' 
                              : 'text-gray-400 hover:text-white'
                            }
                          `}
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Filter Button Mobile */}
                      <button
                        onClick={() => setShowFilters(true)}
                        className={`p-2 rounded-lg transition-colors relative ${
                          hasActiveFilters 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Filter className="w-5 h-5" />
                        {hasActiveFilters && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Search Bar Mobile */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-light-gray text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  {/* Filtros ativos Mobile */}
                  {hasActiveFilters && (
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-xs">Filtros:</span>
                        <div className="flex flex-wrap gap-1">
                          {filters.userTypes && filters.userTypes.length > 0 && filters.userTypes.length < 5 && (
                            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                              {filters.userTypes.length} tipo(s)
                            </span>
                          )}
                          {filters.lookingFor && filters.lookingFor !== 'Todos' && (
                            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                              {filters.lookingFor}
                            </span>
                          )}
                          {filters.location && filters.location !== 'São Paulo/SP' && (
                            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                              {filters.location}
                            </span>
                          )}
                          {filters.distance && filters.distance !== 'Não importa / Todos' && (
                            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                              {filters.distance}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={clearFilters}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                      >
                        Limpar
                      </button>
                    </div>
                  )}
                </div>

                {/* Search Results Mobile */}
                <div className="p-4">
                  {initialLoad && loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                      <p className="text-gray-400 mt-3 text-sm">Carregando usuários...</p>
                    </div>
                  ) : users.length > 0 ? (
                    <>
                      <div className={`
                        ${viewMode === 'grid' 
                          ? 'grid grid-cols-2 gap-3' 
                          : 'space-y-3'
                        }
                      `}>
                        {users.map((user, index) => (
                          <div
                            key={user.id}
                            ref={index === users.length - 1 ? lastUserElementRefCallback : null}
                          >
                            <UserCard 
                              user={user} 
                              viewMode={viewMode}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Loading indicator para infinite scroll mobile */}
                      {loading && !initialLoad && (
                        <div className="text-center mt-6">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                          <p className="text-gray-400 mt-2 text-sm">Carregando mais usuários...</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">Nenhum usuário encontrado</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 