import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { userId: otherUserId } = await params;
    const currentUserId = session.user.id;

    // Verificar se o userId é um username (não tem formato de ObjectId)
    let targetUserId = otherUserId;
    if (!otherUserId.match(/^[0-9a-fA-F]{24}$/)) {
      // É um username, buscar o usuário
      const user = await prismaClient.user.findUnique({
        where: { username: otherUserId },
        select: { id: true }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
      
      targetUserId = user.id;
    }

    // Buscar mensagens entre os dois usuários
    const messages = await prismaClient.message.findMany({
      where: {
        OR: [
          {
            AND: [
              { senderId: currentUserId },
              { receiverId: targetUserId }
            ]
          },
          {
            AND: [
              { senderId: targetUserId },
              { receiverId: currentUserId }
            ]
          }
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
        timestamp: 'asc'
      }
    });

    // Marcar mensagens como lidas
    await prismaClient.message.updateMany({
      where: {
        senderId: targetUserId,
        receiverId: currentUserId,
        read: false
      },
      data: {
        read: true
      }
    });

    // Transformar mensagens para o formato esperado
    const transformedMessages = messages.map((message) => ({
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      medias: message.medias || [],
      timestamp: message.timestamp.toISOString(),
      read: message.read,
      sender: message.sender,
      receiver: message.receiver
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error('Erro ao buscar mensagens da conversa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { userId: receiverId } = await params;
    const senderId = session.user.id;
    const { content, medias } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Conteúdo da mensagem é obrigatório' }, { status: 400 });
    }

    // Verificar se o receiverId é um username
    let targetReceiverId = receiverId;
    if (!receiverId.match(/^[0-9a-fA-F]{24}$/)) {
      // É um username, buscar o usuário
      const user = await prismaClient.user.findUnique({
        where: { username: receiverId },
        select: { id: true, premium: true }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'Usuário destinatário não encontrado' }, { status: 404 });
      }
      
      targetReceiverId = user.id;
    }

    // Verificar se o remetente existe e se é premium
    const sender = await prismaClient.user.findUnique({
      where: { id: senderId },
      select: { premium: true },
    });

    if (!sender) {
      return NextResponse.json({ error: 'Usuário remetente não encontrado' }, { status: 404 });
    }

    // Se o remetente não é premium, verificar se o destinatário é premium
    // e se ele já enviou uma mensagem para o remetente
    if (!sender.premium) {
      const receiver = await prismaClient.user.findUnique({
        where: { id: targetReceiverId },
        select: { premium: true },
      });

      if (!receiver) {
        return NextResponse.json({ error: 'Usuário destinatário não encontrado' }, { status: 404 });
      }

      if (!receiver.premium) {
        return NextResponse.json({
          error: 'Apenas usuários premium podem iniciar mensagens diretas'
        }, { status: 403 });
      }

      // Verificar se o destinatário (premium) já enviou uma mensagem para o remetente
      const existingMessage = await prismaClient.message.findFirst({
        where: {
          senderId: targetReceiverId,
          receiverId: senderId,
        },
      });

      if (!existingMessage) {
        return NextResponse.json({
          error: 'Apenas usuários premium podem iniciar mensagens diretas'
        }, { status: 403 });
      }
    }

    // Criar a mensagem
    const message = await prismaClient.message.create({
      data: {
        senderId,
        receiverId: targetReceiverId,
        content: content.trim(),
        medias: medias || [],
        timestamp: new Date(),
        read: false,
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
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 