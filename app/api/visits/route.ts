import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Buscar visitas recebidas pelo usuário logado
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Primeiro, vamos verificar se existem visitas
    const totalVisits = await prismaClient.visit.count({
      where: {
        visitedId: session.user.id,
      },
    });

    const visits = await prismaClient.visit.findMany({
      where: {
        visitedId: session.user.id,
      },
      include: {
        visitor: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            age: true,
            city: true,
            state: true,
            lastSeen: true,
            bio: true,
            email: true,
          },
        },
      },
      orderBy: {
        visitedAt: 'desc',
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      visits,
      pagination: {
        page,
        limit,
        total: totalVisits,
        totalPages: Math.ceil(totalVisits / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar visitas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST - Registrar uma nova visita
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { visitedId } = await request.json();

    if (!visitedId) {
      return NextResponse.json({ error: "ID do usuário visitado é obrigatório" }, { status: 400 });
    }

    // Não permitir que o usuário visite seu próprio perfil
    if (session.user.id === visitedId) {
      return NextResponse.json({ error: "Não é possível visitar seu próprio perfil" }, { status: 400 });
    }

    // Verificar se o usuário visitado existe
    const visitedUser = await prismaClient.user.findUnique({
      where: { id: visitedId },
      select: { id: true },
    });

    if (!visitedUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Criar ou atualizar a visita (usando upsert para evitar duplicatas)
    const visit = await prismaClient.visit.upsert({
      where: {
        visitorId_visitedId: {
          visitorId: session.user.id,
          visitedId: visitedId,
        },
      },
      update: {
        visitedAt: new Date(),
      },
      create: {
        visitorId: session.user.id,
        visitedId: visitedId,
      },
      include: {
        visitor: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        visited: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ visit });
  } catch (error) {
    console.error("Erro ao registrar visita:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 