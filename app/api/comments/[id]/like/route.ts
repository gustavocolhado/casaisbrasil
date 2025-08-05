import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationService } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Verificar se o comentário existe
    const comment = await prismaClient.comment.findUnique({
      where: { id: commentId },
      include: { likes: true }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário já curtiu o comentário
    const existingLike = await prismaClient.commentLike.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    if (existingLike) {
      // Remover like
      await prismaClient.commentLike.delete({
        where: { id: existingLike.id },
      });

      // Decrementar contador
      await prismaClient.comment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ 
        isLiked: false, 
        likesCount: comment.likesCount - 1 
      });
    } else {
      // Adicionar like
      await prismaClient.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });

      // Incrementar contador
      await prismaClient.comment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });

      // Criar notificação para o autor do comentário
      try {
        await NotificationService.createCommentLikeNotification(userId, commentId);
      } catch (notificationError) {
        console.error('Erro ao criar notificação de curtida em comentário:', notificationError);
        // Não falhar a operação se a notificação falhar
      }

      return NextResponse.json({ 
        isLiked: true, 
        likesCount: comment.likesCount + 1 
      });
    }
  } catch (error) {
    console.error('Erro ao gerenciar like do comentário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 