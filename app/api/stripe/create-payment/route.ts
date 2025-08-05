import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
});

export async function POST(req: Request) {
  const { userId, amount, payerEmail, paymentType, locale, promotionCode, sessionId } = await req.json();

  // Verificações de dados
  if (!userId || !amount || !payerEmail || !paymentType) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  // Validar e converter o amount
  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: 'Valor inválido para amount.' }, { status: 400 });
  }

  // Log para depuração
  console.log('Valor recebido (amount):', parsedAmount);

  const currency = locale === 'en' ? 'usd' : locale === 'es' ? 'eur' : 'brl';
  
  // Remover a verificação de conta conectada se não estiver usando
  // const connectedAccount = process.env.STRIPE_CONNECTED_ACCOUNT;
  // if (!connectedAccount) {
  //   return NextResponse.json({ error: 'Conta conectada não configurada.' }, { status: 500 });
  // }

  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY não configurada');
      return NextResponse.json({ 
        error: 'Configuração do Stripe não encontrada. Verifique se STRIPE_SECRET_KEY está configurada no arquivo .env.local' 
      }, { status: 500 });
    }

    if (!process.env.HOST_URL) {
      console.error('❌ HOST_URL não configurada');
      return NextResponse.json({ 
        error: 'URL do host não configurada. Verifique se HOST_URL está configurada no arquivo .env.local' 
      }, { status: 500 });
    }

    console.log('✅ Configurações do Stripe verificadas com sucesso');
    console.log('🔍 STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Configurada' : 'Não configurada');
    console.log('🔍 STRIPE_PUBLIC_KEY:', process.env.STRIPE_PUBLIC_KEY ? 'Configurada' : 'Não configurada');
    console.log('🔍 HOST_URL:', process.env.HOST_URL);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

    // O amount recebido já está em centavos (ex.: 1790 = 17,90 BRL)
    const unitAmount = Math.round(parsedAmount); // Usa o valor diretamente como centavos
    console.log('Valor enviado para Stripe (unit_amount):', unitAmount);
    console.log('URL de sucesso:', `${process.env.HOST_URL}/premium/card-payment/success?session_id={CHECKOUT_SESSION_ID}`);
    console.log('URL de cancelamento:', `${process.env.HOST_URL}/premium`);

    // Criar uma sessão de Checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Assinatura ${paymentType}`,
            },
            unit_amount: unitAmount, // Ex.: 1790 centavos = 17,90 BRL
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.HOST_URL}/premium/card-payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.HOST_URL}/premium`,
      metadata: {
        userId: userId,
        plan: paymentType,
        amount: parsedAmount / 100, // Armazena em unidades para consistência
      },
    });

    // Criar o registro no banco de dados
    await prismaClient.payment.create({
      data: {
        userId,
        plan: paymentType,
        amount: parsedAmount / 100, // Converte para unidades (ex.: 1790 -> 17.9)
        status: 'pending',
        preferenceId: session.id,
        userEmail: payerEmail,
        ...(promotionCode && { promotionCode }),
      },
    });

    // Atualiza o registro na tabela paymentSession
    await prismaClient.paymentSession.update({
      where: {
        id: sessionId,
      },
      data: {
        preferenceId: session.id,
        status: 'pending',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erro ao criar sessão de pagamento:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 });
  }
}