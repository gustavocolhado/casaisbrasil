'use client'

import { useState } from 'react'
import { Heart, Star, Sun } from 'lucide-react'
import { usePathname } from 'next/navigation'
import LeftSidebar from '@/components/layout/LeftSidebar'
import DesktopMainContent from '@/components/layout/DesktopMainContent'
import RightSidebar from '@/components/layout/RightSidebar'

export default function DesktopLayout() {
  const [activeTab, setActiveTab] = useState('todos')
  const [activeInboxTab, setActiveInboxTab] = useState('inbox')
  const pathname = usePathname()

  // Verificar se está na página de recommendations
  const isRecommendationsPage = pathname === '/recommendations'

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-7xl flex">
        {!isRecommendationsPage && <LeftSidebar />}
        <DesktopMainContent activeTab={activeTab} setActiveTab={setActiveTab} />
        {!isRecommendationsPage && <RightSidebar activeInboxTab={activeInboxTab} setActiveInboxTab={setActiveInboxTab} />}
      </div>
    </div>
  )
} 