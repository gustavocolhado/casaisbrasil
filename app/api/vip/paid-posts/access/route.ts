import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismaClient from '@/lib/prisma';

// POST - Comprar acesso a post pago
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { paidPostId, paymentType } = await req.json();

    if (!paidPostId || !paymentType) {
      return NextResponse.json({ error: 'paidPostId e paymentType são obrigatórios' }, { status: 400 });
    }

    if (!['money', 'credits'].includes(paymentType)) {
      return NextResponse.json({ error: 'paymentType deve ser "money" ou "credits"' }, { status: 400 });
    }

    // Buscar o post pago
    const paidPost = await (prismaClient as any).paidPost.findUnique({
      where: { id: paidPostId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
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
      },
    });

    if (!paidPost || !paidPost.isActive) {
      return NextResponse.json({ error: 'Post pago não encontrado ou inativo' }, { status: 404 });
    }

    // Verificar se não é o próprio criador
    if (paidPost.creatorId === session.user.id) {
      return NextResponse.json({ error: 'Você não pode comprar acesso ao seu próprio post' }, { status: 400 });
    }

    // Verificar se já tem acesso
    const existingAccess = await (prismaClient as any).paidPostAccess.findFirst({
      where: {
        userId: session.user.id,
        paidPostId,
      },
    });

    if (existingAccess) {
      return NextResponse.json({ error: 'Você já tem acesso a este post' }, { status: 400 });
    }

    let amount = 0;

    if (paymentType === 'credits') {
      amount = paidPost.priceCredits;
      
      // Verificar se tem créditos suficientes
      const user = await (prismaClient as any).user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      if (!user || user.credits < amount) {
        return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 400 });
      }

      // Descontar créditos
      await (prismaClient as any).user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: amount,
          },
        },
      });

      // Registrar transação de crédito
      await (prismaClient as any).creditTransaction.create({
        data: {
          userId: session.user.id,
          type: 'paid_post_access',
          amount: -amount,
          description: `Acesso a post pago: ${paidPost.creator.name || paidPost.creator.username}`,
        },
      });

      // Adicionar créditos ao criador do post
      await (prismaClient as any).user.update({
        where: { id: paidPost.creatorId },
        data: {
          credits: {
            increment: amount,
          },
        },
      });

      // Registrar transação de crédito para o criador
      await (prismaClient as any).creditTransaction.create({
        data: {
          userId: paidPost.creatorId,
          type: 'paid_post_earnings',
          amount: amount,
          description: `Ganhos post pago: ${session.user.name || session.user.username}`,
        },
      });
    } else {
      amount = paidPost.price;
      // Para pagamento em dinheiro, retornar dados para processamento externo
      return NextResponse.json({
        paidPost,
        amount,
        paymentType,
        requiresExternalPayment: true,
      });
    }

    // Criar acesso
    const access = await (prismaClient as any).paidPostAccess.create({
      data: {
        userId: session.user.id,
        paidPostId,
        paymentType,
        amount,
      },
      include: {
        paidPost: {
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
        },
      },
    });

    return NextResponse.json(access, { status: 201 });
  } catch (error) {
    console.error('Erro ao comprar acesso a post pago:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId');
    const userId = searchParams.get('userId');

    if (!creatorId || !userId) {
      return NextResponse.json(
        { error: 'creatorId e userId são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar posts pagos que o usuário comprou deste criador
    const paidPostAccesses = await (prismaClient as any).paidPostAccess.findMany({
      where: {
        userId: userId,
        paidPost: {
          creatorId: creatorId,
          isActive: true,
        },
      },
      include: {
        paidPost: {
          include: {
            post: {
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    emailVerified: true,
                    image: true,
                    bio: true,
                    followers: { select: { id: true } },
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
                    content: true,
                    createdAt: true,
                    user: {
                      select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                      },
                    },
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 3,
                },
                likes: {
                  select: {
                    id: true,
                    userId: true,
                  },
                },
                photos: {
                  select: {
                    id: true,
                    url: true,
                  },
                },
                videos: {
                  select: {
                    id: true,
                    url: true,
                  },
                },
                _count: {
                  select: {
                    comments: true,
                    likes: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        accessDate: 'desc',
      },
    });

    // Transformar para o formato esperado
    const transformedPosts = paidPostAccesses.map((access: any) => ({
      id: access.paidPost.post.id,
      description: access.paidPost.post.description,
      url: access.paidPost.post.url,
      viewCount: access.paidPost.post.viewCount,
      likesCount: access.paidPost.post.likesCount,
      commentsCount: access.paidPost.post.commentsCount,
      approved: access.paidPost.post.approved,
      mediaUrls: access.paidPost.post.mediaUrls,
      failed: access.paidPost.post.failed,
      premium: access.paidPost.post.premium,
      created_at: access.paidPost.post.created_at,
      updated_at: access.paidPost.post.updated_at,
      userId: access.paidPost.post.userId,
      User: access.paidPost.post.User,
      comments: access.paidPost.post.comments,
      likes: access.paidPost.post.likes,
      photos: access.paidPost.post.photos,
      videos: access.paidPost.post.videos,
      _count: access.paidPost.post._count,
      paidPost: {
        id: access.paidPost.id,
        priceCredits: access.paidPost.priceCredits,
        description: access.paidPost.description,
        isActive: access.paidPost.isActive,
      },
    }));

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error('Erro ao buscar posts pagos comprados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 