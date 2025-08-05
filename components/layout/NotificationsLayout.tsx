'use client'

import { useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

export default function NotificationsLayout() {
  const [activeInboxTab, setActiveInboxTab] = useState('inbox')

  const notifications = [
    {
      id: 1,
      type: 'like',
      message: 'Maria curtiu sua publicação',
      time: '2 min atrás',
      read: false
    },
    {
      id: 2,
      type: 'follow',
      message: 'João começou a seguir você',
      time: '1 hora atrás',
      read: false
    },
    {
      id: 3,
      type: 'comment',
      message: 'Ana comentou em sua foto',
      time: '3 horas atrás',
      read: true
    }
  ]

  return (
    <div className="min-h-screen bg-dark-gray flex justify-center">
      <div className="w-full max-w-7xl flex">
        <LeftSidebar />
        
        <div className="flex-1 bg-dark-gray overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white mb-4">Notificações</h1>
          </div>

          {/* Notifications List */}
          <div className="p-6">
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`bg-light-gray rounded-lg p-4 flex items-center justify-between ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex items-center">
                      <Bell className={`w-5 h-5 mr-3 ${notification.read ? 'text-gray-500' : 'text-blue-500'}`} />
                      <div>
                        <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                          {notification.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-600 rounded">
                        <Check className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-600 rounded">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Nenhuma notificação</h2>
                <p className="text-gray-400">Você está em dia com suas notificações</p>
              </div>
            )}
          </div>
        </div>
        
        <RightSidebar activeInboxTab={activeInboxTab} setActiveInboxTab={setActiveInboxTab} />
      </div>
    </div>
  )
} 