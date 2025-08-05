'use client'

import NavigationTabs from './NavigationTabs'
import PostsFeed from '@/components/posts/PostsFeed'

interface MainContentProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function MainContent({ activeTab, setActiveTab }: MainContentProps) {
  return (
    <div className="flex-1 bg-dark-gray overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-[#333]">
        <h1 className="text-2xl font-bold text-white mb-4">Página inicial</h1>
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Posts Feed */}
      <PostsFeed variant="desktop" />
    </div>
  )
} 