import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismaClient from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const loggedInUserId = session.user.id;

    const messages = await prismaClient.message.findMany({
      where: {
        OR: [
          { senderId: loggedInUserId },
          { receiverId: loggedInUserId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    const conversations = messages.reduce(
      (
        acc: { [key: string]: { user: { id: string; username: string; image: string | null }; lastMessage: any } },
        message
      ) => {
        const otherUser = message.senderId === loggedInUserId ? message.receiver : message.sender;
        const conversationId = otherUser.id;

        if (!acc[conversationId]) {
          acc[conversationId] = {
            user: {
              id: otherUser.id,
              username: otherUser.username,
              image: otherUser.image,
            },
            lastMessage: {
              id: message.id,
              content: message.content,
              medias: message.medias || [],
              timestamp: message.timestamp.toISOString(),
            },
          };
        }

        return acc;
      },
      {}
    );

    const conversationList = Object.values(conversations).slice(0, 5);

    return NextResponse.json(conversationList);
  } catch (error) {
    console.error('Erro ao buscar mensagens recentes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}