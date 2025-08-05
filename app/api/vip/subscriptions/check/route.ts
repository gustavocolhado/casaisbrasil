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

    if (!creatorId) {
      return NextResponse.json(
        { error: 'creatorId é obrigatório' },
        { status: 400 }
      );
    }

    // Primeiro, buscar todas as assinaturas do usuário
    const allSubscriptions = await (prismaClient as any).vipSubscription.findMany({
      where: {
        subscriberId: session.user.id,
        isActive: true,
      },
      include: {
        plan: {
          select: {
            id: true,
            title: true,
            creatorId: true,
            isActive: true,
          },
        },
      },
    });

    // Filtrar assinaturas com este criador
    const activeSubscription = allSubscriptions.find((sub: any) => 
      String(sub.plan.creatorId) === String(creatorId) && 
      sub.isActive && 
      sub.endDate > new Date() &&
      sub.plan.isActive
    );

    return NextResponse.json({
      hasActiveSubscription: !!activeSubscription,
      subscription: activeSubscription ? {
        id: activeSubscription.id,
        planId: activeSubscription.planId,
        planTitle: activeSubscription.plan.title,
        endDate: activeSubscription.endDate,
        isActive: activeSubscription.isActive,
      } : null,
    });
  } catch (error) {
    console.error('Erro ao verificar assinatura VIP:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 