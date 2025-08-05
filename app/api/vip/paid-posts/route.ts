import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismaClient from '@/lib/prisma';

// GET - Listar posts pagos de um usuário ou verificar acesso
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId');
    const postId = searchParams.get('postId');
    const checkAccess = searchParams.get('checkAccess') === 'true';

    if (checkAccess && postId) {
      // Verificar se o usuário tem acesso ao post pago
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }

      const access = await (prismaClient as any).paidPostAccess.findFirst({
        where: {
          userId: session.user.id,
          paidPost: {
            postId,
          },
        },
      });

      return NextResponse.json({ hasAccess: !!access });
    }

    if (creatorId) {
      // Listar posts pagos de um criador
      const paidPosts = await (prismaClient as any).paidPost.findMany({
        where: {
          creatorId,
          isActive: true,
        },
        include: {
          post: {
            select: {
              id: true,
              description: true,
              mediaUrls: true,
              viewCount: true,
              likesCount: true,
              commentsCount: true,
              created_at: true,
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
          accesses: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(paidPosts);
    }

    return NextResponse.json({ error: 'creatorId ou postId é obrigatório' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao buscar posts pagos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar post pago
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { postId, price, priceCredits, description } = await req.json();

    if (!postId || !price || !priceCredits || !description) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    if (price <= 0 || priceCredits <= 0) {
      return NextResponse.json({ error: 'Valores devem ser maiores que zero' }, { status: 400 });
    }

    // Verificar se o post pertence ao usuário
    const post = await prismaClient.post.findFirst({
      where: {
        id: postId,
        userId: session.user.id,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado ou não autorizado' }, { status: 404 });
    }

    // Verificar se já existe um post pago para este post
    const existingPaidPost = await (prismaClient as any).paidPost.findUnique({
      where: { postId },
    });

    if (existingPaidPost) {
      return NextResponse.json({ error: 'Este post já é um post pago' }, { status: 400 });
    }

    const paidPost = await (prismaClient as any).paidPost.create({
      data: {
        postId,
        creatorId: session.user.id,
        price: parseFloat(price),
        priceCredits: parseInt(priceCredits),
        description,
      },
      include: {
        post: {
          select: {
            id: true,
            description: true,
            mediaUrls: true,
            viewCount: true,
            likesCount: true,
            commentsCount: true,
            created_at: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(paidPost, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar post pago:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar post pago
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id, price, priceCredits, description, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID do post pago é obrigatório' }, { status: 400 });
    }

    // Verificar se o post pago pertence ao usuário
    const existingPaidPost = await (prismaClient as any).paidPost.findFirst({
      where: {
        id,
        creatorId: session.user.id,
      },
    });

    if (!existingPaidPost) {
      return NextResponse.json({ error: 'Post pago não encontrado ou não autorizado' }, { status: 404 });
    }

    const updatedPaidPost = await (prismaClient as any).paidPost.update({
      where: { id },
      data: {
        price: price ? parseFloat(price) : undefined,
        priceCredits: priceCredits ? parseInt(priceCredits) : undefined,
        description,
        isActive,
        updatedAt: new Date(),
      },
      include: {
        post: {
          select: {
            id: true,
            description: true,
            mediaUrls: true,
            viewCount: true,
            likesCount: true,
            commentsCount: true,
            created_at: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPaidPost);
  } catch (error) {
    console.error('Erro ao atualizar post pago:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar post pago
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do post pago é obrigatório' }, { status: 400 });
    }

    // Verificar se o post pago pertence ao usuário
    const existingPaidPost = await (prismaClient as any).paidPost.findFirst({
      where: {
        id,
        creatorId: session.user.id,
      },
    });

    if (!existingPaidPost) {
      return NextResponse.json({ error: 'Post pago não encontrado ou não autorizado' }, { status: 404 });
    }

    // Soft delete - apenas desativar
    await (prismaClient as any).paidPost.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Post pago deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar post pago:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 