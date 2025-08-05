import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { username } = await params;
    const currentUserId = session.user.id;

    // Buscar o usuário pelo username
    const targetUser = await prismaClient.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        premium: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se já existe uma conversa entre os usuários
    const existingMessages = await prismaClient.message.findMany({
      where: {
        OR: [
          {
            AND: [
              { senderId: currentUserId },
              { receiverId: targetUser.id }
            ]
          },
          {
            AND: [
              { senderId: targetUser.id },
              { receiverId: currentUserId }
            ]
          }
        ]
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 1
    });

    // Criar objeto de conversa
    const conversation = {
      id: targetUser.id,
      user: {
        id: targetUser.id,
        name: targetUser.name || targetUser.username,
        username: targetUser.username,
        image: targetUser.image,
        premium: targetUser.premium,
        isOnline: false // Será atualizado pelo socket
      },
      lastMessage: existingMessages.length > 0 ? {
        content: existingMessages[0].content,
        timestamp: existingMessages[0].timestamp.toISOString(),
        senderId: existingMessages[0].senderId
      } : undefined,
      unreadCount: 0
    };

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Erro ao buscar usuário para conversa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 