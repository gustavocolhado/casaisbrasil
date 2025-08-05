import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    // Verificar se o usuário existe e tem planos VIP
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        premium: true,
        vipPlans: {
          where: { isActive: true },
          select: { id: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!user.premium || user.vipPlans.length === 0) {
      return NextResponse.json({ 
        posts: [],
        total: 0,
        page,
        limit,
        hasMore: false,
        message: 'Usuário não possui planos VIP ativos'
      });
    }

    // Buscar posts do usuário que são VIP (posts premium)
    const posts = await prismaClient.post.findMany({
      where: {
        userId: userId,
        premium: true,
        approved: true,
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            premium: true,
          }
        },
        photos: true,
        videos: true,
        paidPost: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit,
    });

    // Contar total de posts VIP
    const total = await prismaClient.post.count({
      where: {
        userId: userId,
        premium: true,
        approved: true,
      }
    });

    const hasMore = skip + limit < total;

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
      hasMore,
      success: true
    });

  } catch (error) {
    console.error('Erro ao buscar posts VIP:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
} 