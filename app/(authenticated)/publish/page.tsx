'use client'

import { useState } from 'react'
import { ArrowLeft, Globe, Image as ImageIcon, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function PublishPage() {
  const [description, setDescription] = useState('')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [privacy, setPrivacy] = useState('public')
  const router = useRouter()
  const { data: session } = useSession()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setMediaFiles(prev => [...prev, ...files])
  }

  const handleBack = () => {
    router.back()
  }

  const handlePublish = async () => {
    if (!description.trim() && mediaFiles.length === 0) {
      alert('Adicione uma descrição ou mídia para publicar')
      return
    }

    if (!session?.user?.id) {
      alert('Você precisa estar logado para publicar')
      return
    }

    setIsUploading(true)
    
    try {
      // Criar FormData para enviar texto e arquivos
      const formData = new FormData()
      formData.append('description', description)
      formData.append('userId', session.user.id)
      formData.append('isPrivatePost', privacy === 'private' ? 'true' : 'false')
      
      // Adicionar arquivos de mídia
      mediaFiles.forEach((file) => {
        formData.append('mediaFiles', file)
      })

      // Fazer requisição para a API
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        alert('Publicação realizada com sucesso!')
        setDescription('')
        setMediaFiles([])
        router.push('/home')
      } else {
        alert(`Erro ao publicar: ${data.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao publicar:', error)
      alert('Erro ao publicar. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const togglePrivacy = () => {
    setPrivacy(privacy === 'public' ? 'private' : 'public')
  }

  return (
    <div className="min-h-screen bg-dark-gray">
      {/* Header */}
      <div className="bg-darker-gray px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white font-semibold">Nova publicação</span>
        </div>
        
        <button
          onClick={handlePublish}
          disabled={isUploading || (!description.trim() && mediaFiles.length === 0)}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? 'Publicando...' : 'PUBLICAR'}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Text Area */}
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Compartilhe seus desejos..."
            className="w-full bg-transparent text-white p-4 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500 resize-none min-h-[120px]"
            rows={4}
          />
        </div>

        {/* Privacy and Add Media */}
        <div className="flex items-center justify-between">
          {/* Privacy Setting */}
          <button
            onClick={togglePrivacy}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Globe className="w-5 h-5" />
            <span className="text-sm">
              {privacy === 'public' ? 'Público (todos podem ver)' : 'Privado (apenas seguidores)'}
            </span>
          </button>

          {/* Add Photos/Videos Button */}
          <div>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="media-upload"
            />
            <label 
              htmlFor="media-upload" 
              className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center cursor-pointer"
            >
              <div className="flex items-center mr-2">
                <ImageIcon className="w-4 h-4" />
                <Video className="w-4 h-4 ml-1" />
              </div>
              Adicionar fotos/vídeos
            </label>
          </div>
        </div>

        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-white font-medium mb-3">Mídia selecionada:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Video className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {file.type.startsWith('image/') ? 'IMG' : 'VID'}
                  </div>
                  <button
                    onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 