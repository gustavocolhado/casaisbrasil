import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';



// Função para seguir (POST)
export async function POST(request: Request) {
  try {
    const { followerId, followingId } = await request.json();

    // Verifica se já existe um relacionamento de seguimento
    const existingFollow = await prismaClient.follow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Você já está seguindo este usuário.' }, { status: 400 });
    }

    // Lógica para adicionar o seguimento no banco de dados
    await prismaClient.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Atualiza a contagem de seguidores do usuário seguido
    await prismaClient.user.update({
      where: { id: followingId },
      data: {
        followersCount: {
          increment: 1, // Incrementa o contador de seguidores
        },
      },
    });

    // Atualiza a contagem de "seguindo" do usuário que está seguindo
    await prismaClient.user.update({
      where: { id: followerId },
      data: {
        followersCount: {
          increment: 1, // Incrementa o contador de seguindo
        },
      },
    });

    // Notificação será criada diretamente pelo servidor socket quando o cliente emitir o evento
    // Não precisamos fazer chamada HTTP aqui

    return NextResponse.json({ message: 'Seguindo com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao seguir:', error);
    return NextResponse.json({ error: 'Erro ao seguir usuário.' }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const { followerId, followingId } = await request.json();

    // Verifica se o relacionamento de seguimento existe antes de tentar deletar
    const existingFollow = await prismaClient.follow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    if (!existingFollow) {
      return NextResponse.json({ error: 'Você não está seguindo este usuário.' }, { status: 400 });
    }

    // Lógica para remover o seguimento no banco de dados
    await prismaClient.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });

    // Atualiza a contagem de seguidores do usuário seguido
    await prismaClient.user.update({
      where: { id: followingId },
      data: {
        followersCount: {
          decrement: 1, // Decrementa o contador de seguidores
        },
      },
    });

    // Atualiza a contagem de "seguindo" do usuário que está deixando de seguir
    await prismaClient.user.update({
      where: { id: followerId },
      data: {
        followersCount: {
          decrement: 1, // Decrementa o contador de seguindo
        },
      },
    });

    return NextResponse.json({ message: 'Deixou de seguir com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao deixar de seguir:', error);
    return NextResponse.json({ error: 'Erro ao deixar de seguir.' }, { status: 500 });
  }
}