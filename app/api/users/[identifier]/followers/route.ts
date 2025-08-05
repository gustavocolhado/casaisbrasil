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

    const followers = await prismaClient.follow.findMany({
      where: { followingId: user.id },
      select: {
        follower: {
          select: { id: true, username: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalFollowers = await prismaClient.follow.count({
      where: { followingId: user.id },
    });

    return NextResponse.json({
      followers: followers.map((f) => f.follower),
      total: totalFollowers,
      page,
      limit,
      totalPages: Math.ceil(totalFollowers / limit),
    });
  } catch (error) {
    console.error("Erro ao buscar seguidores:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}