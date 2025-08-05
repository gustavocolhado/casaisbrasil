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
    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: "ID do usuário alvo é obrigatório" }, { status: 400 });
    }

    // Verificar se já existe uma mensagem do usuário alvo para o usuário atual
    const existingMessage = await prismaClient.message.findFirst({
      where: {
        senderId: targetUserId,
        receiverId: session.user.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Se existe mensagem do outro usuário, pode responder
    const canStartConversation = !!existingMessage;
    
    console.log('Verificação de conversa:', {
      userId: session.user.id,
      targetUserId,
      hasExistingMessage: !!existingMessage,
      canStartConversation
    });

    return NextResponse.json({
      canStartConversation,
      hasReceivedMessage: !!existingMessage,
      lastMessageFromTarget: existingMessage ? {
        id: existingMessage.id,
        content: existingMessage.content,
        timestamp: existingMessage.timestamp,
      } : null,
    });
  } catch (error) {
    console.error("Erro ao verificar se pode iniciar conversa:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 