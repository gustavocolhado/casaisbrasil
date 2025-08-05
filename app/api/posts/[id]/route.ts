import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  try {
    const post = await prismaClient.post.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        description: true,
        userId: true,
        mediaUrls: true,
        likesCount: true,
        commentsCount: true,
        approved: true,
        failed: true,
        premium: true,
        created_at: true,
        updated_at: true,
        CommentsCount: true,
        paidPost: {
          select: {
            id: true,
            priceCredits: true,
            description: true,
            isActive: true,
          }
        },
        User: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            password: true,
            emailVerified: true,
            image: true,
            bio: true,
            followersCount: true,
            access: true,
            premium: true,
            city: true,
            state: true,
            role: true,
          },
        },
        comments: {
          select: {
            id: true,
            postId: true,
            userId: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                image: true,
                city: true,
                state: true,
                role: true,
                access: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        visitorComments: {
          select: {
            id: true,
            username: true,
            content: true,
            postId: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { id } = params;

  // Verificar se o post pertence ao usuário logado
  const post = await prismaClient.post.findUnique({
    where: { id },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
  }

  if (post.userId !== session.user.id) {
    return NextResponse.json({ error: 'Ação não permitida' }, { status: 403 });
  }

  // Excluir o post e os registros associados em uma transação
  try {
    await prismaClient.$transaction(async (prisma) => {
      // Verificar se o post é um post pago
      const paidPost = await prisma.paidPost.findUnique({
        where: { postId: id },
        include: {
          accesses: true,
        },
      });

      if (paidPost) {
        // Se for um post pago, excluir primeiro os acessos comprados
        if (paidPost.accesses.length > 0) {
          await prisma.paidPostAccess.deleteMany({
            where: { paidPostId: paidPost.id },
          });
        }

        // Excluir o registro do post pago
        await prisma.paidPost.delete({
          where: { postId: id },
        });
      }

      // Excluir registros da tabela Photo associados ao post
      await prisma.photo.deleteMany({
        where: { postId: id },
      });

      // Excluir registros da tabela Video associados ao post
      await prisma.video.deleteMany({
        where: { postId: id },
      });

      // Excluir likes do post
      await prisma.like.deleteMany({
        where: { postId: id },
      });

      // Excluir comentários do post
      await prisma.comment.deleteMany({
        where: { postId: id },
      });

      // Excluir comentários de visitantes do post
      await prisma.visitorComment.deleteMany({
        where: { postId: id },
      });

      // Excluir o post
      await prisma.post.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: 'Post excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    return NextResponse.json({ error: 'Erro ao excluir post' }, { status: 500 });
  }
}