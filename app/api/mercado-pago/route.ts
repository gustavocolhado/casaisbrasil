import { NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/lib/prisma';
import { config } from 'dotenv';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Carrega as variáveis do .env
config();

// Acessa o token da variável de ambiente
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com/v1/payments';

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // Captura os dados da requisição
    const { userId, amount, payerEmail, paymentType, promotionCode, sessionId } = await request.json();

    // Verificar se o usuário está tentando pagar por si mesmo
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Não autorizado para este usuário.' }, { status: 403 });
    }

    // Verifica a presença de todos os parâmetros
    if (!userId || !amount || !payerEmail || !paymentType) {
      return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
    }

    // Validar valores
    if (amount <= 0 || amount > 10000) {
      return NextResponse.json({ error: 'Valor inválido.' }, { status: 400 });
    }

    // Se for pagamento de créditos, não precisa de sessionId
    if (paymentType !== 'credits' && !sessionId) {
      return NextResponse.json({ error: 'SessionId obrigatório para assinaturas.' }, { status: 400 });
    }

    // Para assinaturas, verificar se já existe um pagamento em andamento
    if (paymentType !== 'credits') {
      const existingPayment = await prisma.paymentSession.findUnique({
        where: { id: sessionId }
      });

      if (!existingPayment) {
        return NextResponse.json({ error: 'Sessão de pagamento não encontrada.' }, { status: 404 });
      }

      if (existingPayment.paymentId) {
        return NextResponse.json({ error: 'Pagamento já iniciado para esta sessão.' }, { status: 400 });
      }
    }

    // Gera um valor único para o cabeçalho X-Idempotency-Key
    const idempotencyKey = paymentType === 'credits' 
      ? `user_${userId}_credits_${Date.now()}`
      : `user_${userId}_session_${sessionId}_${Date.now()}`;

    // Define a descrição do pagamento com base no tipo
    let description = '';
    if (paymentType === 'credits') {
      const creditsAmount = Math.round(amount * 100);
      description = `Compra de ${creditsAmount.toLocaleString('pt-BR')} créditos - Confissões de Corno`;
    } else {
      const planNames = {
        'monthly': 'Mensal',
        'quarterly': 'Trimestral',
        'semiannual': 'Semestral',
        'annual': 'Anual'
      };
      
      const planName = planNames[paymentType as keyof typeof planNames] || paymentType;
      description = `Assinatura Premium ${planName} - Confissões de Corno`;
    }

    // Faz a requisição para criar o pagamento
    const paymentResponse = await axios.post(MERCADO_PAGO_API_URL, {
      transaction_amount: amount,
      description: description,
      payment_method_id: 'pix',
      payer: {
        email: payerEmail,
        first_name: session.user.name?.split(' ')[0] || 'Usuário',
        last_name: session.user.name?.split(' ').slice(1).join(' ') || 'Premium'
      },
      ...(process.env.NODE_ENV === 'production' && {
        notification_url: `${process.env.HOST_URL}/api/mercado-pago/webhook`
      }),
      external_reference: sessionId || `credits_${userId}_${Date.now()}`
    }, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
    });

    // Verifica se o pagamento foi criado com sucesso
    const paymentData = paymentResponse.data;
    const qrCodeUrl = paymentData.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = paymentData.point_of_interaction?.transaction_data?.qr_code_base64;
    const pixCode = paymentData.point_of_interaction?.transaction_data?.qr_code;
    const paymentId = paymentData.id;
    const paymentStatus = paymentData.status;

    if (!qrCodeUrl || !paymentId) {
      throw new Error('Falha ao criar o pagamento: QR Code ou Payment ID não encontrado.');
    }

    // Criar registro de pagamento em transação
    await prisma.$transaction(async (tx) => {
      // Adiciona um registro na tabela de pagamentos
      await tx.payment.create({
        data: {
          userId: userId,
          plan: paymentType,
          amount: amount,
          paymentId: Number(paymentId),
          transactionDate: new Date(),
          userEmail: payerEmail,
          status: paymentStatus,
          promotionCode: promotionCode || null
        },
      });

      // Para assinaturas, atualizar a sessão de pagamento
      if (paymentType !== 'credits' && sessionId) {
        await tx.paymentSession.update({
          where: { id: sessionId },
          data: {
            paymentId: Number(paymentId),
            status: paymentStatus
          },
        });
      }

      // Atualiza o usuário no banco de dados
      await tx.user.update({
        where: { id: userId },
        data: {
          paymentQrCodeUrl: qrCodeUrl,
          paymentId: Number(paymentId),
          paymentType: paymentType,
          paymentStatus: paymentStatus
        },
      });
    });

    // Log de sucesso (sem dados sensíveis)
    const logMessage = paymentType === 'credits' 
      ? `Pagamento PIX de créditos criado com sucesso - User: ${userId}, Payment: ${paymentId}`
      : `Pagamento PIX de assinatura criado com sucesso - User: ${userId}, Session: ${sessionId}, Payment: ${paymentId}`;
    
    console.log(logMessage);

    return NextResponse.json({ 
      qrCodeUrl, 
      qrCodeBase64,
      pixCode,
      paymentId: Number(paymentId), 
      paymentStatus,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Erro na API MercadoPago:', error);

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      console.error('Erro Axios:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      });
      return NextResponse.json({ 
        error: `Erro no MercadoPago: ${errorMessage}` 
      }, { status: error.response?.status || 500 });
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro inesperado.' 
    }, { status: 500 });
  }
}