'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  User, 
  MapPin, 
  AlertTriangle, 
  Search, 
  Calendar, 
  Wifi,
  Heart,
  Target,
  Star,
  Eye
} from 'lucide-react'
import { Profile } from '@/types/profile'
import StatsModal from './StatsModal'

interface ProfileInfoProps {
  profile: Profile
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'views' | 'following' | 'followers' | 'recommendations'>('views')

  const handleStatClick = (type: 'views' | 'following' | 'followers' | 'recommendations') => {
    setModalType(type)
    setModalOpen(true)
  }

  const infoItems = [
    { icon: User, label: `Gênero: ${profile.info.gender}` },
    { icon: MapPin, label: `Localização: ${profile.info.location}` },
    { icon: Heart, label: `Interesses: ${profile.interests}` },
    { icon: Target, label: `Objetivos: ${profile.objectives}` },
    { icon: Star, label: `Fetiches: ${profile.fetishes}` },
    { icon: Calendar, label: profile.info.memberSince },
    { icon: Wifi, label: profile.info.status }
  ]

  return (
    <div className="px-6 py-8">
      {/* Profile Name */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
        {profile.isVerified && (
          <div className="flex items-center justify-center mt-2">
            <Star className="w-4 h-4 text-blue-400 mr-1" />
            <span className="text-blue-400 text-sm">Verificado</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div 
          className="text-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={() => handleStatClick('views')}
        >
          <div className="text-white font-semibold text-lg">{profile.stats.views}</div>
          <div className="text-gray-400 text-sm">visualizações</div>
        </div>
        <div 
          className="text-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={() => handleStatClick('following')}
        >
          <div className="text-white font-semibold text-lg">{profile.stats.following}</div>
          <div className="text-gray-400 text-sm">seguindo</div>
        </div>
        <div 
          className="text-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={() => handleStatClick('followers')}
        >
          <div className="text-white font-semibold text-lg">{profile.stats.followers}</div>
          <div className="text-gray-400 text-sm">seguidores</div>
        </div>
        <div 
          className="text-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={() => handleStatClick('recommendations')}
        >
          <div className="text-white font-semibold text-lg">{profile.stats.recommendations}</div>
          <div className="text-gray-400 text-sm">recomendações</div>
        </div>
      </div>

      {/* Visits Link - Only show for own profile */}
      {profile.isOwnProfile && (
        <div className="mb-6">
          <Link
            href="/visits"
            className="flex items-center justify-center space-x-2 p-3 bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Ver visitas recebidas</span>
          </Link>
        </div>
      )}

      {/* Profile Information */}
      <div className="space-y-3">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-start text-gray-300">
            <item.icon className="w-5 h-5 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm leading-relaxed">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Additional Info Section */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-white font-semibold mb-3">Informações Detalhadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-2">Localização</h4>
            <p className="text-gray-400 text-sm">
              {profile.city !== 'Não informado' && profile.state !== 'Não informado' 
                ? `${profile.city}, ${profile.state}`
                : 'Localização não informada'
              }
            </p>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-2">Status</h4>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${profile.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className="text-gray-400 text-sm">{profile.info.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      <StatsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        username={profile.username}
        type={modalType}
      />
    </div>
  )
} 