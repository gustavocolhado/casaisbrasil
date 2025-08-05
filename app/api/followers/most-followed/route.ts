import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';

// Função de embaralhamento de Fisher-Yates
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Troca de lugar
  }
  return array;
};

export async function GET() {
  try {
    // Recupera todos os perfis (em MongoDB, se os perfis são numerosos, pode ser necessário ajustar o limite ou paginar)
    const profiles = await prismaClient.user.findMany({
      take: 200, // Pegue um número suficientemente grande para embaralhar
      select: {
        id: true,
        username: true,
        image: true,
        followersCount: true,
      },
    });

    // Embaralha a lista de perfis aleatoriamente
    const shuffledProfiles = shuffleArray(profiles).slice(0, 50); // Pega os primeiros 50 perfis aleatórios após o embaralhamento

    return NextResponse.json(shuffledProfiles, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar perfis aleatórios:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfis aleatórios.' }, { status: 500 });
  }
}
