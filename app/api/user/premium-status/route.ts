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
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        premium: true,
      },
    });

    if (!user) {
      console.log('Usuário não encontrado na verificação premium:', session.user.id)
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    console.log('Status premium do usuário:', user.id, 'Premium:', user.premium)
    return NextResponse.json({
      isPremium: user.premium,
      userId: user.id,
    });
  } catch (error) {
    console.error("Erro ao verificar status premium:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 