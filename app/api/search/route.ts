import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface SearchRequest {
  userTypes: string[];
  lookingFor: string;
  distance: string;
  location: string;
  profileStatus: string;
  interests: string[];
  fetishes: string[];
  objectives: string[];
  ageRange: { min: number; max: number };
  lastAccess: string;
  sortBy: string;
}

interface UserSearchResult {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  premium: boolean;
  image: string | null;
  role: string | null;
  interests: string[];
  fetishes: string[];
  objectives: string[];
  age: number | null;
  bio: string | null;
  followersCount: number;
  viewsCount: number;
  recommendationsCount: number;
}

export async function GET(req: Request) {
  try {
    // Verificar conexão com o banco
    try {
      await prisma.$connect();
    } catch (connectionError) {
      console.error('Erro de conexão com o banco (GET):', connectionError);
      return NextResponse.json({ 
        message: 'Erro de conexão com o banco de dados',
        users: [],
        hasMore: false,
        totalCount: 0
      }, { status: 503 });
    }

    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10));
    const skip = (page - 1) * limit;

    let whereClause: Prisma.UserWhereInput = {};

    if (query && query.length >= 2) {
      whereClause.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        city: true,
        state: true,
        premium: true,
        image: true,
        role: true,
        interests: true,
        fetishes: true,
        objectives: true,
        age: true,
        bio: true,
        followersCount: true,
        viewsCount: true,
        recommendationsCount: true,
      },
      skip,
      take: limit,
      orderBy: [
        { premium: 'desc' },
        { recommendationsCount: 'desc' },
        { id: 'asc' },
      ],
    });

    // Tratamento de erro para count
    let totalCount = 0;
    let hasMore = false;
    
    try {
      totalCount = await prisma.user.count({ where: whereClause });
      hasMore = skip + users.length < totalCount;
    } catch (countError) {
      console.error('Erro ao contar usuários (GET):', countError);
      // Fallback: estimar hasMore baseado no número de usuários retornados
      hasMore = users.length === limit;
      totalCount = skip + users.length + (hasMore ? 1 : 0);
    }

    return NextResponse.json({ 
      users, 
      hasMore,
      totalCount
    }, { status: 200 });
  } catch (error) {
    console.error('API error (POST):', error);
    
    // Verificar se é um erro específico do Prisma
    if (error instanceof Error) {
      if (error.message.includes('PrismaClientUnknownRequestError') || 
          error.message.includes('Response from the Engine was empty')) {
        return NextResponse.json({ 
          message: 'Erro de conexão com o banco de dados',
          users: [],
          hasMore: false,
          totalCount: 0
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ 
      message: 'Internal server error',
      users: [],
      hasMore: false,
      totalCount: 0
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Erro ao desconectar Prisma:', disconnectError);
    }
  }
}

export async function POST(req: Request) {
  try {
    // Verificar conexão com o banco
    try {
      await prisma.$connect();
    } catch (connectionError) {
      console.error('Erro de conexão com o banco:', connectionError);
      return NextResponse.json({ 
        message: 'Erro de conexão com o banco de dados',
        users: [],
        hasMore: false,
        totalCount: 0
      }, { status: 503 });
    }

    const url = new URL(req.url);
    const body = await req.json();

    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10));
    const skip = (page - 1) * limit;
    
    console.log('Parâmetros de paginação POST:', { page, limit, skip });

    const { 
      userTypes, 
      lookingFor, 
      distance, 
      location, 
      profileStatus, 
      interests, 
      fetishes, 
      objectives,
      ageRange,
      lastAccess,
      sortBy 
    } = body as SearchRequest;

    let whereClause: Prisma.UserWhereInput = {};

    // Aplicar filtros apenas se algum estiver preenchido
    const hasFilters = 
      (userTypes && userTypes.length > 0 && userTypes.length < 7) || // Não aplicar se todos os tipos estiverem selecionados (7 opções)
      (lookingFor && lookingFor.trim().length > 0 && lookingFor !== 'Todos') ||
      (location && location.trim().length > 0 && location !== 'São Paulo/SP') ||
      (interests && interests.length > 0) ||
      (fetishes && fetishes.length > 0) ||
      (objectives && objectives.length > 0) ||
      (ageRange && (ageRange.min !== 18 || ageRange.max !== 80)) ||
      (lastAccess && lastAccess !== 'Nos últimos 30 dias') ||
      (distance && distance !== 'até 50km');

    console.log('Verificação de filtros:', {
      userTypes: userTypes?.length,
      lookingFor: lookingFor?.trim().length,
      location: location?.trim().length,
      interests: interests?.length,
      fetishes: fetishes?.length,
      objectives: objectives?.length,
      ageRange: ageRange,
      lastAccess,
      distance,
      sortBy,
      hasFilters
    });

    if (hasFilters) {
      // Filtro por tipo de usuário (role) - se selecionou todos, não aplicar filtro
      if (userTypes && userTypes.length > 0 && userTypes.length < 7) {
        whereClause.role = { in: userTypes };
      }

      // Filtro por busca por nome, username, email ou bio
      if (lookingFor && lookingFor.trim().length > 0 && lookingFor !== 'Todos') {
        whereClause.OR = [
          { username: { contains: lookingFor.trim(), mode: 'insensitive' } },
          { name: { contains: lookingFor.trim(), mode: 'insensitive' } },
          { email: { contains: lookingFor.trim(), mode: 'insensitive' } },
          { bio: { contains: lookingFor.trim(), mode: 'insensitive' } },
        ];
      }

      // Filtro por localização (city e state)
      if (location && location.trim().length > 0 && location !== 'São Paulo/SP') {
        const locationParts = location.split('/').map(part => part.trim());
        if (locationParts.length >= 2) {
          const city = locationParts[0];
          const state = locationParts[1];
          
          whereClause.OR = [
            { city: { contains: city, mode: 'insensitive' } },
            { state: { contains: state, mode: 'insensitive' } },
          ];
        } else {
          whereClause.OR = [
            { city: { contains: location.trim(), mode: 'insensitive' } },
            { state: { contains: location.trim(), mode: 'insensitive' } },
          ];
        }
      }

      // Filtro por interesses
      if (interests && interests.length > 0) {
        whereClause.interests = { hasSome: interests };
      }

      // Filtro por fetiches
      if (fetishes && fetishes.length > 0) {
        whereClause.fetishes = { hasSome: fetishes };
      }

      // Filtro por objetivos
      if (objectives && objectives.length > 0) {
        whereClause.objectives = { hasSome: objectives };
      }

      // Filtro por faixa etária - só aplicar se for diferente do padrão
      if (ageRange && (ageRange.min !== 18 || ageRange.max !== 80)) {
        whereClause.age = {};
        if (ageRange.min !== undefined && ageRange.min > 0) {
          whereClause.age.gte = ageRange.min;
        }
        if (ageRange.max !== undefined && ageRange.max < 100) {
          whereClause.age.lte = ageRange.max;
        }
      }

      // Filtro por último acesso (baseado em recomendações e visualizações)
      if (lastAccess && lastAccess !== 'Nos últimos 30 dias') {
        if (lastAccess === 'Nos últimos 7 dias') {
          whereClause.OR = [
            { recommendationsCount: { gte: 10 } },
            { viewsCount: { gte: 50 } }
          ];
        } else if (lastAccess === 'Nos últimos 3 meses') {
          whereClause.OR = [
            { recommendationsCount: { gte: 1 } },
            { viewsCount: { gte: 10 } }
          ];
        } else if (lastAccess === 'Nos últimos 6 meses') {
          whereClause.OR = [
            { recommendationsCount: { gte: 0 } },
            { viewsCount: { gte: 1 } }
          ];
        }
      }

      // Filtro por distância (simulado - seria baseado em geolocalização real)
      if (distance && distance !== 'até 50km') {
        // Por enquanto, vamos filtrar por usuários com mais atividade (mais próximos)
        if (distance === 'até 10km') {
          whereClause.OR = [
            { recommendationsCount: { gte: 20 } },
            { followersCount: { gte: 50 } }
          ];
        } else if (distance === 'até 25km') {
          whereClause.OR = [
            { recommendationsCount: { gte: 10 } },
            { followersCount: { gte: 25 } }
          ];
        } else if (distance === 'até 100km') {
          whereClause.OR = [
            { recommendationsCount: { gte: 1 } },
            { followersCount: { gte: 5 } }
          ];
        }
      }

      // Filtro por status do perfil (recomendados) - só aplicar se profileStatus for explicitamente 'recommended'
      if (profileStatus === 'recommended') {
        whereClause.recommendationsCount = { gt: 0 };
      }
    } else {
      // Se não há filtros, buscar todos os usuários
      console.log('Nenhum filtro aplicado - buscando todos os usuários');
      // Não aplicar nenhum filtro, buscar todos os usuários
    }

    // Determinar ordenação baseada no modelo User
    let orderBy: Prisma.UserOrderByWithRelationInput[] = [];
    
    if (sortBy === 'Recomendados') {
      orderBy = [
        { premium: 'desc' },
        { recommendationsCount: 'desc' },
        { followersCount: 'desc' },
        { id: 'asc' },
      ];
    } else if (sortBy === 'Mais recentes') {
      orderBy = [
        { id: 'desc' },
      ];
    } else if (sortBy === 'Mais populares') {
      orderBy = [
        { followersCount: 'desc' },
        { viewsCount: 'desc' },
        { recommendationsCount: 'desc' },
        { id: 'asc' },
      ];
    } else {
      // Padrão
      orderBy = [
        { premium: 'desc' },
        { recommendationsCount: 'desc' },
        { followersCount: 'desc' },
        { id: 'asc' },
      ];
    }

    // Debug: Log dos filtros aplicados
    console.log('Filtros aplicados:', {
      hasFilters,
      userTypes,
      lookingFor,
      location,
      ageRange,
      lastAccess,
      distance,
      sortBy,
      whereClause
    });

    console.log('Executando query Prisma:', { skip, take: limit, whereClause: Object.keys(whereClause) });
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        city: true,
        state: true,
        premium: true,
        image: true,
        role: true,
        interests: true,
        fetishes: true,
        objectives: true,
        age: true,
        bio: true,
        followersCount: true,
        viewsCount: true,
        recommendationsCount: true,
      },
      skip,
      take: limit,
      orderBy,
    });

    // Tratamento de erro para count
    let totalCount = 0;
    let hasMore = false;
    
    try {
      totalCount = await prisma.user.count({ where: whereClause });
      hasMore = skip + users.length < totalCount;
    } catch (countError) {
      console.error('Erro ao contar usuários:', countError);
      // Fallback: estimar hasMore baseado no número de usuários retornados
      hasMore = users.length === limit;
      totalCount = skip + users.length + (hasMore ? 1 : 0);
    }

    // Debug: Log dos resultados
    console.log('Resultados:', {
      usersFound: users.length,
      totalCount,
      hasMore,
      skip,
      limit
    });

    return NextResponse.json({ 
      users, 
      hasMore,
      totalCount
    }, { status: 200 });
  } catch (error) {
    console.error('API error (GET):', error);
    
    // Verificar se é um erro específico do Prisma
    if (error instanceof Error) {
      if (error.message.includes('PrismaClientUnknownRequestError') || 
          error.message.includes('Response from the Engine was empty')) {
        return NextResponse.json({ 
          message: 'Erro de conexão com o banco de dados',
          users: [],
          hasMore: false,
          totalCount: 0
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ 
      message: 'Internal server error',
      users: [],
      hasMore: false,
      totalCount: 0
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Erro ao desconectar Prisma (GET):', disconnectError);
    }
  }
}