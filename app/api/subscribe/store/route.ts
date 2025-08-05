import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { plan, amount, userId } = await req.json();

    if (!userId || !plan || !amount) {
      return NextResponse.json({ error: 'Dados faltando' }, { status: 400 });
    }

    // Criação da sessão de pagamento no banco de dados
    const session = await prismaClient.paymentSession.create({
      data: {
        userId: userId,
        plan: plan,
        amount: amount,
      },
    });

    // Log para verificar a criação da sessão
    console.log('Sessão criada:', session);

    // Retorna o sessionId na resposta
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erro ao criar a sessão de pagamento:', error);
    return NextResponse.json({ error: 'Erro ao criar a sessão de pagamento' }, { status: 500 });
  }
}
