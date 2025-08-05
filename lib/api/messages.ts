import { Message } from '@/types/message'

export async function getMessages(userId: string, limit: number = 10, offset: number = 0): Promise<Message[]> {
  try {
    const response = await fetch(`/api/messages?userId=${userId}&limit=${limit}&offset=${offset}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Os dados já vêm formatados do backend
    return data
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    // Retornar dados mock em caso de erro
    return []
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message | null> {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderId,
        receiverId,
        content
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      id: data.id,
      user: {
        name: data.user.name,
        avatar: data.user.avatar,
        verified: data.user.verified
      },
      preview: data.preview,
      timestamp: data.timestamp
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return null
  }
} 