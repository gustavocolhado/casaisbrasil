import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    // Buscar planos VIP criados pelo usuário
    const plans = await prismaClient.vipPlan.findMany({
      where: {
        creatorId: userId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        priceCredits: true,
        duration: true,
        createdAt: true,
        _count: {
          select: {
            subscriptions: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ 
      plans,
      success: true 
    });
  } catch (error) {
    console.error('Erro ao buscar planos VIP:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, price, priceCredits, duration } = body;

    // Validar campos obrigatórios
    if (!title || !description || !price || !priceCredits || !duration) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é premium
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { premium: true }
    });

    if (!user?.premium) {
      return NextResponse.json(
        { error: 'Apenas usuários premium podem criar planos VIP' },
        { status: 403 }
      );
    }

    // Criar plano VIP
    const plan = await (prismaClient as any).vipPlan.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        priceCredits: parseInt(priceCredits),
        duration: parseInt(duration),
        creatorId: session.user.id,
        isActive: true
      }
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar plano VIP:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar plano VIP
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id, title, description, price, priceCredits, duration, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID do plano é obrigatório' }, { status: 400 });
    }

    // Verificar se o plano pertence ao usuário
    const existingPlan = await (prismaClient as any).vipPlan.findFirst({
      where: {
        id,
        creatorId: session.user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plano não encontrado ou não autorizado' }, { status: 404 });
    }

    const updatedPlan = await (prismaClient as any).vipPlan.update({
      where: { id },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        priceCredits: priceCredits ? parseInt(priceCredits) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        isActive,
        updatedAt: new Date(),
      },
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
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Erro ao atualizar plano VIP:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar plano VIP
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do plano é obrigatório' }, { status: 400 });
    }

    // Verificar se o plano pertence ao usuário
    const existingPlan = await (prismaClient as any).vipPlan.findFirst({
      where: {
        id,
        creatorId: session.user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plano não encontrado ou não autorizado' }, { status: 404 });
    }

    // Soft delete - apenas desativar
    await (prismaClient as any).vipPlan.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Plano deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar plano VIP:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 