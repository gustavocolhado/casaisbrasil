// app/api/chat/messages/[id]/route.ts
import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  // Verificar se o ID da sala de chat foi fornecido
  if (!id) {
    return NextResponse.json(
      { error: 'ID da sala de chat não fornecido' },
      { status: 400 }
    );
  }

  try {
    // Buscar as mensagens da sala de chat
    const messages = await prismaClient.chatMessage.findMany({
      where: {
        roomId: id, // Filtrar mensagens pelo ID da sala
      },
      include: {
        sender: true, // Incluir informações do remetente
      },
      orderBy: {
        timestamp: 'asc', // Ordenar mensagens por data (mais antigas primeiro)
      },
    });

    // Retornar as mensagens
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mensagens' },
      { status: 500 }
    );
  }
}