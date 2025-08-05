import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { reporterId, reportedId, reason } = await request.json();
    if (!reporterId || !reportedId || !reason) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    await prisma.report.create({
      data: { reporterId, reportedId, reason, status: 'pending' }
    });
    await prisma.user.update({
      where: { id: reportedId },
      data: { reportsReceivedCount: { increment: 1 } }
    });
    return NextResponse.json({ success: 'Usuário denunciado com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao denunciar usuário.' }, { status: 500 });
  }
} 