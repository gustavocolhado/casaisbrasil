// api/comments/route.ts
import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { Comment, VisitorComment } from '@/utils/comment.type';
import { NotificationService } from '@/lib/notifications';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('Iniciando a busca pelos comentários...');
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    // Obter o usuário logado para verificar likes
    const session = await getServerSession(authOptions);
    const loggedInUserId = session?.user?.id;

    // Obter comentários de usuários com replies aninhados
    const userComments = await prismaClient.comment.findMany({
      where: postId ? { postId } : {},
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true, // Adicionar userId
        likesCount: true, // Incluir explicitamente o campo likesCount
        user: { select: { id: true, username: true, image: true, premium: true } },
        post: { select: { id: true } },
        replies: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true, // Adicionar userId para replies
            likesCount: true, // Incluir explicitamente o campo likesCount para replies
            user: { select: { id: true, username: true, image: true, premium: true } },
            likes: { select: { userId: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`Comentários de usuários encontrados: ${userComments.length}`);
    
    // Log detalhado do primeiro comentário para debug
    if (userComments.length > 0) {
      const firstComment = userComments[0];
      console.log('🔍 Primeiro comentário detalhado:', {
        id: firstComment.id,
        content: firstComment.content.substring(0, 50) + '...',
        likesCount: firstComment.likesCount,
        likes: firstComment.likes,
        replies: firstComment.replies.map(r => ({
          id: r.id,
          likesCount: r.likesCount,
          likes: r.likes
        }))
      });
      
      // Log adicional para verificar a estrutura completa
      console.log('🔍 Estrutura completa do primeiro comentário:', JSON.stringify(firstComment, null, 2));
    }

    const visitorComments = await prismaClient.visitorComment.findMany({
      where: postId ? { postId } : {},
      include: {
        post: {
          select: { id: true },
        },
      },
    });

    const validVisitorComments = visitorComments.filter(comment => comment.post !== null);

    // Combinar ambos os tipos de comentários
    const comments = [
      ...userComments.map((comment) => {
        const isLiked = comment.likes.some(like => like.userId === loggedInUserId);
        
        return {
          ...comment,
          type: 'user',
          user: comment.user ? { username: comment.user.username, image: comment.user.image, premium: comment.user.premium } : undefined,
          replies: comment.replies.map(reply => {
            const replyIsLiked = reply.likes.some(like => like.userId === loggedInUserId);
            return {
              ...reply,
              type: 'user',
              user: reply.user ? { username: reply.user.username, image: reply.user.image, premium: reply.user.premium } : undefined,
              isLiked: replyIsLiked,
              likesCount: reply.likesCount,
            };
          }),
          isLiked,
          likesCount: comment.likesCount,
        };
      }),
      ...validVisitorComments.map((comment: any) => ({
        ...comment,
        type: 'visitor',
        username: comment.username,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
        replies: [],
        isLiked: false,
        likesCount: 0, // Visitantes não podem ter likes
      })),
    ];

    // Include commentsCount in the response
    const commentsCount = postId ? await prismaClient.post.findUnique({
      where: { id: postId },
      select: { commentsCount: true },
    }) : null;

    const response = {
      comments,
      commentsCount: commentsCount?.commentsCount || comments.length,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao obter comentários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { postId, content, userId, username, parentId } = await request.json();

    if (!postId || !content) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    let newComment;

    if (userId) {
      newComment = await prismaClient.comment.create({
        data: {
          postId,
          content,
          userId,
          parentId: parentId || null, // Adicionar parentId para replies
        },
        include: {
          user: { select: { username: true, image: true, premium: true } },
          parent: { select: { id: true, content: true } },
        },
      });

      // Criar notificação se for uma resposta a um comentário
      if (parentId && userId) {
        try {
          await NotificationService.createCommentReplyNotification(userId, parentId, newComment.id);
        } catch (notificationError) {
          console.error('Erro ao criar notificação de resposta a comentário:', notificationError);
          // Não falhar a operação se a notificação falhar
        }
      }

      // Criar notificação para o autor do post (apenas para comentários principais)
      if (!parentId && userId) {
        try {
          await NotificationService.createCommentNotification(userId, postId, newComment.id);
        } catch (notificationError) {
          console.error('Erro ao criar notificação de comentário:', notificationError);
          // Não falhar a operação se a notificação falhar
        }
      }
    } else if (username) {
      newComment = await prismaClient.visitorComment.create({
        data: {
          postId,
          content,
          username,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Necessário fornecer userId ou username' },
        { status: 400 }
      );
    }

    // Incrementar o contador de comentários no post (apenas para comentários principais, não replies)
    if (!parentId) {
      await prismaClient.post.update({
        where: { id: postId },
        data: {
          commentsCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json(newComment);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}