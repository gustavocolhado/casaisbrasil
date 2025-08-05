'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DesktopMainContent from '@/components/layout/DesktopMainContent'
import MobileLayout from '@/components/layout/MobileLayout'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('paravoce')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    console.log('🔍 HomePage - Estado inicial activeTab:', activeTab)
  }, [activeTab])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Renderizar layout baseado no tamanho da tela
  if (isMobile) {
    return <MobileLayout />
  }

  return <DesktopMainContent activeTab={activeTab} setActiveTab={setActiveTab} />
} 