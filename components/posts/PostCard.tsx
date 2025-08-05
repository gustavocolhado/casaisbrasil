'use client'

import { Star, MessageCircle, Flame, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Post, Comment } from '@/types/post'
import { toggleLike, checkLike, getComments } from '@/lib/api/posts'
import PostMedia from './PostMedia'

interface PostCardProps {
  post: Post
  variant: 'desktop' | 'mobile'
  showDeleteButton?: boolean
  onPostDeleted?: (postId: string) => void
}

export default function PostCard({ post, variant, showDeleteButton = false, onPostDeleted }: PostCardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isMobile = variant === 'mobile'
  const avatarSize = isMobile ? 'w-12 h-12' : 'w-10 h-10'
  const starSize = isMobile ? 'w-4 h-4' : 'w-4 h-4'
  
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.reactions)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Verificar se o post já foi curtido pelo usuário
    const checkUserLike = async () => {
      try {
        const liked = await checkLike(post.id)
        setIsLiked(liked)
      } catch (error) {
        console.error('Erro ao verificar like:', error)
      }
    }
    
    checkUserLike()
  }, [post.id])

  const handleUserClick = () => {
    if (post.user.username) {
      router.push(`/${post.user.username}`)
    }
  }

  const handlePostClick = () => {
    router.push(`/post/${post.id}`)
  }

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que o clique propague para o post
    
    if (isLikeLoading) return
    
    setIsLikeLoading(true)
    try {
      const result = await toggleLike(post.id)
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

  const handleCommentsClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que o clique propague para o post
    
    if (!showComments && comments.length === 0) {
      // Carregar comentários se ainda não foram carregados
      setLoadingComments(true)
      try {
        const fetchedComments = await getComments(post.id)
        setComments(fetchedComments)
      } catch (error) {
        console.error('Erro ao carregar comentários:', error)
      } finally {
        setLoadingComments(false)
      }
    }
    
    setShowComments(!showComments)
  }

  const handleDeletePost = async (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que o clique propague para o post
    
    if (!session?.user?.id || isDeleting) return
    
    const confirmed = window.confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')
    if (!confirmed) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Chamar callback para atualizar a lista de posts
        if (onPostDeleted) {
          onPostDeleted(post.id)
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao excluir post')
      }
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      alert('Erro ao excluir post')
    } finally {
      setIsDeleting(false)
    }
  }

  // Preparar mídias para o componente PostMedia
  const prepareMedia = () => {
    const media = []
    
    if (post.mediaType === 'image' && post.image) {
      media.push({
        id: '1',
        url: post.image,
        type: 'image' as const
      })
    }
    
    if (post.mediaType === 'video' && post.video) {
      media.push({
        id: '1',
        url: post.video,
        type: 'video' as const,
        thumbnail: post.image // Usar imagem como thumbnail se disponível
      })
    }
    
    // Se houver múltiplas imagens
    if (post.images && Array.isArray(post.images)) {
      post.images.forEach((image: string, index: number) => {
        media.push({
          id: `image-${index}`,
          url: image,
          type: 'image' as const
        })
      })
    }
    
    // Se houver múltiplos vídeos
    if (post.videos && Array.isArray(post.videos)) {
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

  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'agora'
    if (diffInHours < 24) return `${diffInHours} h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} d`
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  return (
    <div className="pb-8 border-b border-gray-700 px-4 pt-4">
      {/* Post Header */}
      <div className="flex items-start mb-3">
        <div 
          className={`${avatarSize} bg-gray-600 rounded-full mr-3 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={handleUserClick}
        >
          {post.user.avatar ? (
            <img 
              src={post.user.avatar} 
              alt={post.user.name}
              className={`${avatarSize} rounded-full object-cover`}
            />
          ) : (
            <span className="text-white text-sm font-semibold">
              {post.user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className={`flex-1 ${isMobile ? 'min-w-0' : ''}`}>
          <div className="flex items-center">
            <span 
              className={`text-white font-medium mr-2 ${isMobile ? 'truncate' : ''} cursor-pointer hover:underline`}
              onClick={handleUserClick}
            >
              {post.user.name}
            </span>
            {post.user.verified && (
              <Star className={`${starSize} text-green-500 ${isMobile ? 'flex-shrink-0' : ''}`} />
            )}
          </div>
          <div className="text-gray-400 text-sm">{post.user.location}</div>
        </div>
        
        <div className="flex items-center space-x-2">
          {showDeleteButton && (
            <button
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
              title="Excluir post"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
          {isMobile ? (
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-2">{post.timestamp}</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full mx-1"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">{post.timestamp}</span>
          )}
        </div>
      </div>

      {/* Post Content */}
      {post.content && (
        <p 
          className={`text-white mb-3 ${isMobile ? 'leading-relaxed' : ''} cursor-pointer hover:bg-gray-600 p-2 rounded transition-colors`}
          onClick={handlePostClick}
        >
          {post.content}
        </p>
      )}

      {/* Post Media */}
      {media.length > 0 && (
        <div className="mb-3">
          <PostMedia 
            media={media}
            onMediaClick={handlePostClick}
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center space-x-6">
        <div 
          className={`flex items-center text-gray-400 ${!isMobile ? 'hover:text-white cursor-pointer' : 'cursor-pointer'}`}
          onClick={handleCommentsClick}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{post.comments}</span>
          {post.comments > 0 && (
            <div className="ml-2">
              {showComments ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
        <div 
          className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-400'} ${!isMobile ? 'hover:text-white cursor-pointer' : 'cursor-pointer'} ${isLikeLoading ? 'opacity-50' : ''}`}
          onClick={handleLikeClick}
        >
          <Flame className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likesCount}</span>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          {loadingComments ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-gray-400 ml-2 text-sm">Carregando comentários...</span>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    {comment.user?.image ? (
                      <img 
                        src={comment.user.image} 
                        alt={comment.user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-semibold">
                        {(comment.user?.username || comment.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">
                        {comment.user?.username || comment.username || 'Usuário'}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatCommentTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-2">
                            <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                              {reply.user?.image ? (
                                <img 
                                  src={reply.user.image} 
                                  alt={reply.user.username}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white text-xs font-semibold">
                                  {reply.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-white text-xs font-medium">
                                  {reply.user?.username || 'Usuário'}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  {formatCommentTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-300 text-xs mt-1">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">Nenhum comentário ainda</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 