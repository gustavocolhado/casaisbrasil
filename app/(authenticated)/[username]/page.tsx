'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  MoreVertical, 
  Share2, 
  Edit, 
  Plus 
} from 'lucide-react'
import ProfileBanner from '@/components/profile/ProfileBanner'
import ProfileInfo from '@/components/profile/ProfileInfo'
import ProfileTabs from '@/components/profile/ProfileTabs'
import PostsFeed from '@/components/posts/PostsFeed'
import ProfileOptionsModal from '@/components/profile/ProfileOptionsModal'
import { Profile } from '@/types/profile'
import { getUserByUsername } from '@/lib/api/users'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [username, setUsername] = useState<string>('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('main')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  // Verificar se o usuário logado está vendo seu próprio perfil
  const isOwnProfile = session?.user?.username === username

  useEffect(() => {
    const getParams = async () => {
      const { username: userParam } = await params
      setUsername(userParam)
    }
    getParams()
  }, [params])

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) return
      
      setLoading(true)
      try {
        const userData = await getUserByUsername(username)
        console.log('Dados do perfil carregados:', userData)
        if (userData) {
          setProfile(userData)
          setIsFollowing(userData.isFollowing || false)
          console.log('Status de follow definido:', userData.isFollowing)
          
          // Registrar view do perfil sempre que visitar
          try {
            await fetch(`/api/users/${username}/view`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            })
          } catch (error) {
            console.error('Erro ao registrar view:', error)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [username, isOwnProfile])

  const handleBack = () => {
    router.back()
  }

  const handleFollow = async () => {
    if (!session?.user?.id || !profile?.id || followLoading) return

    console.log('Iniciando operação de follow:', {
      followerId: session.user.id,
      followingId: profile.id,
      isFollowing
    })

    setFollowLoading(true)
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const response = await fetch('/api/followers', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: session.user.id,
          followingId: profile.id,
        }),
      })

      const data = await response.json()
      console.log('Resposta da API:', { status: response.status, data })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        
        // Atualizar o estado do perfil
        setProfile(prev => {
          if (!prev) return prev
          return {
            ...prev,
            isFollowing: !isFollowing,
            stats: {
              ...prev.stats,
              followers: isFollowing 
                ? Math.max(0, prev.stats.followers - 1)
                : prev.stats.followers + 1
            }
          }
        })

        console.log(isFollowing ? 'Deixou de seguir com sucesso!' : 'Seguindo com sucesso!')
      } else {
        console.error('Erro na operação de follow:', data.error)
        // Se o erro for que já está seguindo, atualizar o estado
        if (data.error === 'Você já está seguindo este usuário.' && !isFollowing) {
          setIsFollowing(true)
          console.log('Corrigindo estado: usuário já estava seguindo')
        }
        // Se o erro for que não está seguindo, atualizar o estado
        if (data.error === 'Você não está seguindo este usuário.' && isFollowing) {
          setIsFollowing(false)
          console.log('Corrigindo estado: usuário não estava seguindo')
        }
      }
    } catch (error) {
      console.error('Erro ao executar operação de follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleMessage = () => {
    // Abrir chat com o usuário
    router.push(`/messages?user=${profile?.username}`)
  }

  const handleOptions = () => {
    setShowOptionsModal(true)
  }

  const handleShare = () => {
    // Compartilhar perfil
    console.log('Compartilhar perfil')
  }

  const handleEdit = () => {
    // Editar perfil
    router.push(`/edit-profile/${username}`)
  }

  const handlePublish = () => {
    // Publicar novo conteúdo
    router.push('/publish')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Usuário não encontrado</h2>
        <p className="text-gray-400">O perfil que você está procurando não existe.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header - Dinâmico baseado em quem está visualizando */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{profile.displayName || profile.username}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOwnProfile ? (
              // Botões para o próprio perfil: Compartilhar, Editar, PUBLICAR
              <>
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  title="Compartilhar"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  title="Editar"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={handlePublish}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  PUBLICAR
                </button>
              </>
            ) : (
              // Botões para perfil de outro usuário: Seguir, Mensagem, Opções
              <>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    followLoading 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : isFollowing 
                        ? 'bg-gray-600 text-white hover:bg-gray-700' 
                        : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  {followLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Heart className={`w-4 h-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
                  )}
                  {followLoading ? 'Carregando...' : (isFollowing ? 'Seguindo' : 'Seguir')}
                </button>
                
                <button
                  onClick={handleMessage}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  title="Mensagem"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={handleOptions}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  title="Opções"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Banner */}
      <ProfileBanner profile={profile} />

      {/* Profile Info */}
      <ProfileInfo profile={profile} />

      {/* Profile Tabs */}
      <ProfileTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        photosCount={0}
      />

      {/* Profile Content */}
      {activeTab === 'main' && (
        <PostsFeed 
          variant="desktop" 
          userId={username}
          showDeleteButton={isOwnProfile}
          onPostDeleted={(postId) => {
            // Atualizar a lista de posts removendo o post deletado
            // Isso será feito automaticamente pelo PostsFeed
          }}
        />
      )}
      
      {activeTab === 'photos' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhuma foto encontrada</p>
          </div>
        </div>
      )}

      {/* Profile Options Modal */}
      <ProfileOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        profileUsername={username}
        profileId={profile?.id || ''}
      />
    </div>
  )
} 