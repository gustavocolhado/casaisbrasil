'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronRight, 
  User, 
  Star, 
  Image, 
  Users, 
  CheckCircle, 
  Eye, 
  Settings, 
  Edit3, 
  Lock, 
  UserX, 
  Key, 
  Mail, 
  Phone, 
  Sun, 
  Moon,
  Heart,
  MessageCircle,
  FileText,
  LogOut,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = async () => {
    // Confirmação antes de fazer logout
    const confirmed = window.confirm('Tem certeza que deseja sair da sua conta?')
    
    if (!confirmed) {
      return
    }
    
    try {
      setIsLoggingOut(true)
      
      // Limpar dados locais
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Fazer logout usando NextAuth
      await signOut({ 
        callbackUrl: '/',
        redirect: false 
      })
      
      // Forçar redirecionamento e refresh
      window.location.href = '/'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Fallback: limpar dados e redirecionar manualmente
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/'
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleDeleteAccount = () => {
    // Implementar exclusão de conta com confirmação
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão removidos permanentemente.'
    )
    
    if (confirmed) {
      // TODO: Implementar API para exclusão de conta
      console.log('Delete account confirmed')
      alert('Funcionalidade de exclusão de conta será implementada em breve.')
    }
  }

  const handlePremiumClick = () => {
    router.push('/premium')
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Faça login para ver as configurações</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Configurações</h1>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'Profile'} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{session.user.name || session.user.username}</p>
          </div>
          <Link href={`/${session.user.username}`}>
            <button className="flex items-center space-x-1 text-pink-400">
              <span>Ver meu perfil</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Premium Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="bg-blue-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-white fill-current" />
              <div>
                <h3 className="font-semibold">Confissões Premium</h3>
                <p className="text-sm text-blue-100">Veja as vantagens para assinantes!</p>
              </div>
            </div>
            <button 
              onClick={handlePremiumClick}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Assinar Premium
            </button>
          </div>
        </div>
      </div>

      {/* Account Activity Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="space-y-3">
          <Link href="/my-photos" className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Image className="w-5 h-5 text-gray-400" />
              <span>Minhas fotos</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">0</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>

          <Link href="/friends" className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-400" />
              <span>Amigos e seguidores</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">0</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>

          <Link href="/recommendations" className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-400" />
              <span>Recomendações pendentes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">0</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>

          <Link href="/visits" className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-gray-400" />
              <span>Visitas recebidas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">12</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        </div>
      </div>

      {/* Settings Section */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Configurações</h2>
        <div className="space-y-3">
          <Link href={`/edit-profile/${session.user.username}`} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Edit3 className="w-5 h-5 text-gray-400" />
              <span>Editar perfil</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <button className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <span>Permissões e privacidade</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <UserX className="w-5 h-5 text-gray-400" />
              <span>Perfis bloqueados</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-gray-400" />
              <span>Minha assinatura</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-gray-400" />
              <span>Alterar senha</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>Alterar email</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>Alterar telefone</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Color Mode Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Sun className="w-5 h-5 text-gray-400" />
              <Moon className="w-5 h-5 text-gray-400 absolute inset-0" />
            </div>
            <span>Modo de cores</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-700 rounded-full p-1">
            <button
              onClick={toggleColorMode}
              className={`p-1 rounded-full ${!isDarkMode ? 'bg-white text-gray-800' : 'text-gray-400'}`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={toggleColorMode}
              className={`p-1 rounded-full ${isDarkMode ? 'bg-white text-gray-800' : 'text-gray-400'}`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Others Section */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Outros</h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <span>Contato com o suporte</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <span>Termos de serviço</span>
            </div>
          </button>

          <button className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <span>Blog</span>
            </div>
          </button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full py-2 flex items-center justify-center space-x-2 transition-colors ${
            isLoggingOut 
              ? 'text-gray-500 cursor-not-allowed' 
              : 'text-red-400 hover:text-red-300'
          }`}
        >
          {isLoggingOut ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
              <span>Saindo...</span>
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </>
          )}
        </button>
      </div>

      {/* Decorative Heart */}
      <div className="p-4 flex justify-center">
        <div className="text-pink-500 text-4xl">
          <Heart className="w-12 h-12" />
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={handleDeleteAccount}
          className="w-full flex items-center justify-between py-2"
        >
          <div className="flex items-center space-x-3">
            <Trash2 className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <span className="text-red-400">Excluir conta</span>
              <p className="text-xs text-gray-400 mt-1">
                Ao excluir sua conta, todos seus dados serão removidos e isso não poderá ser desfeito.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Version Info */}
      <div className="p-4 text-center text-gray-400 text-sm">
        <p>Você está usando a versão 20250726-095054</p>
        <p className="mt-1">Feito com ❤️ desde 2011</p>
      </div>
    </div>
  )
} 