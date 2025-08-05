import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID da sessão não fornecido' }, { status: 400 });
    }

    // Buscar a sessão de pagamento
    const session = await prismaClient.paymentSession.findUnique({
      where: { id }
    });

    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    // Buscar dados do usuário separadamente
    const user = await prismaClient.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true
      }
    });

    // Retornar os dados da sessão
    return NextResponse.json({
      id: session.id,
      plan: session.plan,
      amount: session.amount,
      userId: session.userId,
      payerEmail: user?.email,
      status: session.status,
      createdAt: session.createdAt
    });

  } catch (error) {
    console.error('Erro ao buscar sessão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}