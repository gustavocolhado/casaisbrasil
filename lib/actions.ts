// app/lib/actions.ts
'use server';

import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export async function deleteAccount(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== userId) {
    throw new Error("Não autorizado");
  }

  try {
    console.log(`Iniciando exclusão da conta para userId: ${userId}`);

    // Excluir posts
    await prismaClient.post.deleteMany({ where: { userId } });
    console.log("Posts excluídos");

    // Excluir comentários
    await prismaClient.comment.deleteMany({ where: { userId } });
    console.log("Comentários excluídos");

    // Excluir mensagens no mural
    await prismaClient.wallMessage.deleteMany({
      where: {
        OR: [{ authorId: userId }, { profileId: userId }],
      },
    });
    console.log("Mensagens no mural excluídas");

    // Excluir categorias
    await prismaClient.category.deleteMany({ where: { userId } });
    console.log("Categorias excluídas");

    // Excluir contas de autenticação
    await prismaClient.account.deleteMany({ where: { userId } });
    console.log("Contas de autenticação excluídas");

    // Excluir sessões
    await prismaClient.session.deleteMany({ where: { userId } });
    console.log("Sessões excluídas");

    // Excluir follows
    await prismaClient.follow.deleteMany({
      where: {
        OR: [{ followerId: userId }, { followingId: userId }],
      },
    });
    console.log("Follows excluídos");

    // Excluir recomendações
    await prismaClient.recommendation.deleteMany({
      where: {
        OR: [{ recommenderId: userId }, { recommendedId: userId }],
      },
    });
    console.log("Recomendações excluídas");

    // Excluir bloqueios
    await prismaClient.block.deleteMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }],
      },
    });
    console.log("Bloqueios excluídos");

    // Excluir denúncias
    await prismaClient.report.deleteMany({
      where: {
        OR: [{ reporterId: userId }, { reportedId: userId }],
      },
    });
    console.log("Denúncias excluídas");

    // Excluir mensagens privadas
    await prismaClient.message.deleteMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });
    console.log("Mensagens privadas excluídas");

    // Excluir mensagens de chat
    await prismaClient.chatMessage.deleteMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });
    console.log("Mensagens de chat excluídas");

    // Excluir participações em salas de chat
    await prismaClient.chatParticipant.deleteMany({ where: { userId } });
    console.log("Participações em salas de chat excluídas");

    // Excluir pagamentos
    await prismaClient.payment.deleteMany({ where: { userId } });
    console.log("Pagamentos excluídos");

    // Excluir afiliados
    await prismaClient.affiliate.deleteMany({
      where: {
        OR: [{ userId }, { affiliateId: userId }],
      },
    });
    console.log("Afiliados excluídos");

    // Excluir pedidos de saque
    await prismaClient.withdrawalRequest.deleteMany({ where: { affiliateId: userId } });
    console.log("Pedidos de saque excluídos");

    // Excluir sessões de pagamento
    await prismaClient.paymentSession.deleteMany({ where: { userId } });
    console.log("Sessões de pagamento excluídas");

    // Excluir tokens de verificação
    await prismaClient.verificationToken.deleteMany({ where: { userId } });
    console.log("Tokens de verificação excluídos");

    // Excluir limites de atividade
    await prismaClient.userActivityLimit.deleteMany({ where: { userId } });
    console.log("Limites de atividade excluídos");

    // Excluir o usuário
    await prismaClient.user.delete({ where: { id: userId } });
    console.log("Usuário excluído");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Erro do Prisma:", error.message, error.code, error.meta);
      throw new Error(`Falha ao excluir a conta: ${error.message}`);
    }
    console.error("Erro ao excluir conta:", error);
    throw new Error("Falha ao excluir a conta. Tente novamente.");
  }

  // Redirecionar para logout fora do try-catch
  redirect("/api/auth/signout");
}