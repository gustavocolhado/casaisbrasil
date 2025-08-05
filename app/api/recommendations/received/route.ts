import prismaClient from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Buscar usuários que recomendaram o usuário atual
    const recommendations = await prismaClient.recommendation.findMany({
      where: { recommendedId: session.user.id },
      select: {
        id: true,
        createdAt: true,
        recommender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            age: true,
            city: true,
            state: true,
            role: true,
            bio: true,
            premium: true,
            _count: {
              select: {
                followers: true,
                posts: true
              }
            }
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalRecommendations = await prismaClient.recommendation.count({
      where: { recommendedId: session.user.id },
    });

    // Formatar os dados dos usuários
    const formattedUsers = recommendations.map(rec => ({
      id: rec.recommender.id,
      username: rec.recommender.username,
      name: rec.recommender.name,
      image: rec.recommender.image,
      age: rec.recommender.age,
      city: rec.recommender.city,
      state: rec.recommender.state,
      role: rec.recommender.role,
      bio: rec.recommender.bio,
      premium: rec.recommender.premium,
      followersCount: rec.recommender._count.followers,
      postsCount: rec.recommender._count.posts,
      recommendedAt: rec.createdAt
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: totalRecommendations,
      page,
      limit,
      totalPages: Math.ceil(totalRecommendations / limit),
    });
  } catch (error) {
    console.error("Erro ao buscar usuários que recomendaram:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 