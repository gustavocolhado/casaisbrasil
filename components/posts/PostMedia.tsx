'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  thumbnail?: string
}

interface PostMediaProps {
  media: MediaItem[]
  onMediaClick?: () => void
  className?: string
}

export default function PostMedia({ media, onMediaClick, className = '' }: PostMediaProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)

  const hasMultipleMedia = media.length > 1
  const currentMedia = media[currentIndex]

  const goToPrevious = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))
    setIsVideoPlaying(false)
  }, [media.length])

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))
    setIsVideoPlaying(false)
  }, [media.length])

  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef) {
      if (isVideoPlaying) {
        videoRef.pause()
        setIsVideoPlaying(false)
      } else {
        videoRef.play()
        setIsVideoPlaying(true)
      }
    }
  }, [videoRef, isVideoPlaying])

  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true)
  }, [])

  const handleVideoPause = useCallback(() => {
    setIsVideoPlaying(false)
  }, [])

  const handleMediaClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMediaClick) {
      onMediaClick()
    }
  }, [onMediaClick])

  if (!media.length) return null

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {/* Container com bordas pretas */}
      <div className="relative aspect-[4/3]">
        {/* Mídia atual com bordas */}
        <div 
          className="w-full h-full cursor-pointer bg-black rounded-lg overflow-hidden"
          onClick={handleMediaClick}
        >
          {currentMedia.type === 'image' ? (
            <div className="relative w-full h-full bg-zinc-800">
              <img
                src={currentMedia.url}
                alt="Post media"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <div className="hidden w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-gray-400">Imagem não disponível</span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full bg-zinc-800">
              <video
                ref={setVideoRef}
                src={currentMedia.url}
                poster={currentMedia.thumbnail}
                className="w-full h-full object-contain"
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onError={(e) => {
                  const target = e.target as HTMLVideoElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <div className="hidden w-full h-full bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400">Vídeo não disponível</span>
              </div>
              
              {/* Overlay de controle de vídeo */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                onClick={handleVideoClick}
              >
                <div className="bg-black bg-opacity-50 rounded-full p-3 pointer-events-auto cursor-pointer">
                  {isVideoPlaying ? (
                    <Pause className="w-8 h-8 text-white fill-current" />
                  ) : (
                    <Play className="w-8 h-8 text-white fill-current" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicadores de navegação */}
      {hasMultipleMedia && (
        <>
          {/* Botão anterior */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Botão próximo */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicadores de página */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                  setIsVideoPlaying(false)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>

          {/* Contador de mídias */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full z-10">
            {currentIndex + 1} / {media.length}
          </div>
        </>
      )}

      {/* Overlay de hover para indicar que é clicável */}
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 pointer-events-none" />
    </div>
  )
} 