import { NextRequest, NextResponse } from 'next/server'
import prismaClient from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/posts/following - Iniciando requisição')
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    console.log('🔍 API /api/posts/following - Parâmetros:', { limit, offset })

    // Obter o usuário logado
    const session = await getServerSession(authOptions)
    console.log('🔍 API /api/posts/following - Session:', session ? 'existe' : 'não existe')
    
    if (!session?.user?.id) {
      console.log('🔍 API /api/posts/following - Usuário não autenticado')
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('🔍 API /api/posts/following - UserId:', userId)

    // Buscar usuários que o usuário logado está seguindo
    const followingUsers = await prismaClient.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    })

    const followingIds = followingUsers.map(f => f.followingId)
    console.log('🔍 API /api/posts/following - Usuários seguidos:', followingIds.length)

    if (followingIds.length === 0) {
      console.log('🔍 API /api/posts/following - Nenhum usuário seguido, retornando array vazio')
      return NextResponse.json([])
    }

    // Buscar posts dos usuários seguidos
    const posts = await prismaClient.post.findMany({
      where: {
        userId: { in: followingIds },
        approved: true,
        failed: false
      },
      take: limit,
      skip: offset,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            premium: true,
            city: true,
            state: true
          }
        },
        photos: {
          select: {
            id: true,
            url: true
          }
        },
        videos: {
          select: {
            id: true,
            url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    console.log('🔍 API /api/posts/following - Posts encontrados:', posts.length)

    // Transformar dados para o formato esperado pelo frontend
    const transformedPosts = posts.map((post: any) => {
      // Determinar se é imagem ou vídeo baseado nas relações
      let mediaType = 'none'
      let mediaUrl = ''
      
      if (post.videos && post.videos.length > 0) {
        mediaType = 'video'
        mediaUrl = post.videos[0].url
      } else if (post.photos && post.photos.length > 0) {
        mediaType = 'image'
        mediaUrl = post.photos[0].url
      } else if (post.mediaUrls && post.mediaUrls.length > 0) {
        // Fallback para mediaUrls se não houver fotos/vídeos específicos
        mediaType = 'image' // Assumindo que mediaUrls são imagens
        mediaUrl = post.mediaUrls[0]
      }

      return {
        id: post.id,
        user: {
          name: post.User?.name || post.User?.username || 'Usuário',
          username: post.User?.username || '',
          avatar: post.User?.image || '',
          verified: post.User?.premium || false,
          location: `${post.User?.city || ''} ${post.User?.state || ''}`.trim() || 'Localização não informada'
        },
        content: post.description || '',
        image: mediaType === 'image' ? mediaUrl : undefined,
        video: mediaType === 'video' ? mediaUrl : undefined,
        mediaType: mediaType,
        timestamp: formatTimestamp(post.created_at),
        comments: post.commentsCount || 0,
        reactions: post.likesCount || 0
      }
    })

    console.log('🔍 API /api/posts/following - Retornando posts transformados:', transformedPosts.length)
    return NextResponse.json(transformedPosts)
  } catch (error) {
    console.error('Erro ao buscar posts de usuários seguidos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'agora'
  if (diffInHours < 24) return `${diffInHours} h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} d`
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit' 
  })
} 