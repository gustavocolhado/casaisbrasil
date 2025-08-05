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

    const following = await prismaClient.follow.findMany({
      where: { followerId: user.id },
      select: {
        following: {
          select: { id: true, username: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalFollowing = await prismaClient.follow.count({
      where: { followerId: user.id },
    });

    return NextResponse.json({
      following: following.map((f) => f.following),
      total: totalFollowing,
      page,
      limit,
      totalPages: Math.ceil(totalFollowing / limit),
    });
  } catch (error) {
    console.error("Erro ao buscar seguindo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 