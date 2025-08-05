'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DesktopPostDetailLayout from '@/components/posts/DesktopPostDetailLayout'
import MobilePostDetailLayout from '@/components/posts/MobilePostDetailLayout'

interface PostDetailPageProps {
  params: Promise<{ postId: string }>
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter()
  const [postId, setPostId] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const getParams = async () => {
      const { postId: id } = await params
      setPostId(id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  if (!postId) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return isMobile ? (
    <MobilePostDetailLayout postId={postId} />
  ) : (
    <DesktopPostDetailLayout postId={postId} />
  )
} 