'use client'

import { useState, useEffect } from 'react'
import { Heart, Users, UserPlus, UserCheck } from 'lucide-react'

interface Friend {
  id: string
  username: string
  name: string
  image?: string
  isOnline: boolean
  mutualFriends: number
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'friends' | 'followers' | 'following'>('friends')

  useEffect(() => {
    // Simular carregamento de amigos
    setTimeout(() => {
      setFriends([
        {
          id: '1',
          username: 'joao123',
          name: 'João Silva',
          isOnline: true,
          mutualFriends: 5
        },
        {
          id: '2',
          username: 'maria456',
          name: 'Maria Santos',
          isOnline: false,
          mutualFriends: 3
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Amigos e Seguidores</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('friends')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'friends' 
                ? 'border-pink-500 text-pink-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Amigos
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'followers' 
                ? 'border-pink-500 text-pink-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Seguidores
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'following' 
                ? 'border-pink-500 text-pink-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <UserCheck className="w-4 h-4 inline mr-2" />
            Seguindo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div key={friend.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  {friend.image ? (
                    <img
                      src={friend.image}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{friend.name}</h3>
                  <p className="text-gray-400 text-sm">@{friend.username}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-gray-400 text-xs">
                      {friend.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {friends.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum amigo encontrado</p>
        </div>
      )}
    </div>
  )
} 