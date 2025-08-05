'use client'

import { Heart, Edit3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TopBar() {
  const router = useRouter()

  const handleNewPost = () => {
    console.log('🔍 TopBar - Redirecionando para novo post')
    router.push('/publish')
  }

  return (
    <div className="bg-darker-gray px-4 py-3 flex items-center justify-between border-b border-gray-700">
      <div className="flex items-center">
        <div className="flex items-center mr-3">
          <Heart className="w-6 h-6 text-red-500 mr-1" />
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
        <span className="text-white font-semibold">Página inicial</span>
      </div>
      <button
        onClick={handleNewPost}
        className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
        style={{ 
          minHeight: '40px',
          minWidth: '40px',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      >
        <Edit3 className="w-5 h-5 text-gray-300 hover:text-white transition-colors duration-200" />
      </button>
    </div>
  )
} 