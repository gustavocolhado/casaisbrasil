import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest, { params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params;
  const session = await getServerSession(authOptions);
  const loggedInUserId = session?.user?.id;

  try {
    const user = await prismaClient.user.findUnique({
      where: { username: identifier },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Incrementar viewsCount sempre que o perfil for visitado
    await prismaClient.user.update({
      where: { id: user.id },
      data: { viewsCount: { increment: 1 } },
    });

    // Registrar a visita apenas se não for o próprio usuário
    if (loggedInUserId && loggedInUserId !== user.id) {
      try {
        await prismaClient.visit.upsert({
          where: {
            visitorId_visitedId: {
              visitorId: loggedInUserId,
              visitedId: user.id,
            },
          },
          update: {
            visitedAt: new Date(),
          },
          create: {
            visitorId: loggedInUserId,
            visitedId: user.id,
          },
        });
      } catch (visitError) {
        console.error("Erro ao registrar visita:", visitError);
        // Não falha a requisição se houver erro ao registrar visita
      }
    }

    revalidatePath(`/${identifier}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao incrementar viewsCount:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}