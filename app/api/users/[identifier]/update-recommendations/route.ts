// app/api/users/[username]/update-recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/users/[username]/update-recommendations
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    // Resolver params com await
    const { username } = await params;

    // Get the logged-in user session (if any)
    const session = await getServerSession(authOptions);
    const loggedInUserId = session?.user?.id;

    // Find the user by username
    const user = await prismaClient.user.findUnique({
      where: { username },
      select: { id: true, recommendationsCount: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // If no logged-in user, skip incrementing recommendations
    if (!loggedInUserId) {
      return NextResponse.json(
        { message: "Nenhuma ação realizada, usuário não está logado" },
        { status: 200 }
      );
    }

    // Prevent self-recommendation
    if (loggedInUserId === user.id) {
      return NextResponse.json(
        { message: "Você não pode recomendar seu próprio perfil" },
        { status: 400 }
      );
    }

    // Check if the logged-in user has already recommended this profile
    const existingRecommendation = await prismaClient.recommendation.findFirst({
      where: {
        recommenderId: loggedInUserId,
        recommendedId: user.id,
      },
    });

    if (existingRecommendation) {
      return NextResponse.json(
        { message: "Usuário já recomendou este perfil" },
        { status: 200 }
      );
    }

    // Increment recommendationsCount and record the recommendation
    await prismaClient.$transaction([
      prismaClient.user.update({
        where: { id: user.id },
        data: { recommendationsCount: { increment: 1 } },
      }),
      prismaClient.recommendation.create({
        data: {
          recommenderId: loggedInUserId,
          recommendedId: user.id,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Recomendação atualizada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar recomendações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}