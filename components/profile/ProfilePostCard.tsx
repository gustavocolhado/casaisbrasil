'use client'

import { Star, MessageCircle, Flame, MoreVertical, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Post } from '@/types/post'
import { toggleLike, checkLike } from '@/lib/api/posts'

interface ProfilePostCardProps {
  post: Post
}

export default function ProfilePostCard({ post }: ProfilePostCardProps) {
  const router = useRouter()
  
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.reactions)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

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

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que o clique propague para o post
    handlePostClick()
  }

  return (
    <div className="bg-light-gray rounded-lg p-4">
      {/* Post Header */}
      <div className="flex items-start mb-3">
        <div 
          className="w-10 h-10 bg-gray-600 rounded-full mr-3 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleUserClick}
        >
          {post.user.avatar ? (
            <img 
              src={post.user.avatar} 
              alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-semibold">
              {post.user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <span 
              className="text-white font-medium mr-2 cursor-pointer hover:underline"
              onClick={handleUserClick}
            >
              {post.user.name}
            </span>
            {post.user.verified && <Star className="w-4 h-4 text-green-500" />}
          </div>
          <div className="text-gray-400 text-sm">{post.user.location}</div>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 text-sm mr-2">{post.timestamp}</span>
          <button className="p-1 hover:bg-gray-600 rounded">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      {post.content && (
        <p 
          className="text-white mb-3 cursor-pointer hover:bg-gray-600 p-2 rounded transition-colors"
          onClick={handlePostClick}
        >
          {post.content}
        </p>
      )}

      {/* Post Media */}
      {post.mediaType === 'image' && post.image && (
        <div className="mb-3">
          <div 
            className="w-full bg-black rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handlePostClick}
          >
            <div className="relative aspect-[4/3] bg-black p-2">
              <div className="w-full h-full bg-gray-700 rounded-lg overflow-hidden">
                <img 
                  src={post.image} 
                  alt="Post image"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">Imagem não disponível</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {post.mediaType === 'video' && post.video && (
        <div className="mb-3">
          <div 
            className="w-full bg-black rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handlePostClick}
          >
            <div className="relative aspect-[4/3] bg-black p-2">
              <div className="w-full h-full bg-gray-700 rounded-lg overflow-hidden relative">
                <video 
                  src={post.video} 
                  controls
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">Vídeo não disponível</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div 
            className="flex items-center text-gray-400 hover:text-white cursor-pointer"
            onClick={handleCommentsClick}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{post.comments}</span>
          </div>
          <div 
            className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-white cursor-pointer ${isLikeLoading ? 'opacity-50' : ''}`}
            onClick={handleLikeClick}
          >
            <Flame className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 