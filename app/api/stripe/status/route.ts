import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
});

export async function GET(request: Request) {
  try {
    console.log('🔍 Stripe Status API - Iniciando verificação')
    
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ Stripe Status API - Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    console.log('🔍 Stripe Status API - sessionId recebido:', sessionId)

    if (!sessionId) {
      console.log('❌ Stripe Status API - SessionId ausente')
      return NextResponse.json({ error: 'SessionId ausente.' }, { status: 400 });
    }

    // Buscar a sessão de pagamento no banco
    const paymentSession = await prisma.paymentSession.findUnique({
      where: { id: sessionId }
    });

    console.log('🔍 Stripe Status API - paymentSession encontrada:', paymentSession ? 'sim' : 'não')

    if (!paymentSession) {
      console.log('❌ Stripe Status API - Sessão de pagamento não encontrada no banco')
      return NextResponse.json({ error: 'Sessão de pagamento não encontrada.' }, { status: 404 });
    }

    // Verificar se o usuário está consultando sua própria sessão
    if (paymentSession.userId !== session.user.id) {
      console.log('❌ Stripe Status API - Usuário não autorizado para esta sessão')
      return NextResponse.json({ error: 'Não autorizado para esta sessão.' }, { status: 403 });
    }

    // Verificar status no Stripe
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (stripeSession.payment_status === 'paid') {
        // Se o pagamento foi aprovado, processar a ativação
        if (paymentSession.status !== 'approved') {
          await prisma.$transaction(async (tx) => {
            // Atualizar status da sessão
            await tx.paymentSession.update({
              where: { id: sessionId },
              data: { status: 'approved' }
            });

            // Calcular data de expiração baseada no plano
            const planDurations = {
              'monthly': 30,
              'quarterly': 90,
              'semiannual': 180,
              'annual': 365
            };
            
            const daysToAdd = planDurations[paymentSession.plan as keyof typeof planDurations] || 30;
            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + daysToAdd);

            // Atualizar usuário para premium
            await tx.user.update({
              where: { id: paymentSession.userId },
              data: {
                premium: true,
                expireDate: expireDate,
                paymentStatus: 'approved'
              }
            });

            console.log(`Assinatura Premium ativada via Stripe para usuário ${paymentSession.userId}`);
          });
        }

        return NextResponse.json({ 
          status: 'complete',
          sessionId: sessionId,
          plan: paymentSession.plan,
          amount: paymentSession.amount
        });
      } else if (stripeSession.payment_status === 'unpaid') {
        return NextResponse.json({ 
          status: 'pending',
          sessionId: sessionId,
          plan: paymentSession.plan,
          amount: paymentSession.amount
        });
      } else {
        return NextResponse.json({ 
          status: 'error',
          sessionId: sessionId,
          plan: paymentSession.plan,
          amount: paymentSession.amount
        });
      }
    } catch (stripeError) {
      console.error('Erro ao consultar Stripe:', stripeError);
      
      // Retornar status do banco local
      return NextResponse.json({ 
        status: paymentSession.status === 'approved' ? 'complete' : 'pending',
        sessionId: sessionId,
        plan: paymentSession.plan,
        amount: paymentSession.amount,
        note: 'Status do banco local (Stripe indisponível)'
      });
    }

  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return NextResponse.json({ 
      error: 'Erro ao verificar status do pagamento.' 
    }, { status: 500 });
  }
} 