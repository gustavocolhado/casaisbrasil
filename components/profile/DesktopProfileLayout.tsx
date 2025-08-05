'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import ProfileHeader from './ProfileHeader'
import ProfileBanner from './ProfileBanner'
import ProfileInfo from './ProfileInfo'
import ProfileTabs from './ProfileTabs'
import PostsFeed from '@/components/posts/PostsFeed'
import { Profile } from '@/types/profile'
import { getUserByUsername } from '@/lib/api/users'

interface DesktopProfileLayoutProps {
  username?: string
}

export default function DesktopProfileLayout({ username = 'stratmann' }: DesktopProfileLayoutProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('main')
  const [activeInboxTab, setActiveInboxTab] = useState('inbox')
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
      <div className="flex h-screen bg-dark-gray">
        <LeftSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
        <RightSidebar activeInboxTab={activeInboxTab} setActiveInboxTab={setActiveInboxTab} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-screen bg-dark-gray">
        <LeftSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Usuário não encontrado</h2>
            <p className="text-gray-400">O perfil que você está procurando não existe.</p>
          </div>
        </div>
        <RightSidebar activeInboxTab={activeInboxTab} setActiveInboxTab={setActiveInboxTab} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray flex justify-center">
      <div className="w-full max-w-7xl flex">
        <LeftSidebar />
        
        <div className="flex-1 bg-dark-gray overflow-y-auto">
          <ProfileHeader 
            profile={profile}
            onBack={handleBack}
            onFollow={handleFollow}
            onMessage={handleMessage}
            onOptions={handleOptions}
          />
          
          <ProfileBanner profile={profile} />
          
          <ProfileInfo profile={profile} />
          
          <ProfileTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            photosCount={0}
          />
          
          {activeTab === 'main' && (
            <PostsFeed variant="desktop" userId={username} />
          )}
          
          {activeTab === 'photos' && (
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhuma foto encontrada</p>
              </div>
            </div>
          )}
        </div>
        
        <RightSidebar activeInboxTab={activeInboxTab} setActiveInboxTab={setActiveInboxTab} />
      </div>
    </div>
  )
} 