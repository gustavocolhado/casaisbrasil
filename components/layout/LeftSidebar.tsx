'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/lib/socketContext'
import { 
  Home, 
  Search, 
  Bell, 
  Image as ImageIcon, 
  Heart, 
  Star, 
  Eye, 
  User, 
  Settings, 
  Sun,
  Users
} from 'lucide-react'

export default function LeftSidebar() {
  const router = useRouter()
  const { data: session } = useSession()
  const { onlineUsers } = useSocket()

  const formatOnlineCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const navigationItems = [
    { icon: Home, label: 'Página Inicial', path: '/home' },
    { icon: Search, label: 'Pesquisar', path: '/search' },
    { icon: Users, label: 'Online Agora', path: '/online', badge: formatOnlineCount(onlineUsers.length) },
    { icon: Bell, label: 'Notificações', path: '/notifications' },
    { icon: ImageIcon, label: 'Minhas fotos', path: '/my-photos' },
    { icon: Heart, label: 'Amigos e seguidores', path: '/friends' },
    { icon: Star, label: 'Recomendações', path: '/recommendations' },
    { icon: Eye, label: 'Visitas recebidas', path: '/visits', badge: 3 },
    { icon: User, label: 'Meu perfil', path: '/profile' },
    { icon: Settings, label: 'Mais...', path: '/settings' },
  ]

  const handleNavigation = (path: string) => {
    // Se for "Meu perfil", usar o username da sessão
    if (path === '/profile' && session?.user?.username) {
      router.push(`/${session.user.username}`)
    } else {
      router.push(path)
    }
  }

  const handlePublish = () => {
    // Navegar para página de publicação
    router.push('/publish')
  }

  return (
    <div className="w-64 bg-darker-gray p-4 flex flex-col flex-shrink-0 sticky top-0 h-screen border-r border-[#333]">
      {/* Logo */}
      <div 
        className="flex items-center mb-8 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => router.push('/')}
      >
        <Heart className="w-6 h-6 text-red-500 mr-2" />
        <span className="text-white font-bold text-xl">Confissões</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        {navigationItems.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center py-2 px-3 rounded-lg hover:bg-light-gray cursor-pointer mb-1 transition-colors"
            onClick={() => handleNavigation(item.path)}
          >
            <item.icon className="w-5 h-5 text-gray-300 mr-3" />
            <span className="text-gray-300 text-sm">{item.label}</span>
            {item.badge && (
              <div className="ml-auto bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Publish Button */}
      <button 
        className="bg-white text-black font-semibold py-3 px-4 rounded-lg mb-6 hover:bg-gray-200 transition-colors"
        onClick={handlePublish}
      >
        Publicar
      </button>

      {/* Theme Toggle */}
      <div className="flex items-center text-gray-300 text-sm cursor-pointer hover:text-gray-200 transition-colors">
        <span>Tema de cores</span>
        <Sun className="w-4 h-4 ml-2" />
      </div>
    </div>
  )
} 