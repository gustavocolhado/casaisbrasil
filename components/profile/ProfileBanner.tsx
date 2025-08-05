'use client'

import { Profile } from '@/types/profile'

interface ProfileBannerProps {
  profile: Profile
}

export default function ProfileBanner({ profile }: ProfileBannerProps) {
  // Debug: verificar se os banners estão chegando
  console.log('ProfileBanner - Dados do perfil:', {
    bannerImages: profile.bannerImages,
    avatar: profile.avatar,
    displayName: profile.displayName
  });

  return (
    <div className="relative">
      {/* Banner Images */}
      <div className="flex h-64">
        <div className="flex-1 bg-gray-600 relative overflow-hidden">
          {profile.bannerImages && profile.bannerImages[0] && profile.bannerImages[0].trim() !== '' ? (
            <img 
              src={profile.bannerImages[0]} 
              alt="Banner 1" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-sm">Banner 1</span>
            </div>
          )}
        </div>
        <div className="flex-1 bg-gray-600 relative overflow-hidden">
          {profile.bannerImages && profile.bannerImages[1] && profile.bannerImages[1].trim() !== '' ? (
            <img 
              src={profile.bannerImages[1]} 
              alt="Banner 2" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm">Banner 2</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Picture */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="relative">
          <div className="w-32 h-32 bg-gray-600 rounded-full border-4 border-dark-gray flex items-center justify-center overflow-hidden">
            {profile.avatar && profile.avatar.trim() !== '' ? (
              <img 
                src={profile.avatar} 
                alt={profile.displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm">Foto</span>
            )}
          </div>
          {profile.isOnline && (
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-gray"></div>
          )}
        </div>
      </div>
    </div>
  )
} 