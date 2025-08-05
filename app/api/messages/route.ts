import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o userId é um ObjectId válido
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('API Messages - userId inválido:', userId);
      return NextResponse.json(
        { error: 'userId inválido' },
        { status: 400 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      take: limit,
      skip: offset,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            premium: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            premium: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Transformar para o formato esperado pelo frontend
    const transformedMessages = messages.map((message: any) => {
      const otherUser = message.senderId === userId ? message.receiver : message.sender
      return {
        id: message.id,
        user: {
          name: otherUser?.name || otherUser?.username || 'Usuário',
          avatar: otherUser?.image || '',
          verified: otherUser?.premium || false
        },
        preview: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        timestamp: formatTimestamp(message.timestamp)
      }
    })

    return NextResponse.json(transformedMessages)
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
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