import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';

export async function GET(req: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  const { userId } = params;

  try {
    const followingUsers = await prismaClient.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    return NextResponse.json(followingUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar seguidores' }, { status: 500 });
  }
}
