'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, Heart, Reply, MoreVertical, Flame, Send } from 'lucide-react'
import { Comment } from '@/utils/comment.type'

interface CommentsSectionProps {
  postId: string
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: newComment,
          userId: session?.user?.id,
        }),
      })

      if (response.ok) {
        setNewComment('')
        await fetchComments() // Recarregar comentários
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: replyContent,
          userId: session?.user?.id,
          parentId,
        }),
      })

      if (response.ok) {
        setReplyContent('')
        setReplyingTo(null)
        await fetchComments() // Recarregar comentários
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      })
      if (response.ok) {
        await fetchComments() // Recarregar comentários
      }
    } catch (error) {
      console.error('Erro ao curtir comentário:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes} min`
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-6'}`}>
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
          {comment.user?.image ? (
            <img 
              src={comment.user.image} 
              alt={comment.user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-semibold">
              {(comment.user?.username || comment.username || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold text-base">
                {comment.user?.username || comment.username}
              </span>
                             {comment.user?.premium && (
                 <span className="text-green-500">⭐</span>
               )}
              <span className="text-gray-400 text-sm">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`text-gray-400 hover:text-white ${
                  comment.isLiked ? 'text-red-500' : ''
                }`}
              >
                <Flame className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-white text-base">{comment.content}</p>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="bg-light-gray rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* Comment Input - Fixed on mobile, normal on desktop */}
      {session?.user && (
        <>
          {/* Mobile: Fixed at bottom */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-gray border-t border-gray-700 p-4 z-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || ''}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-semibold">
                    {(session.user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Deixe seu comentário..."
                  className="w-full bg-gray-700 text-white px-4 py-3 pr-12 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                {newComment.trim() && (
                  <button
                    onClick={handleSubmitComment}
                    disabled={submitting}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: Normal flow */}
          <div className="hidden md:block p-6 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || ''}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-semibold">
                    {(session.user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Deixe seu comentário..."
                  className="w-full bg-gray-700 text-white px-4 py-3 pr-12 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                {newComment.trim() && (
                  <button
                    onClick={handleSubmitComment}
                    disabled={submitting}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 