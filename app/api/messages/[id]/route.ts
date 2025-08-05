import prismaClient from "@/lib/prisma"; // A dependência do Prisma no projeto

// Função para obter dados do usuário
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  if (!id) {
    throw new Error("ID não fornecido.");
  }
  const user = await prismaClient.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      image: true
    }
  });
  return new Response(JSON.stringify(user), { status: 200 });
}
