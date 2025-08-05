import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismaClient from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é administrador
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: { access: true }
    });

    if (adminUser?.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { userId, action, amount, reason } = await request.json();

    if (!userId || !action || !amount || !reason) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Quantidade deve ser maior que zero' }, { status: 400 });
    }

    // Buscar o usuário alvo
    const targetUser = await (prismaClient as any).user.findUnique({
      where: { id: userId },
      select: { credits: true, name: true, username: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    let newBalance: number;
    let transactionType: string;
    let transactionAmount: number;

    switch (action) {
      case 'add':
        newBalance = targetUser.credits + amount;
        transactionType = 'ADMIN_ADD';
        transactionAmount = amount;
        break;
      case 'subtract':
        newBalance = Math.max(0, targetUser.credits - amount);
        transactionType = 'ADMIN_SUBTRACT';
        transactionAmount = -amount;
        break;
      case 'set':
        newBalance = amount;
        transactionType = 'ADMIN_SET';
        transactionAmount = amount - targetUser.credits;
        break;
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    // Atualizar créditos do usuário
    await (prismaClient as any).user.update({
      where: { id: userId },
      data: { credits: newBalance }
    });

    // Registrar a transação
    await (prismaClient as any).creditTransaction.create({
      data: {
        userId,
        type: transactionType,
        amount: transactionAmount,
        balance: newBalance,
        description: `Admin: ${reason}`,
      }
    });

    return NextResponse.json({
      success: true,
      newBalance,
      message: 'Créditos atualizados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao gerenciar créditos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 