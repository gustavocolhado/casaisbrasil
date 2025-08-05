import { NextResponse } from "next/server";
import prismaClient from "@/lib/prisma"; // Certifique-se de que a importação do prismaClient esteja correta
import { getServerSession } from "next-auth";

export async function GET() {
  // Pegue a sessão do usuário logado (ajuste conforme sua implementação do NextAuth)
  const session = await getServerSession();

  // Se o usuário não estiver logado, retorne uma resposta de erro
  if (!session || !session.user?.email) {
    return NextResponse.json({ hasAccess: false });
  }

  // Verifique o acesso do usuário no banco de dados
  const user = await prismaClient.user.findUnique({
    where: { email: session.user.email },
    select: { access: true },
  });

  // Retorne o status de acesso do usuário
  const hasAccess = user?.access === 1;
  return NextResponse.json({ hasAccess });
}
