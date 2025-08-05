import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    // Validar se o nome da sala foi fornecido
    if (!name) {
      return NextResponse.json({ error: 'Nome da sala é obrigatório' }, { status: 400 });
    }

    // Criar o ChatRoom no banco de dados
    const newChatRoom = await prismaClient.chatRoom.create({
      data: {
        name,
        description,
      },
    });

    // Retornar o chatRoom criado
    return NextResponse.json({ chatRoom: newChatRoom }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar a sala de chat:', error);
    return NextResponse.json({ error: 'Erro ao criar a sala de chat' }, { status: 500 });
  }
}
