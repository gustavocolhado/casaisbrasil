import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismaClient from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Contar quantos usuários o usuário autenticado segue (seguindo)
    const followingCount = await prismaClient.follow.count({
      where: { followerId: userId },
    });

    // Contar quantos usuários seguem o usuário autenticado (seguidores)
    const followersCount = await prismaClient.follow.count({
      where: { followingId: userId },
    });

    return NextResponse.json({
      followingCount,
      followersCount,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}