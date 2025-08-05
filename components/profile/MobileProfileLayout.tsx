'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Heart, MessageCircle, MoreVertical } from 'lucide-react'
import ProfileBanner from './ProfileBanner'
import ProfileInfo from './ProfileInfo'
import ProfileTabs from './ProfileTabs'
import PostsFeed from '@/components/posts/PostsFeed'
import BottomNavigation from '@/components/layout/BottomNavigation'
import { Profile } from '@/types/profile'
import { getUserByUsername } from '@/lib/api/users'

interface MobileProfileLayoutProps {
  username?: string
}

export default function MobileProfileLayout({ username = 'stratmann' }: MobileProfileLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('main')
  const [activeNav, setActiveNav] = useState('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)
      try {
        const userData = await getUserByUsername(username)
        if (userData) {
          setProfile(userData)
          
          // Registrar view do perfil
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
  }, [username])

  const handleBack = () => {
    router.back()
  }

  const handleFollow = () => {
    // Lógica para seguir/deixar de seguir
    console.log('Seguir/Deixar de seguir')
  }

  const handleMessage = () => {
    // Abrir chat
    console.log('Abrir chat')
  }

  const handleOptions = () => {
    // Abrir menu de opções
    console.log('Menu de opções')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gray flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
        {!pathname.startsWith('/messages') && !pathname.startsWith('/post') && (
          <BottomNavigation activeNav={activeNav} setActiveNav={setActiveNav} />
        )}
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-gray flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Perfil não encontrado</p>
        </div>
        {!pathname.startsWith('/messages') && !pathname.startsWith('/post') && (
          <BottomNavigation activeNav={activeNav} setActiveNav={setActiveNav} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      {/* Top Bar */}
      <div className="bg-darker-gray px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-3 p-2 hover:bg-gray-700 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white font-semibold">{profile.username}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFollow}
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium text-sm ${
              profile.isFollowing 
                ? 'bg-gray-600 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            <Heart className="w-4 h-4 mr-1" />
            {profile.isFollowing ? 'Seguindo' : 'Seguir'}
          </button>
          
          <button
            onClick={handleMessage}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={handleOptions}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
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
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'main' && (
          <PostsFeed variant="mobile" userId={username} />
        )}
        
        {activeTab === 'photos' && (
          <div className="p-4">
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhuma foto encontrada</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      {!pathname.startsWith('/messages') && !pathname.startsWith('/post') && (
        <BottomNavigation activeNav={activeNav} setActiveNav={setActiveNav} />
      )}
    </div>
  )
} 