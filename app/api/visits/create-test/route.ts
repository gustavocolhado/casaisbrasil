import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Buscar outro usuário para criar uma visita de teste
    const otherUser = await prismaClient.user.findFirst({
      where: {
        id: { not: session.user.id },
      },
      select: {
        id: true,
        name: true,
        username: true,
      },
    });

    if (!otherUser) {
      return NextResponse.json({ error: "Não há outros usuários para criar visita de teste" }, { status: 404 });
    }

    // Criar uma visita de teste
    const testVisit = await prismaClient.visit.upsert({
      where: {
        visitorId_visitedId: {
          visitorId: session.user.id,
          visitedId: otherUser.id,
        },
      },
      update: {
        visitedAt: new Date(),
      },
      create: {
        visitorId: session.user.id,
        visitedId: otherUser.id,
      },
      include: {
        visitor: {
          select: {
            id: true,
            name: true,
            username: true,
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

    return NextResponse.json({
      success: true,
      message: "Visita de teste criada com sucesso",
      visit: testVisit,
    });
  } catch (error) {
    console.error("Erro ao criar visita de teste:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor", 
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
} 