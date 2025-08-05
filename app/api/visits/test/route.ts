import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Testar se o modelo Visit existe
    
    // Verificar se existem visitas
    const totalVisits = await prismaClient.visit.count();
    
    // Verificar visitas do usuário atual
    const userVisits = await prismaClient.visit.count({
      where: {
        visitedId: session.user.id,
      },
    });
    
    // Tentar buscar algumas visitas
    const sampleVisits = await prismaClient.visit.findMany({
      take: 5,
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
      totalVisits,
      userVisits,
      sampleVisits,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Erro no teste:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor", 
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
} 