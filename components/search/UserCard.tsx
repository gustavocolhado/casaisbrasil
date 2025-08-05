'use client'

import { User } from '@prisma/client'
import { Star, MapPin, Heart, Users, Eye } from 'lucide-react'
import Link from 'next/link'

interface UserCardProps {
  user: {
    id: string
    username: string
    name?: string | null
    email?: string | null
    city?: string | null
    state?: string | null
    premium?: boolean
    image?: string | null
    role?: string | null
    interests?: string[]
    fetishes?: string[]
    objectives?: string[]
    age?: number | null
    bio?: string | null
    followersCount?: number
    viewsCount?: number
    recommendationsCount?: number
  }
  viewMode: 'grid' | 'list'
}

export default function UserCard({ user, viewMode }: UserCardProps) {
  const isGrid = viewMode === 'grid'
  
  return (
    <Link href={`/${user.username}`}>
      <div className={`
        bg-light-gray rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer
        ${isGrid ? 'p-4' : 'p-4 flex items-center space-x-4'}
      `}>
        {/* Avatar */}
        <div className={`
          relative flex-shrink-0
          ${isGrid ? 'w-full aspect-square mb-3' : 'w-16 h-16'}
        `}>
          <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center">
            {user.image ? (
              <img
                src={user.image}
                alt={user.username}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div className={`${user.image ? 'hidden' : ''} w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center`}>
              <span className="text-white text-2xl font-bold">
                {(user.name || user.username).charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          {user.premium && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
              <Star className="w-3 h-3 text-white fill-current" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className={isGrid ? 'text-center' : 'flex-1'}>
          <div className="flex items-center justify-center space-x-2 mb-1">
            <h3 className="font-semibold text-white text-sm truncate">
              {user.name || user.username}
            </h3>
            {user.premium && (
              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>
          
          {user.age && (
            <p className="text-gray-400 text-xs mb-1">
              {user.age} anos
            </p>
          )}
          
          {(user.city || user.state) && (
            <div className="flex items-center justify-center text-gray-400 text-xs mb-2">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {[user.city, user.state].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          
          {user.role && (
            <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full mb-2">
              {user.role}
            </span>
          )}

          {/* Stats para modo grid */}
          {isGrid && (
            <div className="flex items-center justify-center space-x-3 text-gray-400 text-xs mt-2">
              {user.followersCount !== undefined && (
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{user.followersCount}</span>
                </div>
              )}
              {user.viewsCount !== undefined && (
                <div className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  <span>{user.viewsCount}</span>
                </div>
              )}
            </div>
          )}

          {/* Bio para modo lista */}
          {!isGrid && user.bio && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>

        {/* Action Button for List View */}
        {!isGrid && (
          <button className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors">
            <Heart className="w-4 h-4" />
          </button>
        )}
      </div>
    </Link>
  )
} 