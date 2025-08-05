import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismaClient from '@/lib/prisma';

// GET - Listar assinaturas VIP do usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId');

    let whereClause: any = {
      subscriberId: session.user.id,
      isActive: true,
    };

    if (creatorId) {
      whereClause.plan = {
        creatorId,
      };
    }

    const subscriptions = await (prismaClient as any).vipSubscription.findMany({
      where: whereClause,
      include: {
        plan: {
          include: {
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Erro ao buscar assinaturas VIP:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Assinar plano VIP
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { planId, paymentType } = await req.json();

    if (!planId || !paymentType) {
      return NextResponse.json({ error: 'planId e paymentType são obrigatórios' }, { status: 400 });
    }

    if (!['money', 'credits'].includes(paymentType)) {
      return NextResponse.json({ error: 'paymentType deve ser "money" ou "credits"' }, { status: 400 });
    }

    // Buscar o plano
    const plan = await (prismaClient as any).vipPlan.findUnique({
      where: { id: planId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Plano não encontrado ou inativo' }, { status: 404 });
    }

    // Verificar se não é o próprio criador
    if (plan.creatorId === session.user.id) {
      return NextResponse.json({ error: 'Você não pode assinar seu próprio plano' }, { status: 400 });
    }

    // Verificar se já tem uma assinatura ativa para este plano
    const existingSubscription = await (prismaClient as any).vipSubscription.findFirst({
      where: {
        subscriberId: session.user.id,
        planId,
        isActive: true,
      },
    });

    if (existingSubscription) {
      return NextResponse.json({ error: 'Você já tem uma assinatura ativa para este plano' }, { status: 400 });
    }

    let amount = 0;
    let endDate = new Date();

    if (paymentType === 'credits') {
      amount = plan.priceCredits;
      
      // Verificar se tem créditos suficientes
      const user = await (prismaClient as any).user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      if (!user || user.credits < amount) {
        return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 400 });
      }

      // Calcular novo saldo
      const newBalance = user.credits - amount;

      // Descontar créditos
      await (prismaClient as any).user.update({
        where: { id: session.user.id },
        data: {
          credits: newBalance,
        },
      });

      // Registrar transação de crédito
      await (prismaClient as any).creditTransaction.create({
        data: {
          userId: session.user.id,
          type: 'vip_subscription',
          amount: -amount,
          description: `Assinatura VIP: ${plan.title} - ${plan.creator.name || plan.creator.username}`,
          balance: newBalance,
        },
      });

      // Buscar saldo atual do criador
      const creator = await (prismaClient as any).user.findUnique({
        where: { id: plan.creatorId },
        select: { credits: true },
      });

      const creatorNewBalance = (creator?.credits || 0) + amount;

      // Adicionar créditos ao criador do plano
      await (prismaClient as any).user.update({
        where: { id: plan.creatorId },
        data: {
          credits: creatorNewBalance,
        },
      });

      // Registrar transação de crédito para o criador
      await (prismaClient as any).creditTransaction.create({
        data: {
          userId: plan.creatorId,
          type: 'vip_earnings',
          amount: amount,
          description: `Ganhos VIP: ${plan.title} - ${session.user.name || session.user.username}`,
          balance: creatorNewBalance,
        },
      });
    } else {
      amount = plan.price;
      // Para pagamento em dinheiro, retornar dados para processamento externo
      return NextResponse.json({
        plan,
        amount,
        paymentType,
        requiresExternalPayment: true,
      });
    }

    // Calcular data de fim
    endDate.setDate(endDate.getDate() + plan.duration);

    // Criar assinatura
    const subscription = await (prismaClient as any).vipSubscription.create({
      data: {
        subscriberId: session.user.id,
        planId,
        paymentType,
        amount,
        endDate,
      },
      include: {
        plan: {
          include: {
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

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Erro ao assinar plano VIP:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Cancelar assinatura VIP
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId é obrigatório' }, { status: 400 });
    }

    // Verificar se a assinatura pertence ao usuário
    const subscription = await (prismaClient as any).vipSubscription.findFirst({
      where: {
        id: subscriptionId,
        subscriberId: session.user.id,
        isActive: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 });
    }

    // Cancelar assinatura
    await (prismaClient as any).vipSubscription.update({
      where: { id: subscriptionId },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ message: 'Assinatura cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar assinatura VIP:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 