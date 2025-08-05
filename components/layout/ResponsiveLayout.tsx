'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import BottomNavigation from '@/components/layout/BottomNavigation'

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [activeInboxTab, setActiveInboxTab] = useState('inbox')

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Layout para desktop com sidebars fixas
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-dark-gray flex">
        {/* Left Sidebar - Fixed */}
        <div className="fixed left-0 top-0 h-screen z-30">
          <LeftSidebar />
        </div>
        
        {/* Main Content - Centered with margins for sidebars */}
        <div className="flex-1 ml-64 mr-80 min-h-screen">
          <div className="max-w-4xl mx-auto py-6 px-4">
            {children}
          </div>
        </div>
        
        {/* Right Sidebar - Fixed */}
        <div className="fixed right-0 top-0 h-screen z-30">
          <RightSidebar activeInboxTab={activeInboxTab} setActiveInboxTab={setActiveInboxTab} />
        </div>
      </div>
    )
  }

  // Layout para mobile
  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      {/* Main Content */}
      <div className="flex-1 pb-16">
        {children}
      </div>
      
      {/* Bottom Navigation - Fixed */}
      {!pathname.startsWith('/messages') && !pathname.startsWith('/post') && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <BottomNavigation activeNav="home" setActiveNav={() => {}} />
        </div>
      )}
    </div>
  )
} 