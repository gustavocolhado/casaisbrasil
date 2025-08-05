import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com/v1/payments';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('✅ Webhook Mercado Pago recebido:', body);
    
    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment') {
      console.log('⚠️ Notificação ignorada - não é um pagamento:', body.type);
      return NextResponse.json({ message: 'Notificação ignorada - não é um pagamento' });
    }

    const paymentId = body.data.id;
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID não encontrado' }, { status: 400 });
    }

    // Buscar detalhes do pagamento no MercadoPago
    const response = await axios.get(`${MERCADO_PAGO_API_URL}/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const paymentData = response.data;
    const status = paymentData.status;
    const externalReference = paymentData.external_reference; // sessionId

    console.log(`Webhook recebido - Payment: ${paymentId}, Status: ${status}, Session: ${externalReference}`);

    // Buscar o pagamento no banco
    const payment = await prisma.payment.findFirst({
      where: { paymentId: paymentId },
      include: { user: true }
    });

    if (!payment) {
      console.error(`Pagamento ${paymentId} não encontrado no banco`);
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Atualizar status do pagamento
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: status }
    });

    // Se o pagamento foi aprovado, processar baseado no tipo
    if (status === 'approved') {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: payment.userId }
        });

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        // Se for pagamento de créditos
        if (payment.plan === 'credits') {
          // Calcula a quantidade de créditos baseada no valor (100 créditos = R$ 1,00)
          const creditsToAdd = Math.round(payment.amount * 100);
          const newBalance = (user.credits || 0) + creditsToAdd;

          // Atualizar créditos do usuário
          await tx.user.update({
            where: { id: payment.userId },
            data: {
              credits: newBalance,
              paymentStatus: status,
              paymentQrCodeUrl: null,
              paymentId: null,
              paymentType: null
            }
          });

          // Criar transação de crédito
          await tx.creditTransaction.create({
            data: {
              userId: payment.userId,
              type: 'purchase',
              amount: creditsToAdd,
              description: `Compra de ${creditsToAdd.toLocaleString('pt-BR')} créditos via PIX`,
              balance: newBalance,
            },
          });

          console.log(`Créditos adicionados via webhook para usuário ${payment.userId}: ${creditsToAdd} créditos`);
        }
        // Se for pagamento de assinatura premium
        else {
          // Calcular data de expiração baseada no plano
          const planDurations = {
            'monthly': 30,
            'quarterly': 90,
            'semiannual': 180,
            'annual': 365
          };
          
          const daysToAdd = planDurations[payment.plan as keyof typeof planDurations] || 30;
          const expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + daysToAdd);

          // Atualizar usuário para premium
          await tx.user.update({
            where: { id: payment.userId },
            data: {
              premium: true,
              expireDate: expireDate,
              paymentStatus: status,
              paymentQrCodeUrl: null,
              paymentId: null,
              paymentType: null
            }
          });

          console.log(`Assinatura Premium ativada via webhook para usuário ${payment.userId}`);
        }

        // Atualizar sessão de pagamento se existir
        if (externalReference) {
          await tx.paymentSession.updateMany({
            where: { id: externalReference },
            data: { status: status }
          });
        }

        // Atualizar status na tabela Affiliates se existir
        await tx.affiliate.updateMany({
          where: { paymentId: paymentId },
          data: { status: status }
        });
      });
    }

    return NextResponse.json({ 
      message: 'Webhook processado com sucesso',
      paymentId: paymentId,
      status: status,
      plan: payment.plan
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar webhook' 
    }, { status: 500 });
  }
}

// Método GET para verificação do webhook
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook MercadoPago ativo',
    timestamp: new Date().toISOString()
  });
}