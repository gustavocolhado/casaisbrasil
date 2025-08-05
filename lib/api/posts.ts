import { Post, Comment } from '@/types/post'

export async function getPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
  try {
    console.log('🔍 getPosts - Chamando API:', `/api/posts?limit=${limit}&offset=${offset}`)
    const response = await fetch(`/api/posts?limit=${limit}&offset=${offset}`)
    
    if (!response.ok) {
      console.error('🔍 getPosts - Erro na resposta:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔍 getPosts - Dados recebidos:', data.length, 'posts')
    
    // Os dados já vêm formatados do backend
    return data
  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    // Retornar dados mock em caso de erro
    return []
  }
}

export async function getFollowingPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
  try {
    console.log('🔍 getFollowingPosts - Chamando API:', `/api/posts/following?limit=${limit}&offset=${offset}`)
    const response = await fetch(`/api/posts/following?limit=${limit}&offset=${offset}`)
    
    if (!response.ok) {
      console.error('🔍 getFollowingPosts - Erro na resposta:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔍 getFollowingPosts - Dados recebidos:', data.length, 'posts')
    return data
  } catch (error) {
    console.error('Erro ao buscar posts de usuários seguidos:', error)
    return []
  }
}

export async function getForYouPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
  try {
    console.log('🔍 getForYouPosts - Chamando API:', `/api/posts/for-you?limit=${limit}&offset=${offset}`)
    const response = await fetch(`/api/posts/for-you?limit=${limit}&offset=${offset}`)
    
    if (!response.ok) {
      console.error('🔍 getForYouPosts - Erro na resposta:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔍 getForYouPosts - Dados recebidos:', data.length, 'posts')
    return data
  } catch (error) {
    console.error('Erro ao buscar posts para você:', error)
    return []
  }
}

export async function getRecommendedPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
  try {
    console.log('🔍 getRecommendedPosts - Chamando API:', `/api/posts/recommended?limit=${limit}&offset=${offset}`)
    const response = await fetch(`/api/posts/recommended?limit=${limit}&offset=${offset}`)
    
    if (!response.ok) {
      console.error('🔍 getRecommendedPosts - Erro na resposta:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔍 getRecommendedPosts - Dados recebidos:', data.length, 'posts')
    return data
  } catch (error) {
    console.error('Erro ao buscar posts recomendados:', error)
    return []
  }
}

export async function getProfilePosts(username: string, limit: number = 10, offset: number = 0): Promise<Post[]> {
  try {
    const response = await fetch(`/api/posts/profile/${username}?limit=${limit}&offset=${offset}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Os dados já vêm formatados do backend
    return data
  } catch (error) {
    console.error('Erro ao buscar posts do perfil:', error)
    // Retornar dados mock em caso de erro
    return []
  }
}

export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const response = await fetch(`/api/posts/${postId}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transformar os dados da API existente para o formato esperado pelo frontend
    const transformedPost: Post = {
      id: data.id,
      user: {
        name: data.User?.name || data.User?.username || 'Usuário',
        username: data.User?.username || '',
        avatar: data.User?.image || '',
        verified: data.User?.premium || false,
        location: `${data.User?.city || ''} ${data.User?.state || ''}`.trim() || 'Localização não informada'
      },
      content: data.description || '',
      image: data.mediaUrls && data.mediaUrls.length > 0 ? data.mediaUrls[0] : undefined,
      video: undefined, // A API existente não tem vídeos separados
      mediaType: data.mediaUrls && data.mediaUrls.length > 0 ? 'image' : 'none',
      timestamp: formatTimestamp(new Date(data.created_at)),
      comments: data.commentsCount || 0,
      reactions: data.likesCount || 0
    }
    
    return transformedPost
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    return null
  }
}

export async function toggleLike(postId: string): Promise<{ likesCount: number; isLiked: boolean } | null> {
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao gerenciar like:', error)
    return null
  }
}

export async function checkLike(postId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/posts/${postId}/check-like`)
    
    if (!response.ok) {
      return false
    }
    
    const data = await response.json()
    return data.isLiked || false
  } catch (error) {
    console.error('Erro ao verificar like:', error)
    return false
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const response = await fetch(`/api/comments?postId=${postId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.comments || []
  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
    return []
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