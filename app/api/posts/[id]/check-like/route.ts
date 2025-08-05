import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ isLiked: false });
    }

    const userId = session.user.id;

    // Verifica se o usuário já curtiu o post
    const existingLike = await prismaClient.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: userId
        }
      }
    });

    return NextResponse.json({ 
      isLiked: !!existingLike
    });
  } catch (error) {
    console.error('Erro ao verificar like:', error);
    return NextResponse.json({ isLiked: false });
  }
} 