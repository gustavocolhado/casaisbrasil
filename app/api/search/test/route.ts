import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Contar total de usuários
    const totalUsers = await prisma.user.count();
    
    // Buscar alguns usuários de exemplo
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        city: true,
        state: true,
        age: true,
        interests: true,
        fetishes: true,
        objectives: true,
        followersCount: true,
        viewsCount: true,
        recommendationsCount: true,
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

    return NextResponse.json({
      totalUsers,
      sampleUsers,
      availableRoles: roles.map(r => r.role),
      availableCities: cities.map(c => c.city),
      message: 'Dados do banco verificados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao verificar dados:', error);
    return NextResponse.json({ 
      error: 'Erro ao verificar dados',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 