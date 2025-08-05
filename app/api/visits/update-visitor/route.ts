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
    const { visitorId } = await request.json();

    if (!visitorId) {
      return NextResponse.json({ error: "ID do visitante é obrigatório" }, { status: 400 });
    }

    // Buscar dados completos do visitante
    const visitor = await prismaClient.user.findUnique({
      where: { id: visitorId },
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
    });

    if (!visitor) {
      return NextResponse.json({ error: "Visitante não encontrado" }, { status: 404 });
    }

    // Se o usuário não tem nome, usar o username como nome
    if (!visitor.name) {
      await prismaClient.user.update({
        where: { id: visitorId },
        data: {
          name: visitor.username,
        },
      });
      
      visitor.name = visitor.username;
    }

    return NextResponse.json({ 
      success: true,
      message: "Dados do visitante atualizados",
      visitor 
    });
  } catch (error) {
    console.error("Erro ao atualizar dados do visitante:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 