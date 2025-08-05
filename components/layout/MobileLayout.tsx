'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Heart, Edit3 } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import NavigationTabs from '@/components/layout/NavigationTabs'
import PostsFeed from '@/components/posts/PostsFeed'
import BottomNavigation from '@/components/layout/BottomNavigation'
import SearchLayout from '@/components/layout/SearchLayout'
import RecommendationsList from '@/components/recommendations/RecommendationsList'
import SettingsPage from '@/app/(authenticated)/settings/page'
import OnlinePage from '@/app/(authenticated)/online/page'
import NotificationsPage from '@/app/(authenticated)/notifications/page'
import ChatPage from '@/app/(authenticated)/chat/page'

export default function MobileLayout() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('paravoce')
  const [activeNav, setActiveNav] = useState('home')

  // Debug: Log quando activeNav muda
  useEffect(() => {
    console.log('🔍 MobileLayout - activeNav mudou para:', activeNav)
  }, [activeNav])

  const handleSetActiveNav = (nav: string) => {
    console.log('🔍 MobileLayout - setActiveNav chamado com:', nav)
    setActiveNav(nav)
  }

  // Carregar estado inicial do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNav = localStorage.getItem('mobileActiveNav')
      if (savedNav && savedNav !== activeNav) {
        console.log('🔍 MobileLayout - Carregando nav do localStorage:', savedNav)
        setActiveNav(savedNav)
      }
    }
  }, [])

  // Mapear activeTab para feedType
  const getFeedType = () => {
    console.log('🔍 MobileLayout - activeTab:', activeTab)
    
    // Normalizar o activeTab para remover acentos e espaços
    const normalizedTab = activeTab.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '') // Remove espaços
    
    console.log('🔍 MobileLayout - normalizedTab:', normalizedTab)
    
    switch (normalizedTab) {
      case 'seguindo':
        console.log('🔍 MobileLayout - Mapeando para feedType: seguindo')
        return 'seguindo'
      case 'paravoce':
        console.log('🔍 MobileLayout - Mapeando para feedType: paravoce')
        return 'paravoce'
      case 'recomendados':
        console.log('🔍 MobileLayout - Mapeando para feedType: recomendados')
        return 'recomendados'
      case 'todos':
        console.log('🔍 MobileLayout - Mapeando para feedType: todos')
        return 'todos'
      default:
        console.log('🔍 MobileLayout - Mapeando para feedType: todos (default)')
        return 'todos'
    }
  }

  // Renderizar conteúdo baseado no activeNav
  let content
  
  if (activeNav === 'home') {
    content = (
      <div className="flex-1">
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} variant="mobile" />
        <PostsFeed variant="mobile" feedType={getFeedType()} />
      </div>
    )
  } else if (activeNav === 'search') {
    content = (
      <div className="flex-1">
        <SearchLayout variant="mobile" />
      </div>
    )
  } else if (activeNav === 'online') {
    content = (
      <div className="flex-1">
        <OnlinePage />
      </div>
    )
  } else if (activeNav === 'notifications') {
    content = (
      <div className="flex-1">
        <NotificationsPage />
      </div>
    )
  } else if (activeNav === 'recommendations') {
    content = (
      <div className="flex-1 p-4">
        <RecommendationsList variant="mobile" />
      </div>
    )
  } else if (activeNav === 'chat') {
    content = (
      <div className="flex-1">
        <ChatPage />
      </div>
    )
  } else if (activeNav === 'profile') {
    content = (
      <div className="flex-1">
        <SettingsPage />
      </div>
    )
  } else {
    content = (
      <div className="flex-1">
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} variant="mobile" />
        <PostsFeed variant="mobile" feedType={getFeedType()} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      <TopBar />
      {content}
      {!pathname.startsWith('/messages') && !pathname.startsWith('/post') && (
        <BottomNavigation activeNav={activeNav} setActiveNav={handleSetActiveNav} />
      )}
    </div>
  )
} 