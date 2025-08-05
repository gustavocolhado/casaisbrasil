import { NextResponse } from "next/server";
import prismaClient  from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");

  if (!userId) {
    return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
  }

  try {
    const posts = await prismaClient.post.findMany({
      where: { userId },
      // Não filtrar por approved para mostrar todos os posts do usuário
      orderBy: { created_at: "desc" },
      include: {
        User: {
          select: { username: true, image: true },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
                city: true,
                state: true,
                role: true,
                access: true,
              },
            },
          },
        },
        visitorComments: {
          select: {
            id: true,
            username: true,
            content: true,
            createdAt: true,
          },
        },
        paidPost: {
          select: {
            id: true,
            priceCredits: true,
            description: true,
            isActive: true,
          }
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    });



    return NextResponse.json(posts);
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json({ error: "Falha ao buscar posts" }, { status: 500 });
  }
}