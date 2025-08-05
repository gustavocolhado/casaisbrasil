'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import BottomNavigation from '@/components/layout/BottomNavigation'
import AuthGuard from '@/components/providers/AuthGuard'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [activeInboxTab, setActiveInboxTab] = useState('inbox')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <AuthGuard>
      {/* Layout para desktop com sidebars fixas */}
      {!isMobile ? (
        <div className="min-h-screen bg-dark-gray flex justify-center">
          <div className="w-full max-w-7xl flex relative">
            {/* Left Sidebar - Fixed */}
            <div className="fixed w-64 h-screen z-30" style={{ left: 'calc(50% - 44rem)' }}>
              <LeftSidebar />
            </div>
            
            {/* Main Content - Centered */}
            <div className="flex-1 ml-48 mr-64 min-h-screen">
              <div className="w-full mx-auto">
                {children}
              </div>
            </div>
            
            {/* Right Sidebar - Fixed */}
            <div className="fixed w-80 h-screen z-30" style={{ right: 'calc(50% - 44rem)' }}>
              <RightSidebar activeInboxTab={activeInboxTab} setActiveInboxTab={setActiveInboxTab} />
            </div>
          </div>
        </div>
      ) : (
        /* Layout para mobile */
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
      )}
    </AuthGuard>
  )
} 