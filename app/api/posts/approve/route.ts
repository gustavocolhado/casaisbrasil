import prismaClient from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'ID do post é obrigatório.' }, { status: 400 });
    }

    // Atualiza o campo approved para true
    await prismaClient.post.update({
      where: { id: postId },
      data: { approved: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao aprovar o post:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
