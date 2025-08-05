'use client'

import { ArrowLeft, Heart, MessageCircle, MoreVertical } from 'lucide-react'
import { Profile } from '@/types/profile'

interface ProfileHeaderProps {
  profile: Profile
  onBack: () => void
  onFollow: () => void
  onMessage: () => void
  onOptions: () => void
}

export default function ProfileHeader({ 
  profile, 
  onBack, 
  onFollow, 
  onMessage, 
  onOptions 
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-700 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-semibold">{profile.username}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onFollow}
          className={`flex items-center px-4 py-2 rounded-lg font-medium ${
            profile.isFollowing 
              ? 'bg-gray-600 text-white' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          <Heart className="w-4 h-4 mr-2" />
          {profile.isFollowing ? 'Seguindo' : 'Seguir'}
        </button>
        
        <button
          onClick={onMessage}
          className="p-2 hover:bg-gray-700 rounded-full"
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </button>
        
        <button
          onClick={onOptions}
          className="p-2 hover:bg-gray-700 rounded-full"
        >
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  )
} 