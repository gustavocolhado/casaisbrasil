import { Profile } from '@/types/profile'
import prisma from '@/lib/prisma'

export async function getUserByUsername(username: string): Promise<Profile | null> {
  try {
    console.log('getUserByUsername - Buscando usuário:', username);
    
    const response = await fetch(`/api/users/${username}`)
    
    console.log('getUserByUsername - Status da resposta:', response.status);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('getUserByUsername - Usuário não encontrado (404)');
        return null
      }
      console.log('getUserByUsername - Erro HTTP:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('getUserByUsername - Dados recebidos:', data);
    
    // Os dados já vêm formatados do backend
    return data
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    // Retornar dados mock em caso de erro
    return null
  }
}

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const response = await fetch('/api/auth/session')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const session = await response.json()
    
    if (!session?.user?.username) {
      return null
    }
    
    return getUserByUsername(session.user.username)
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error)
    return null
  }
}

export async function searchUsers(filters: any, page: number = 1, limit: number = 12) {
  try {
    console.log('searchUsers - Iniciando busca com filtros:', filters);
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    const response = await fetch(`/api/search?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    })
    
    if (!response.ok) {
      console.error('searchUsers - Erro HTTP:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('searchUsers - Resultados recebidos:', data);
    
    return {
      users: data.users || [],
      hasMore: data.hasMore || false,
      totalCount: data.totalCount || 0
    }
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return {
      users: [],
      hasMore: false,
      totalCount: 0
    }
  }
}

export async function searchUsersByQuery(query: string, page: number = 1, limit: number = 12) {
  try {
    console.log('searchUsersByQuery - Buscando por query:', query);
    
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    })
    
    const response = await fetch(`/api/search?${params}`)
    
    if (!response.ok) {
      console.error('searchUsersByQuery - Erro HTTP:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('searchUsersByQuery - Resultados recebidos:', data);
    
    return {
      users: data.users || [],
      hasMore: data.hasMore || false,
      totalCount: data.totalCount || 0
    }
  } catch (error) {
    console.error('Erro ao buscar usuários por query:', error)
    return {
      users: [],
      hasMore: false,
      totalCount: 0
    }
  }
}

// Função auxiliar para formatar números
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
} 