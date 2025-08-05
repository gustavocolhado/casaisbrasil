import prismaClient from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const { identifier } = await params;

  try {
    const user = await prismaClient.user.findUnique({
      where: { username: identifier },
      select: { 
        id: true,
        viewsCount: true
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Por enquanto, retornamos apenas o total de views
    // No futuro, pode ser implementado um sistema para rastrear quem visualizou
    return NextResponse.json({
      views: [],
      total: user.viewsCount,
      page: 1,
      limit: 12,
      totalPages: 0,
    });
  } catch (error) {
    console.error("Erro ao buscar views:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 