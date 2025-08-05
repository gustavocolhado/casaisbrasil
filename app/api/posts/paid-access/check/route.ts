import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismaClient from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'postId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o post existe e é um post pago
    const paidPost = await (prismaClient as any).paidPost.findFirst({
      where: {
        postId: postId,
        isActive: true,
      },
      include: {
        post: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!paidPost) {
      return NextResponse.json(
        { hasAccess: false, error: 'Post não encontrado ou não é um post pago' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o criador do post
    if (paidPost.post.User.id === session.user.id) {
      return NextResponse.json({ hasAccess: true });
    }

    // Verificar se o usuário comprou acesso ao post
    const access = await (prismaClient as any).paidPostAccess.findFirst({
      where: {
        userId: session.user.id,
        paidPostId: paidPost.id,
      },
    });

    return NextResponse.json({
      hasAccess: !!access,
      paidPost: {
        id: paidPost.id,
        priceCredits: paidPost.priceCredits,
        description: paidPost.description,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar acesso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 