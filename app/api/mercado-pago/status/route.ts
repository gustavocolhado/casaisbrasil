import { NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com/v1/payments';

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentIdString = searchParams.get('paymentId');

    // Verifica se o parâmetro paymentId foi fornecido
    if (!paymentIdString) {
      return NextResponse.json({ error: 'Parâmetro paymentId ausente.' }, { status: 400 });
    }

    // Converte para número para consulta no banco
    const paymentIdNumber = parseInt(paymentIdString, 10);
    if (isNaN(paymentIdNumber)) {
      return NextResponse.json({ error: 'paymentId inválido.' }, { status: 400 });
    }

    // Busca o pagamento no banco de dados
    const payment = await prisma.payment.findFirst({
      where: { paymentId: paymentIdNumber },
      include: { user: true }
    });

    // Verifica se o pagamento foi encontrado
    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado.' }, { status: 404 });
    }

    // Verificar se o usuário está consultando seu próprio pagamento
    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado para este pagamento.' }, { status: 403 });
    }

    // Verificar status em tempo real no MercadoPago
    try {
      const response = await axios.get(`${MERCADO_PAGO_API_URL}/${paymentIdString}`, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      const mercadopagoStatus = response.data.status;
      
      // Se o status mudou, atualizar no banco
      if (mercadopagoStatus !== payment.status) {
        await prisma.$transaction(async (tx) => {
          // Atualizar status do pagamento
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: mercadopagoStatus }
          });

          // Se o pagamento foi aprovado, processar baseado no tipo
          if (mercadopagoStatus === 'approved') {
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
                  paymentStatus: mercadopagoStatus,
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

              console.log(`Créditos adicionados via status check para usuário ${payment.userId}: ${creditsToAdd} créditos`);
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
                  paymentStatus: mercadopagoStatus,
                  paymentQrCodeUrl: null,
                  paymentId: null,
                  paymentType: null
                }
              });

              console.log(`Assinatura Premium ativada via status check para usuário ${payment.userId}`);
            }

            // Atualizar sessão de pagamento
            await tx.paymentSession.updateMany({
              where: { paymentId: paymentIdNumber },
              data: { status: mercadopagoStatus }
            });

            // Atualizar status na tabela Affiliates se existir
            await tx.affiliate.updateMany({
              where: { paymentId: paymentIdNumber },
              data: { status: mercadopagoStatus }
            });
          }
        });
      }

      return NextResponse.json({ 
        status: mercadopagoStatus,
        paymentId: paymentIdString,
        plan: payment.plan,
        amount: payment.amount
      });

    } catch (mercadopagoError) {
      // Se não conseguir consultar o MercadoPago, retornar status do banco
      console.error('Erro ao consultar MercadoPago:', mercadopagoError);
      return NextResponse.json({ 
        status: payment.status,
        paymentId: paymentIdString,
        plan: payment.plan,
        amount: payment.amount,
        note: 'Status do banco local (MercadoPago indisponível)'
      });
    }

  } catch (error) {
    console.error('Erro ao buscar o status do pagamento:', error);
    return NextResponse.json({ 
      error: 'Erro ao buscar o status do pagamento.' 
    }, { status: 500 });
  }
}
