import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';

export async function GET() {
  try {
    const rooms = await prismaClient.chatRoom.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar salas de chat:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar salas de chat' },
      { status: 500 }
    );
  }
}