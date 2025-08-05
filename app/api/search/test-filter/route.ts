import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userTypes, location, ageRange } = body;

    let whereClause: any = {};

    // Teste 1: Filtro por tipo de usuário
    if (userTypes && userTypes.length > 0) {
      whereClause.role = { in: userTypes };
      console.log('Aplicando filtro por role:', userTypes);
    }

    // Teste 2: Filtro por localização
    if (location && location.trim().length > 0) {
      whereClause.OR = [
        { city: { contains: location.trim(), mode: 'insensitive' } },
        { state: { contains: location.trim(), mode: 'insensitive' } },
      ];
      console.log('Aplicando filtro por localização:', location);
    }

    // Teste 3: Filtro por idade
    if (ageRange && (ageRange.min !== 18 || ageRange.max !== 80)) {
      whereClause.age = {};
      if (ageRange.min !== undefined && ageRange.min > 0) {
        whereClause.age.gte = ageRange.min;
      }
      if (ageRange.max !== undefined && ageRange.max < 100) {
        whereClause.age.lte = ageRange.max;
      }
      console.log('Aplicando filtro por idade:', ageRange);
    }

    console.log('Where clause final:', whereClause);

    const users = await prisma.user.findMany({
      where: whereClause,
      take: 10,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        city: true,
        state: true,
        age: true,
      }
    });

    const totalCount = await prisma.user.count({ where: whereClause });

    return NextResponse.json({
      totalCount,
      usersFound: users.length,
      users: users,
      whereClause
    });
  } catch (error) {
    console.error('Erro no teste de filtro:', error);
    return NextResponse.json({ 
      error: 'Erro no teste de filtro',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 