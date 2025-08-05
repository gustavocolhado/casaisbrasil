'use client'

import { usePremium } from '@/lib/hooks/usePremium'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Crown } from 'lucide-react'

interface PremiumGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectToPremium?: boolean
}

export default function PremiumGuard({ 
  children, 
  fallback,
  redirectToPremium = true 
}: PremiumGuardProps) {
  const { isPremium, loading } = usePremium()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isPremium && redirectToPremium) {
      router.push('/premium')
    }
  }, [isPremium, loading, redirectToPremium, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!isPremium) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Recurso Premium</h2>
          <p className="text-gray-400 mb-6">
            Esta funcionalidade está disponível apenas para usuários premium.
          </p>
          <button
            onClick={() => router.push('/premium')}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Tornar-se Premium
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 