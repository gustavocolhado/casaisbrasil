'use client'

import { Home, Search, Bell, MessageCircle, User, Users, Heart } from 'lucide-react'
import { useSocket } from '@/lib/socketContext'
import { useRouter } from 'next/navigation'

interface BottomNavigationProps {
  activeNav: string
  setActiveNav: (nav: string) => void
}

export default function BottomNavigation({ activeNav, setActiveNav }: BottomNavigationProps) {
  const { onlineUsers } = useSocket()
  const router = useRouter()

  const formatOnlineCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const handleNavClick = (navId: string) => {
    console.log('🔍 BottomNavigation - Clique detectado:', navId)
    console.log('🔍 BottomNavigation - activeNav atual:', activeNav)
    console.log('🔍 BottomNavigation - setActiveNav é uma função?', typeof setActiveNav)
    
    // Mapear navId para rotas
    const routeMap: { [key: string]: string } = {
      'home': '/home',
      'search': '/search',
      'online': '/online',
      'notifications': '/notifications',
      'recommendations': '/recommendations',
      'chat': '/messages',
      'profile': '/settings'
    }
    
    const route = routeMap[navId]
    
    if (route) {
      console.log('🔍 BottomNavigation - Redirecionando para:', route)
      router.push(route)
    } else {
      console.log('🔍 BottomNavigation - Rota não encontrada para:', navId)
    }
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mobileActiveNav', navId)
    }
    
    // Forçar a atualização do estado
    setActiveNav(navId)
    
    console.log('🔍 BottomNavigation - activeNav após setActiveNav:', navId)
  }

  const navigationItems = [
    { id: 'home', icon: Home, label: 'INÍCIO' },
    { id: 'search', icon: Search, label: 'BUSCAR' },
    { id: 'notifications', icon: Bell, label: 'NOTIFICAÇÕES' },
    { id: 'chat', icon: MessageCircle, label: 'CHAT' },
    { id: 'profile', icon: User, label: 'VOCÊ' },
  ]

  console.log('🔍 BottomNavigation - Renderizando com activeNav:', activeNav)

  return (
    <div className="bg-darker-gray border-t border-gray-700 relative z-50">
      <div className="flex justify-around py-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 cursor-pointer select-none ${
              activeNav === item.id 
                ? 'text-white bg-gray-700 shadow-lg' 
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
            }`}
            onClick={() => handleNavClick(item.id)}
            onTouchStart={() => handleNavClick(item.id)}
            style={{ 
              minHeight: '50px',
              minWidth: '50px',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
          >
            <item.icon className={`w-5 h-5 mb-1 ${
              activeNav === item.id ? 'text-white' : 'text-gray-400'
            }`} />
            <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
} 