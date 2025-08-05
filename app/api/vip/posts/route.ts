import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');
    const includePaidPosts = searchParams.get('includePaidPosts') === 'true';

    if (!creatorId) {
      return NextResponse.json(
        { error: 'creatorId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é o criador
    const isCreator = session.user.id === creatorId;

    // Se não for o criador, verificar se tem assinatura ativa
    if (!isCreator) {
      const activeSubscription = await (prismaClient as any).vipSubscription.findFirst({
        where: {
          subscriberId: session.user.id,
          isActive: true,
          endDate: {
            gte: new Date(), // Assinatura ainda não expirou
          },
          plan: {
            creatorId: creatorId,
            isActive: true,
          },
        },
      });

      if (!activeSubscription) {
        return NextResponse.json(
          { error: 'Acesso negado - assinatura VIP necessária' },
          { status: 403 }
        );
      }
    }

    // Buscar posts VIP do criador
    const vipPosts = await prismaClient.post.findMany({
      where: {
        userId: creatorId,
        approved: true,
        premium: true, // Posts VIP são marcados como premium
      },
      orderBy: {
        created_at: 'desc',
      },
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
    });

    // Se for o criador ou se includePaidPosts for true, buscar também posts pagos
    let paidPosts: any[] = [];
    if (isCreator || includePaidPosts) {
      const paidPostData = await (prismaClient as any).paidPost.findMany({
        where: {
          creatorId: creatorId,
          isActive: true,
        },
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
        orderBy: {
          createdAt: 'desc',
        },
      });

          // Verificar quais posts pagos o usuário tem acesso
    const userPaidPostAccesses = await (prismaClient as any).paidPostAccess.findMany({
      where: {
        userId: session.user.id,
        paidPostId: {
          in: paidPostData.map((pp: any) => pp.id),
        },
      },
      select: {
        paidPostId: true,
      },
    });

    const userPaidPostIds = new Set(userPaidPostAccesses.map((access: any) => access.paidPostId));

    paidPosts = paidPostData.map((paidPost: any) => ({
      ...paidPost.post,
      paidPost: {
        id: paidPost.id,
        priceCredits: paidPost.priceCredits,
        description: paidPost.description,
        isActive: paidPost.isActive,
        hasAccess: isCreator || userPaidPostIds.has(paidPost.id),
      },
    }));
    }

    // Combinar posts VIP e pagos, priorizando posts pagos sobre VIP
    const postMap = new Map();
    
    // Adicionar posts VIP primeiro
    vipPosts.forEach(post => {
      postMap.set(post.id, post);
    });
    
    // Sobrescrever com posts pagos (prioridade)
    paidPosts.forEach(post => {
      postMap.set(post.id, post);
    });
    
    const posts = Array.from(postMap.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );



    // Transformar posts para o formato esperado
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      description: post.description,
      url: post.url,
      viewCount: post.viewCount,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      approved: post.approved,
      mediaUrls: post.mediaUrls,
      failed: post.failed,
      premium: post.premium,
      created_at: post.created_at,
      updated_at: post.updated_at,
      userId: post.userId,
      User: post.User,
      comments: post.comments,
      likes: post.likes,
      photos: post.photos,
      videos: post.videos,
      _count: post._count,
      paidPost: post.paidPost || null,
    }));

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error('Erro ao buscar posts VIP:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 