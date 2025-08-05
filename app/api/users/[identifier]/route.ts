import { NextResponse } from 'next/server';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    const { identifier } = await params;
    
    console.log('API Users - Identifier recebido:', identifier);

    if (!identifier || typeof identifier !== 'string') {
      console.log('API Users - Identifier inválido:', identifier);
      return NextResponse.json({ message: 'Nome de usuário inválido' }, { status: 400 });
    }

    // Buscar sessão do usuário logado
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Buscar usuário com todos os campos necessários
    const user = await prismaClient.user.findUnique({
      where: { username: identifier },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        banner1: true,
        banner2: true,
        premium: true,
        city: true,
        state: true,
        role: true,
        interests: true,
        fetishes: true,
        objectives: true,
        viewsCount: true,
        followersCount: true,
        recommendationsCount: true
      }
    });

    if (!user) {
      console.log('API Users - Usuário não encontrado:', identifier);
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('API Users - Usuário encontrado:', user);

    // Verificar se o usuário logado está seguindo este usuário
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      try {
        const followRelation = await prismaClient.follow.findFirst({
          where: {
            followerId: currentUserId,
            followingId: user.id,
          },
        });
        isFollowing = !!followRelation;
      } catch (error) {
        console.log('Erro ao verificar follow:', error);
      }
    }

    // Buscar estatísticas do usuário (com tratamento de erro)
    let postsCount = 0;
    let followersCount = 0;
    let followingCount = 0;
    let recommendationsCount = 0;

    try {
      postsCount = await prismaClient.post.count({
        where: { userId: user.id, approved: true, failed: false }
      });
    } catch (error) {
      console.log('Erro ao contar posts:', error);
    }

    try {
      followersCount = await prismaClient.follow.count({
        where: { followingId: user.id }
      });
    } catch (error) {
      console.log('Erro ao contar seguidores:', error);
    }

    try {
      followingCount = await prismaClient.follow.count({
        where: { followerId: user.id }
      });
    } catch (error) {
      console.log('Erro ao contar seguindo:', error);
    }

    try {
      recommendationsCount = await prismaClient.recommendation.count({
        where: { recommendedId: user.id }
      });
    } catch (error) {
      console.log('Erro ao contar recomendações:', error);
    }

    // Formatar interesses
    const interests = user.interests && user.interests.length > 0 
      ? user.interests.join(', ') 
      : 'Não informado';

    // Formatar fetiches
    const fetishes = user.fetishes && user.fetishes.length > 0 
      ? user.fetishes.join(', ') 
      : 'Não informado';

    // Formatar objetivos
    const objectives = user.objectives && user.objectives.length > 0 
      ? user.objectives.join(', ') 
      : 'Não informado';

    // Formatar dados para o frontend
    const profile = {
      id: user.id,
      username: user.username,
      displayName: user.name || user.username,
      avatar: user.image || '',
      bannerImages: [user.banner1 || '', user.banner2 || ''], // Mapeando banners do banco
      stats: {
        views: user.viewsCount.toString(),
        following: followingCount,
        followers: user.followersCount,
        recommendations: user.recommendationsCount
      },
      info: {
        gender: user.role || 'Não informado', // Usando role como gênero
        location: user.city && user.state ? `${user.city}/${user.state}` : 'Não informado',
        distance: '0 km', // Pode ser implementado depois
        preferences: interests, // Usando interests como preferências
        memberSince: 'Membro recente', // Pode ser implementado depois com data real
        status: 'Online agora' // Pode ser implementado depois
      },
      isOnline: true, // Pode ser implementado depois
      isVerified: user.premium || false,
      isFollowing: isFollowing, // Status real de follow
      // Campos adicionais
      interests: interests,
      fetishes: fetishes,
      objectives: objectives,
      city: user.city || 'Não informado',
      state: user.state || 'Não informado'
    };

    console.log('API Users - Retornando perfil real:', profile);
    console.log('API Users - Banner images:', profile.bannerImages);
    return NextResponse.json(profile);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Erro ao buscar usuário:", error);
    
    return NextResponse.json({ 
      message: `Erro interno do servidor: ${errorMessage}` 
    }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params;

  if (!identifier || typeof identifier !== 'string') {
    return NextResponse.json({ message: 'Nome de usuário inválido' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { role } = body;
    if (!role) {
      return NextResponse.json({ message: 'Role é obrigatório' }, { status: 400 });
    }

    const updatedUser = await prismaClient.user.update({
      where: { username: identifier },
      data: { role },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao atualizar role do usuário:', error);
    return NextResponse.json({ message: `Erro ao atualizar role: ${errorMessage}` }, { status: 500 });
  }
}