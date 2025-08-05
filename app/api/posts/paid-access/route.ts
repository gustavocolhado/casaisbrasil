import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';

// Função para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para executar transação com retry
async function executeTransactionWithRetry(transactionFn: (tx: any) => Promise<any>, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prismaClient.$transaction(transactionFn);
    } catch (error: any) {
      // Se for erro de conflito de transação e ainda há tentativas
      if (error.code === 'P2034' && attempt < maxRetries) {
        console.log(`Tentativa ${attempt} falhou, tentando novamente em ${attempt * 100}ms...`);
        await delay(attempt * 100); // Delay exponencial
        continue;
      }
      // Se não for erro de conflito ou acabaram as tentativas, re-throw
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postId, userId } = await request.json();

    if (!postId || !userId) {
      return NextResponse.json({ 
        error: 'postId e userId são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar o usuário da plataforma pelo username
    const platformUser = await prismaClient.user.findFirst({
      where: { username: 'confissoesdecorno' },
      select: { id: true, credits: true }
    });
    if (!platformUser) {
      return NextResponse.json({ error: 'Usuário da plataforma não encontrado' }, { status: 500 });
    }
    const platformUserId = platformUser.id;

    // Verificar se o post existe e é privado
    const post = await prismaClient.post.findUnique({
      where: { id: postId },
      include: {
        paidPost: true,
        User: {
          select: {
            id: true,
            username: true,
            premium: true,
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ 
        error: 'Post não encontrado' 
      }, { status: 404 });
    }

    if (!post.paidPost) {
      return NextResponse.json({ 
        error: 'Este post não é privado' 
      }, { status: 400 });
    }

    // Verificar se o usuário já comprou acesso
    const existingAccess = await prismaClient.paidPostAccess.findUnique({
      where: {
        userId_paidPostId: {
          userId: userId,
          paidPostId: post.paidPost!.id,
        }
      }
    });

    if (existingAccess) {
      return NextResponse.json({ 
        error: 'Você já possui acesso a este post' 
      }, { status: 400 });
    }

    // Verificar se o usuário tem créditos suficientes
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        credits: true,
        username: true 
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    if (user.credits < post.paidPost!.priceCredits) {
      return NextResponse.json({ 
        error: `Créditos insuficientes. Você tem ${user.credits} créditos, mas precisa de ${post.paidPost!.priceCredits} créditos.` 
      }, { status: 400 });
    }

    // Executar transação com retry
    const result = await executeTransactionWithRetry(async (tx) => {
      // Deduzir créditos do usuário
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: post.paidPost!.priceCredits
          }
        },
        select: { 
          id: true, 
          credits: true,
          username: true 
        }
      });

      // Registrar transação de créditos
      await tx.creditTransaction.create({
        data: {
          userId: userId,
          type: 'post_access_purchase',
          amount: -post.paidPost!.priceCredits,
          description: `Compra de acesso ao post de ${post.User?.username}`,
          balance: updatedUser.credits,
        }
      });

      // Adicionar créditos ao criador do post (com comissão de 10%)
      const commission = Math.floor(post.paidPost!.priceCredits * 0.1); // 10% de comissão
      const creatorAmount = post.paidPost!.priceCredits - commission;

      const creator = await tx.user.update({
        where: { id: post.User!.id },
        data: {
          credits: {
            increment: creatorAmount
          }
        },
        select: { 
          id: true, 
          credits: true,
          username: true 
        }
      });

      // Registrar transação de créditos para o criador
      await tx.creditTransaction.create({
        data: {
          userId: post.User!.id,
          type: 'post_access_earned',
          amount: creatorAmount,
          description: `Ganhos de post privado de ${user.username}`,
          balance: creator.credits,
        }
      });

      // Adicionar comissão para a plataforma
      await tx.user.update({
        where: { id: platformUserId },
        data: {
          credits: {
            increment: commission
          }
        }
      });

      await tx.creditTransaction.create({
        data: {
          userId: platformUserId,
          type: 'platform_commission',
          amount: commission,
          description: `Comissão de post privado entre ${user.username} e ${post.User?.username}`,
          balance: platformUser.credits + commission,
        }
      });

      // Criar acesso ao post
      const access = await tx.paidPostAccess.create({
        data: {
          userId: userId,
          paidPostId: post.paidPost!.id,
          paymentType: 'credits',
          amount: post.paidPost!.priceCredits,
        }
      });

      return {
        access,
        userCredits: updatedUser.credits,
        creatorCredits: creator.credits,
        commission,
        creatorAmount
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Acesso comprado com sucesso!',
      data: result
    });

  } catch (error) {
    console.error('Erro ao comprar acesso ao post:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
} 