'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import NavigationTabs from '@/components/layout/NavigationTabs'
import PostsFeed from '@/components/posts/PostsFeed'
import OnlinePage from '@/app/(authenticated)/online/page'
import SearchPage from '@/app/(authenticated)/search/page'
import NotificationsPage from '@/app/(authenticated)/notifications/page'
import RecommendationsList from '@/components/recommendations/RecommendationsList'
import SettingsPage from '@/app/(authenticated)/settings/page'
import ChatPage from '@/app/(authenticated)/chat/page'

interface DesktopMainContentProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function DesktopMainContent({ activeTab, setActiveTab }: DesktopMainContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    // Determinar a página atual baseada no pathname
    if (pathname === '/home' || pathname === '/') {
      setCurrentPage('home')
    } else if (pathname === '/online') {
      setCurrentPage('online')
    } else if (pathname === '/search') {
      setCurrentPage('search')
    } else if (pathname === '/notifications') {
      setCurrentPage('notifications')
    } else if (pathname === '/my-photos') {
      setCurrentPage('my-photos')
    } else if (pathname === '/friends') {
      setCurrentPage('friends')
    } else if (pathname === '/recommendations') {
      setCurrentPage('recommendations')
    } else if (pathname === '/visits') {
      setCurrentPage('visits')
    } else if (pathname === '/settings') {
      setCurrentPage('settings')
    } else if (pathname === '/chat') {
      setCurrentPage('chat')
    }
  }, [pathname])

  // Mapear a aba ativa para o tipo de feed
  const getFeedType = () => {
    console.log('🔍 DesktopMainContent - activeTab original:', activeTab)
    
    // Normalizar o activeTab para remover acentos e espaços
    const normalizedTab = activeTab.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '') // Remove espaços
    
    console.log('🔍 DesktopMainContent - normalizedTab:', normalizedTab)
    
    switch (normalizedTab) {
      case 'seguindo':
        console.log('🔍 Mapeando para feedType: seguindo')
        return 'seguindo'
      case 'paravoce':
        console.log('🔍 Mapeando para feedType: paravoce')
        return 'paravoce'
      case 'recomendados':
        console.log('🔍 Mapeando para feedType: recomendados')
        return 'recomendados'
      case 'todos':
        console.log('🔍 Mapeando para feedType: todos')
        return 'todos'
      default:
        console.log('🔍 Mapeando para feedType: todos (default)')
        return 'todos'
    }
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <div className="p-6 border-b border-[#333]">
              <h1 className="text-2xl font-bold text-white mb-4">Página inicial</h1>
              <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <PostsFeed variant="desktop" feedType={getFeedType()} />
          </>
        )
      case 'online':
        return <OnlinePage />
      case 'search':
        return <SearchPage />
      case 'notifications':
        return <NotificationsPage />
      case 'chat':
        return <ChatPage />
      case 'my-photos':
        return <div className="p-6 text-white">Minhas fotos</div>
      case 'friends':
        return <div className="p-6 text-white">Amigos e seguidores</div>
      case 'recommendations':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <RecommendationsList variant="desktop" />
          </div>
        )
      case 'visits':
        return <div className="p-6 text-white">Visitas recebidas</div>
      case 'settings':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <SettingsPage />
          </div>
        )
      default:
        return (
          <>
            <div className="p-6 border-b border-[#333]">
              <h1 className="text-2xl font-bold text-white mb-4">Página inicial</h1>
              <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <PostsFeed variant="desktop" feedType={getFeedType()} />
          </>
        )
    }
  }

  return (
    <div className="flex-1 bg-dark-gray overflow-y-auto">
      {renderContent()}
    </div>
  )
} 