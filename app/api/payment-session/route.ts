import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { plan, amount } = await request.json();

    // Verificar se os parâmetros foram fornecidos
    if (!plan || !amount) {
      return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
    }

    // Validar o valor
    if (amount <= 0 || amount > 10000) {
      return NextResponse.json({ error: 'Valor inválido.' }, { status: 400 });
    }

    // Criar sessão de pagamento
    const paymentSession = await prisma.paymentSession.create({
      data: {
        userId: session.user.id,
        plan: plan,
        amount: amount,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
      },
    });

    return NextResponse.json({ 
      sessionId: paymentSession.id,
      expiresAt: paymentSession.expiresAt
    });

  } catch (error) {
    console.error('Erro ao criar sessão de pagamento:', error);
    return NextResponse.json({ 
      error: 'Erro ao criar sessão de pagamento.' 
    }, { status: 500 });
  }
} 