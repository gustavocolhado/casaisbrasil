import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Teste 1: Busca sem filtros
    const allUsers = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        city: true,
        state: true,
        age: true,
        recommendationsCount: true,
        followersCount: true,
        viewsCount: true,
      }
    });

    // Teste 2: Busca com filtro de role
    const usersWithRole = await prisma.user.findMany({
      where: {
        role: { in: ['homem', 'mulher'] }
      },
      take: 5,
      select: {
        id: true,
        username: true,
        role: true,
      }
    });

    // Teste 3: Busca com filtro de localização
    const usersInSP = await prisma.user.findMany({
      where: {
        OR: [
          { city: { contains: 'São Paulo', mode: 'insensitive' } },
          { state: { contains: 'SP', mode: 'insensitive' } },
        ]
      },
      take: 5,
      select: {
        id: true,
        username: true,
        city: true,
        state: true,
      }
    });

    // Teste 4: Busca com filtro de atividade
    const activeUsers = await prisma.user.findMany({
      where: {
        OR: [
          { recommendationsCount: { gte: 1 } },
          { followersCount: { gte: 5 } }
        ]
      },
      take: 5,
      select: {
        id: true,
        username: true,
        recommendationsCount: true,
        followersCount: true,
      }
    });

    // Verificar valores únicos para role
    const roles = await prisma.user.findMany({
      select: { role: true },
      where: { role: { not: null } },
      distinct: ['role']
    });

    // Verificar valores únicos para city
    const cities = await prisma.user.findMany({
      select: { city: true },
      where: { city: { not: null } },
      distinct: ['city'],
      take: 10
    });

    // Verificar contagem por role
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      where: { role: { not: null } },
      _count: { role: true }
    });

    return NextResponse.json({
      totalUsers: await prisma.user.count(),
      allUsers,
      usersWithRole,
      usersInSP,
      activeUsers,
      availableRoles: roles.map(r => r.role),
      roleCounts: roleCounts.map(r => ({ role: r.role, count: r._count.role })),
      availableCities: cities.map(c => c.city),
      message: 'Testes de busca concluídos'
    });
  } catch (error) {
    console.error('Erro no debug:', error);
    return NextResponse.json({ 
      error: 'Erro no debug',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 