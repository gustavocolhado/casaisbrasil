'use client'

import { Star } from 'lucide-react'
import MessageList from '@/components/messages/MessageList'

interface RightSidebarProps {
  activeInboxTab: string
  setActiveInboxTab: (tab: string) => void
}

export default function RightSidebar({ activeInboxTab, setActiveInboxTab }: RightSidebarProps) {
  return (
    <div className="w-80 bg-darker-gray border-l border-[#333] flex-shrink-0 sticky top-0 h-screen flex flex-col">
      {/* Inbox Header */}
      <div className="p-4 border-b border-[#333] flex-shrink-0">
        <div className="flex space-x-4">
          {['INBOX', 'ARQUIVADAS'].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeInboxTab === tab.toLowerCase() 
                  ? 'border-white text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
              onClick={() => setActiveInboxTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList />
      </div>
    </div>
  )
} 