'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import PostCard from '@/components/posts/PostCard'
import { Post } from '@/types/post'
import { getPosts, getProfilePosts, getFollowingPosts, getForYouPosts, getRecommendedPosts } from '@/lib/api/posts'

interface PostsFeedProps {
  variant: 'desktop' | 'mobile'
  userId?: string // Para posts de perfil específico
  feedType?: 'seguindo' | 'paravoce' | 'todos' | 'recomendados' // Novo parâmetro
  showDeleteButton?: boolean // Para mostrar botão de excluir no próprio perfil
  onPostDeleted?: (postId: string) => void // Callback quando post for deletado
}

export default function PostsFeed({ variant, userId, feedType = 'todos', showDeleteButton = false, onPostDeleted }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 10

  // Função para remover post da lista quando deletado
  const handlePostDeleted = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
    // Chamar callback externo se fornecido
    if (onPostDeleted) {
      onPostDeleted(postId)
    }
  }

  // Intersection Observer para detectar quando chegar ao final
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  })

  const fetchPosts = useCallback(async (isInitial = false) => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      let fetchedPosts: Post[]
      const currentOffset = isInitial ? 0 : offset
      
      console.log('🔍 PostsFeed - feedType:', feedType, 'isInitial:', isInitial, 'offset:', currentOffset)
      
      if (userId) {
        // Buscar posts de um usuário específico
        fetchedPosts = await getProfilePosts(userId, limit, currentOffset)
      } else {
        // Buscar posts baseado no tipo de feed
        switch (feedType) {
          case 'seguindo':
            console.log('🔍 Buscando posts seguindo...')
            fetchedPosts = await getFollowingPosts(limit, currentOffset)
            break
          case 'paravoce':
            console.log('🔍 Buscando posts para você...')
            fetchedPosts = await getForYouPosts(limit, currentOffset)
            break
          case 'recomendados':
            console.log('🔍 Buscando posts recomendados...')
            fetchedPosts = await getRecommendedPosts(limit, currentOffset)
            break
          case 'todos':
            console.log('🔍 Buscando TODOS os posts...')
            console.log('🔍 Chamando getPosts com limit:', limit, 'offset:', currentOffset)
            fetchedPosts = await getPosts(limit, currentOffset)
            console.log('🔍 getPosts retornou:', fetchedPosts.length, 'posts')
            break
          default:
            console.log('🔍 Buscando posts padrão (todos)...')
            fetchedPosts = await getPosts(limit, currentOffset)
            break
        }
      }
      
      console.log('🔍 Posts encontrados:', fetchedPosts.length)
      
      if (isInitial) {
        setPosts(fetchedPosts)
        setOffset(limit)
      } else {
        setPosts(prev => [...prev, ...fetchedPosts])
        setOffset(prev => prev + limit)
      }

      // Verificar se há mais posts para carregar
      if (fetchedPosts.length < limit) {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      if (isInitial) {
        setPosts([])
      }
    } finally {
      setLoadingMore(false)
      if (isInitial) {
        setLoading(false)
      }
    }
  }, [userId, feedType, offset, limit, loadingMore, hasMore])

  // Carregar posts iniciais
  useEffect(() => {
    console.log('🔍 PostsFeed - useEffect disparado - feedType:', feedType, 'userId:', userId)
    setLoading(true)
    setOffset(0)
    setHasMore(true)
    setPosts([])
    fetchPosts(true)
  }, [userId, feedType])

  // Carregar mais posts quando chegar ao final
  useEffect(() => {
    if (inView && !loading && !loadingMore && hasMore) {
      fetchPosts(false)
    }
  }, [inView, loading, loadingMore, hasMore, fetchPosts])


  if (loading) {
    return (
      <div className="">
        <div className="">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-gray-400 ml-2">Carregando posts...</span>
          </div>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="">
        <div className="">
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhum post encontrado</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            variant={variant}
            showDeleteButton={showDeleteButton}
            onPostDeleted={handlePostDeleted}
          />
        ))}
        
        {/* Elemento de observação para infinite scroll */}
        <div ref={ref} className="py-4">
          {loadingMore && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="text-gray-400 ml-2">Carregando mais posts...</span>
            </div>
          )}
          
          {!hasMore && posts.length > 0 && (
            <div className="text-center">
              <p className="text-gray-400 text-sm">Não há mais posts para carregar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 