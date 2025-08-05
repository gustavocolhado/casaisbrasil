import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar todas as mensagens do usuário (enviadas e recebidas)
    const messages = await prismaClient.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
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
    });

    // Agrupar mensagens por conversa
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;

      if (!otherUser) return;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          id: otherUserId,
          user: {
            id: otherUser.id,
            name: otherUser.name || otherUser.username,
            username: otherUser.username,
            image: otherUser.image,
            premium: otherUser.premium,
            isOnline: false // Será atualizado pelo socket
          },
          lastMessage: {
            content: message.content,
            timestamp: message.timestamp.toISOString(),
            senderId: message.senderId
          },
          unreadCount: 0
        });
      } else {
        const conversation = conversationsMap.get(otherUserId);
        
        // Atualizar última mensagem se for mais recente
        if (message.timestamp > new Date(conversation.lastMessage.timestamp)) {
          conversation.lastMessage = {
            content: message.content,
            timestamp: message.timestamp.toISOString(),
            senderId: message.senderId
          };
        }

        // Contar mensagens não lidas
        if (message.receiverId === userId && !message.read) {
          conversation.unreadCount++;
        }
      }
    });

    const conversations = Array.from(conversationsMap.values());

    // Ordenar por última mensagem
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 