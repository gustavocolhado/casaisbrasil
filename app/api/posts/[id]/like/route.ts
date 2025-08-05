import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Verifica se o post existe
    const existingPost = await prismaClient.post.findUnique({ 
      where: { id },
      select: { id: true, userId: true, likesCount: true }
    });
    
    if (!existingPost) {
      return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 });
    }

    // Verifica se o usuário já curtiu o post
    const existingLike = await prismaClient.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: userId
        }
      }
    });

    let updatedPost;
    let isLiked = false;

    if (existingLike) {
      // Se já curtiu, remove o like (dislike)
      await prismaClient.like.delete({
        where: {
          postId_userId: {
            postId: id,
            userId: userId
          }
        }
      });

      // Decrementa o contador
      updatedPost = await prismaClient.post.update({
        where: { id },
        data: { likesCount: { decrement: 1 } },
      });

      console.log(`👎 Like removido por ${userId} no post ${id}`);
    } else {
      // Se não curtiu, adiciona o like
      await prismaClient.like.create({
        data: {
          postId: id,
          userId: userId
        }
      });

      // Incrementa o contador
      updatedPost = await prismaClient.post.update({
        where: { id },
        data: { likesCount: { increment: 1 } },
      });

      isLiked = true;
      console.log(`👍 Like adicionado por ${userId} no post ${id}`);
    }

    // Notificação será criada diretamente pelo servidor socket quando o cliente emitir o evento
    // Não precisamos fazer chamada HTTP aqui

    return NextResponse.json({ 
      likesCount: updatedPost.likesCount,
      isLiked: isLiked
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro ao gerenciar like:', error.message, error.stack);
    } else {
      console.error('Erro desconhecido ao gerenciar like:', error);
    }
    return NextResponse.json({ message: 'Erro ao gerenciar curtida' }, { status: 500 });
  }
}
