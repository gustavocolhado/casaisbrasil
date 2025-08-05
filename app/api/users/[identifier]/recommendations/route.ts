import prismaClient from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const { identifier } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  try {
    const user = await prismaClient.user.findUnique({
      where: { username: identifier },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const recommendations = await prismaClient.recommendation.findMany({
      where: { recommendedId: user.id },
      select: {
        id: true,
        createdAt: true,
        recommender: {
          select: { id: true, username: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalRecommendations = await prismaClient.recommendation.count({
      where: { recommendedId: user.id },
    });

    return NextResponse.json({
      recommendations,
      total: totalRecommendations,
      page,
      limit,
      totalPages: Math.ceil(totalRecommendations / limit),
    });
  } catch (error) {
    console.error("Erro ao buscar recomendações:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 