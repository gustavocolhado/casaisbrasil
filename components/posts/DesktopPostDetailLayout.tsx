'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Flame, MoreVertical, Star, Play } from 'lucide-react'
import { Post } from '@/types/post'
import { getPostById, toggleLike, checkLike } from '@/lib/api/posts'
import PostMedia from './PostMedia'
import CommentsSection from '@/components/comments/CommentsSection'

interface DesktopPostDetailLayoutProps {
  postId: string
}

export default function DesktopPostDetailLayout({ postId }: DesktopPostDetailLayoutProps) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true)
      try {
        const postData = await getPostById(postId)
        if (postData) {
          setPost(postData)
          setLikesCount(postData.reactions)
        }
      } catch (error) {
        console.error('Erro ao buscar dados do post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPostData()
  }, [postId])

  useEffect(() => {
    // Verificar se o post já foi curtido pelo usuário
    const checkUserLike = async () => {
      try {
        const liked = await checkLike(postId)
        setIsLiked(liked)
      } catch (error) {
        console.error('Erro ao verificar like:', error)
      }
    }
    
    if (post) {
      checkUserLike()
    }
  }, [postId, post])

  const handleBack = () => {
    router.back()
  }

  const handleUserClick = () => {
    if (post?.user.username) {
      router.push(`/${post.user.username}`)
    }
  }

  const handleLikeClick = async () => {
    if (isLikeLoading) return
    
    setIsLikeLoading(true)
    try {
      const result = await toggleLike(postId)
      if (result) {
        setIsLiked(result.isLiked)
        setLikesCount(result.likesCount)
      }
    } catch (error) {
      console.error('Erro ao gerenciar like:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  // Preparar mídias para o componente PostMedia
  const prepareMedia = () => {
    const media = []
    
    if (post?.mediaType === 'image' && post.image) {
      media.push({
        id: '1',
        url: post.image,
        type: 'image' as const
      })
    }
    
    if (post?.mediaType === 'video' && post.video) {
      media.push({
        id: '1',
        url: post.video,
        type: 'video' as const,
        thumbnail: post.image // Usar imagem como thumbnail se disponível
      })
    }
    
    // Se houver múltiplas imagens
    if (post?.images && Array.isArray(post.images)) {
      post.images.forEach((image: string, index: number) => {
        media.push({
          id: `image-${index}`,
          url: image,
          type: 'image' as const
        })
      })
    }
    
    // Se houver múltiplos vídeos
    if (post?.videos && Array.isArray(post.videos)) {
      post.videos.forEach((video: string, index: number) => {
        media.push({
          id: `video-${index}`,
          url: video,
          type: 'video' as const,
          thumbnail: post.images?.[index] // Usar imagem correspondente como thumbnail
        })
      })
    }
    
    return media
  }

  const media = prepareMedia()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Post não encontrado</h2>
          <p className="text-gray-400">O post que você está procurando não existe.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      {/* Header Fixo */}
      <div className="flex-shrink-0 bg-dark-gray px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <span className="text-white font-semibold text-lg">Publicação de {post.user.username}</span>
        </div>
        <button className="p-2 hover:bg-gray-700 rounded-full">
          <MoreVertical className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Conteúdo Scrollável */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-start">
              <div 
                className="w-14 h-14 bg-gray-600 rounded-full mr-4 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleUserClick}
              >
                {post.user.avatar ? (
                  <img 
                    src={post.user.avatar} 
                    alt={post.user.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg font-semibold">
                    {post.user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span 
                    className="text-white font-medium text-lg mr-3 cursor-pointer hover:underline"
                    onClick={handleUserClick}
                  >
                    {post.user.username}
                  </span>
                  {post.user.verified && <Star className="w-5 h-5 text-green-500" />}
                </div>
                <div className="text-gray-400 text-base">{post.user.location}</div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 text-base mr-3">{post.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          {post.content && (
            <div className="p-6 border-b border-gray-700">
              <p className="text-white text-xl">{post.content}</p>
            </div>
          )}

          {/* Post Media */}
          {media.length > 0 && (
            <div className="border-b border-gray-700">
              <PostMedia 
                media={media}
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center text-gray-400 hover:text-white cursor-pointer">
                  <MessageCircle className="w-6 h-6 mr-3" />
                  <span className="text-base">{post.comments}</span>
                </div>
                <div 
                  className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-white cursor-pointer ${isLikeLoading ? 'opacity-50' : ''}`}
                  onClick={handleLikeClick}
                >
                  <Flame className={`w-6 h-6 mr-3 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-base">{likesCount}</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white text-base">
                ver curtidas
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <CommentsSection postId={postId} />
        </div>
      </div>
    </div>
  )
} 