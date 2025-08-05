import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhuma imagem enviada" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const urls = await Promise.all(
      files.map(async (file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error("Apenas imagens são permitidas");
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Arquivo muito grande (máximo 5MB)");
        }
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);
        const arrayBuffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(arrayBuffer));
        return `/uploads/${fileName}`;
      })
    );

    return NextResponse.json({ urls }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json({ error: error.message || "Erro ao fazer upload das imagens" }, { status: 500 });
  }
}