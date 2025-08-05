'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { X, MessageCircle, Share2, Heart, Shield, Flag } from 'lucide-react'

interface ProfileOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  profileUsername: string
  profileId: string
}

export default function ProfileOptionsModal({ 
  isOpen, 
  onClose, 
  profileUsername, 
  profileId 
}: ProfileOptionsModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const handleRecommend = async () => {
    if (!session?.user?.id) return
    
    setLoading('recommend')
    try {
      const response = await fetch(`/api/users/${profileUsername}/update-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Usuário recomendado com sucesso!')
      } else {
        alert(data.message || 'Erro ao recomendar usuário')
      }
    } catch (error) {
      console.error('Erro ao recomendar usuário:', error)
      alert('Erro ao recomendar usuário')
    } finally {
      setLoading(null)
      onClose()
    }
  }

  const handleReport = async () => {
    if (!session?.user?.id) return
    
    setLoading('report')
    try {
      const response = await fetch('/api/report-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reporterId: session.user.id,
          reportedId: profileId,
          reason: 'Conteúdo inadequado'
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Usuário denunciado com sucesso!')
      } else {
        alert(data.error || 'Erro ao denunciar usuário')
      }
    } catch (error) {
      console.error('Erro ao denunciar usuário:', error)
      alert('Erro ao denunciar usuário')
    } finally {
      setLoading(null)
      onClose()
    }
  }

  const handleMessage = () => {
    router.push(`/messages?user=${profileUsername}`)
    onClose()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${profileUsername}`,
        url: `${window.location.origin}/${profileUsername}`,
      })
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(`${window.location.origin}/${profileUsername}`)
      alert('Link do perfil copiado para a área de transferência!')
    }
    onClose()
  }

  const handleBlock = () => {
    // Implementar bloqueio de usuário
    alert('Funcionalidade de bloqueio em desenvolvimento')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-medium">Opções do perfil</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-2">
          <button
            onClick={handleMessage}
            className="w-full flex items-center space-x-3 p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Enviar mensagem privada</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center space-x-3 p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Compartilhar por...</span>
          </button>

          <button
            onClick={handleRecommend}
            disabled={loading === 'recommend'}
            className="w-full flex items-center space-x-3 p-3 text-left text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Heart className="w-5 h-5" />
            <span>
              {loading === 'recommend' ? 'Recomendando...' : `Recomendar @${profileUsername}`}
            </span>
          </button>

          <button
            onClick={handleBlock}
            className="w-full flex items-center space-x-3 p-3 text-left text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Shield className="w-5 h-5" />
            <span>Bloquear @{profileUsername}</span>
          </button>

          <button
            onClick={handleReport}
            disabled={loading === 'report'}
            className="w-full flex items-center space-x-3 p-3 text-left text-red-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Flag className="w-5 h-5" />
            <span>
              {loading === 'report' ? 'Denunciando...' : 'Denunciar conteúdo ilegal'}
            </span>
          </button>
        </div>

        {/* Cancel Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  )
} 