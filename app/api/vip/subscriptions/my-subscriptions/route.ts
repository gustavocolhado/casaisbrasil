import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar assinaturas ativas do usuário
    const activeSubscriptions = await (prisma as any).vipSubscription.findMany({
      where: {
        subscriberId: userId,
        isActive: true,
        endDate: {
          gt: new Date()
        }
      },
      include: {
        plan: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatar os dados para o frontend
    const formattedSubscriptions = activeSubscriptions.map((subscription: any) => ({
      id: subscription.id,
      planId: subscription.planId,
      planTitle: subscription.plan.title,
      planDescription: subscription.plan.description,
      planDuration: subscription.plan.duration,
      creatorId: subscription.plan.creator.id,
      creatorName: subscription.plan.creator.name,
      creatorUsername: subscription.plan.creator.username,
      creatorImage: subscription.plan.creator.image,
      creatorBio: subscription.plan.creator.bio,
      status: subscription.isActive ? 'ACTIVE' : 'INACTIVE',
      createdAt: subscription.createdAt,
      expiresAt: subscription.endDate,
      daysRemaining: Math.ceil((subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      total: formattedSubscriptions.length
    });

  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 