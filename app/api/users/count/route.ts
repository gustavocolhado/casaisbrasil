import prismaClient from "@/lib/prisma"; // Supondo que você tenha configurado o prismaClient
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await prismaClient.user.count(); // Contando o número de usuários
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Erro ao contar usuários:", error);
    return NextResponse.json({ count: null });
  }
}
