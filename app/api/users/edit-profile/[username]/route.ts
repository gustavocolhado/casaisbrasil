import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "bson";
import { Prisma } from "@prisma/client";

// Interface para a resposta do endpoint de upload
interface UploadResponse {
  mediaUrl?: string;
  error?: string;
}

// Função para normalizar o username
function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/\s+/g, "") // Remove espaços
    .replace(/[^a-z0-9._-]/g, ""); // Remove caracteres especiais
}

// Configuração de CORS
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params; // Corrigido: aguardar params
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Verificação de autenticação
  if (!session || !userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (session.user.username !== username) {
    return NextResponse.json({ error: "Você não tem permissão para editar este perfil" }, { status: 403 });
  }

  const formData = await req.formData();
  const newUsername = formData.get("username")?.toString();
  const name = formData.get("name")?.toString();
  const bio = formData.get("bio")?.toString();
  const age = formData.get("age")?.toString();
  const city = formData.get("city")?.toString();
  const state = formData.get("state")?.toString();
  const instagram = formData.get("instagram")?.toString();
  const twitter = formData.get("twitter")?.toString();
  const privacy = formData.get("privacy")?.toString();
  const sexlog = formData.get("sexlog")?.toString();
  const buupe = formData.get("buupe")?.toString();
  const onlyfans = formData.get("onlyfans")?.toString();
  const role = formData.get("role")?.toString();
  const interests = formData.getAll("interests") as string[];
  const objectives = formData.getAll("objectives") as string[];
  const fetishes = formData.getAll("fetishes") as string[];
  const image = formData.get("image") as File | null;
  const banner1 = formData.get("banner1") as File | null;
  const banner2 = formData.get("banner2") as File | null;

  let imageUrl: string | undefined;
  let banner1Url: string | undefined;
  let banner2Url: string | undefined;

  // Processamento da imagem, se existir
  if (image && image.size > 0) {
    try {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          { error: "Apenas imagens (jpg, jpeg, png, gif) são permitidas" },
          { status: 400 }
        );
      }

      const arrayBuffer = await image.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: image.type });
      const form = new FormData();
      form.append("media", blob, `${new ObjectId().toHexString()}-${image.name}`);

      const expressUploadUrl = "https://up.confissoesdecorno.com/upload";
      const response = await fetch(expressUploadUrl, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        console.error("Erro ao enviar arquivo para o servidor Express:", response.statusText);
        return NextResponse.json(
          { error: "Erro ao enviar arquivo para o servidor de mídia" },
          { status: 500 }
        );
      }

      const result = (await response.json()) as UploadResponse;

      if (result.mediaUrl) {
        imageUrl = result.mediaUrl;
        console.log(`Imagem enviada com sucesso: ${result.mediaUrl}`);
      } else {
        console.error(
          "Erro: URL do arquivo não retornada pelo servidor Express",
          result.error || "Sem mensagem de erro"
        );
        return NextResponse.json(
          { error: result.error || "Erro ao obter URL do arquivo" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      return NextResponse.json({ error: "Erro ao processar imagem" }, { status: 500 });
    }
  }

  // Processamento do banner1, se existir
  if (banner1 && banner1.size > 0) {
    try {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(banner1.type)) {
        return NextResponse.json(
          { error: "Apenas imagens (jpg, jpeg, png, gif) são permitidas para banner1" },
          { status: 400 }
        );
      }

      const arrayBuffer = await banner1.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: banner1.type });
      const form = new FormData();
      form.append("media", blob, `banner1-${new ObjectId().toHexString()}-${banner1.name}`);

      const expressUploadUrl = "https://up.confissoesdecorno.com/upload";
      const response = await fetch(expressUploadUrl, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        console.error("Erro ao enviar banner1 para o servidor Express:", response.statusText);
        return NextResponse.json(
          { error: "Erro ao enviar banner1 para o servidor de mídia" },
          { status: 500 }
        );
      }

      const result = (await response.json()) as UploadResponse;

      if (result.mediaUrl) {
        banner1Url = result.mediaUrl;
        console.log(`Banner1 enviado com sucesso: ${result.mediaUrl}`);
      } else {
        console.error(
          "Erro: URL do banner1 não retornada pelo servidor Express",
          result.error || "Sem mensagem de erro"
        );
        return NextResponse.json(
          { error: result.error || "Erro ao obter URL do banner1" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Erro ao processar banner1:", error);
      return NextResponse.json({ error: "Erro ao processar banner1" }, { status: 500 });
    }
  }

  // Processamento do banner2, se existir
  if (banner2 && banner2.size > 0) {
    try {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(banner2.type)) {
        return NextResponse.json(
          { error: "Apenas imagens (jpg, jpeg, png, gif) são permitidas para banner2" },
          { status: 400 }
        );
      }

      const arrayBuffer = await banner2.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: banner2.type });
      const form = new FormData();
      form.append("media", blob, `banner2-${new ObjectId().toHexString()}-${banner2.name}`);

      const expressUploadUrl = "https://up.confissoesdecorno.com/upload";
      const response = await fetch(expressUploadUrl, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        console.error("Erro ao enviar banner2 para o servidor Express:", response.statusText);
        return NextResponse.json(
          { error: "Erro ao enviar banner2 para o servidor de mídia" },
          { status: 500 }
        );
      }

      const result = (await response.json()) as UploadResponse;

      if (result.mediaUrl) {
        banner2Url = result.mediaUrl;
        console.log(`Banner2 enviado com sucesso: ${result.mediaUrl}`);
      } else {
        console.error(
          "Erro: URL do banner2 não retornada pelo servidor Express",
          result.error || "Sem mensagem de erro"
        );
        return NextResponse.json(
          { error: result.error || "Erro ao obter URL do banner2" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Erro ao processar banner2:", error);
      return NextResponse.json({ error: "Erro ao processar banner2" }, { status: 500 });
    }
  }

  // Verificar se o novo username já está em uso
  let normalizedUsername: string | undefined;
  if (newUsername) {
    normalizedUsername = normalizeUsername(newUsername);

    if (normalizedUsername !== username) {
      const existingUser = await prismaClient.user.findUnique({
        where: { username: normalizedUsername },
      });

      if (existingUser) {
        return NextResponse.json({ error: "Nome de usuário já está em uso" }, { status: 409 });
      }
    }
  }

  // Processar PersonDetails e CoupleDetails
  try {
    const isCoupleRole = ["casal_homem_mulher", "casal_mulheres", "casal_homens"].includes(role || "");
    const isIndividualRole = ["homem", "mulher", "transex", "travesti"].includes(role || "");
    const needsHim = role === "casal_homem_mulher" || role === "casal_homens";
    const needsHer = role === "casal_homem_mulher" || role === "casal_mulheres";

    let personDetailsId: string | undefined;

    // Processar PersonDetails para papéis individuais
    if (isIndividualRole) {
      const person = {
        name: formData.get("personName")?.toString() || null,
        age: formData.get("personAge") ? parseInt(formData.get("personAge") as string) : null,
        sexualOrientation: formData.get("personSexualOrientation")?.toString() || null,
        profession: formData.get("personProfession")?.toString() || null,
        maritalStatus: formData.get("personMaritalStatus")?.toString() || null,
        zodiacSign: formData.get("personZodiacSign")?.toString() || null,
        ethnicity: formData.get("personEthnicity")?.toString() || null,
        hair: formData.get("personHair")?.toString() || null,
        eyes: formData.get("personEyes")?.toString() || null,
        height: formData.get("personHeight") ? parseFloat(formData.get("personHeight") as string) : null,
        bodyType: formData.get("personBodyType")?.toString() || null,
        smokes: formData.get("personSmokes") === "true",
        drinks: formData.get("personDrinks") === "true",
      };

      const existingPersonDetails = await prismaClient.personDetails.findFirst({
        where: { user: { id: userId } },
      });

      if (existingPersonDetails) {
        // Atualizar PersonDetails existente
        const personRecord = await prismaClient.personDetails.update({
          where: { id: existingPersonDetails.id },
          data: {
            ...person,
            coupleDetailsHim: { disconnect: true }, // Desconectar de CoupleDetails.him
            coupleDetailsHer: { disconnect: true }, // Desconectar de CoupleDetails.her
          },
        });
        personDetailsId = personRecord.id;
      } else if (Object.values(person).some((value) => value !== null && value !== undefined)) {
        // Criar novo PersonDetails
        const personRecord = await prismaClient.personDetails.create({
          data: {
            ...person,
            user: { connect: { id: userId } },
          },
        });
        personDetailsId = personRecord.id;
      }
    } else {
      // Remover PersonDetails se não for papel individual
      await prismaClient.personDetails.deleteMany({
        where: { user: { id: userId } },
      });
    }

    // Processar CoupleDetails para papéis de casal
    if (isCoupleRole) {
      const him = needsHim
        ? {
            name: formData.get("himName")?.toString() || null,
            age: formData.get("himAge") ? parseInt(formData.get("himAge") as string) : null,
            sexualOrientation: formData.get("himSexualOrientation")?.toString() || null,
            profession: formData.get("himProfession")?.toString() || null,
            maritalStatus: formData.get("himMaritalStatus")?.toString() || null,
            zodiacSign: formData.get("himZodiacSign")?.toString() || null,
            ethnicity: formData.get("himEthnicity")?.toString() || null,
            hair: formData.get("himHair")?.toString() || null,
            eyes: formData.get("himEyes")?.toString() || null,
            height: formData.get("himHeight") ? parseFloat(formData.get("himHeight") as string) : null,
            bodyType: formData.get("himBodyType")?.toString() || null,
            smokes: formData.get("himSmokes") === "true",
            drinks: formData.get("himDrinks") === "true",
          }
        : null;

      const her = needsHer
        ? {
            name: formData.get("herName")?.toString() || null,
            age: formData.get("herAge") ? parseInt(formData.get("herAge") as string) : null,
            sexualOrientation: formData.get("herSexualOrientation")?.toString() || null,
            profession: formData.get("herProfession")?.toString() || null,
            maritalStatus: formData.get("herMaritalStatus")?.toString() || null,
            zodiacSign: formData.get("herZodiacSign")?.toString() || null,
            ethnicity: formData.get("herEthnicity")?.toString() || null,
            hair: formData.get("herHair")?.toString() || null,
            eyes: formData.get("herEyes")?.toString() || null,
            height: formData.get("herHeight") ? parseFloat(formData.get("herHeight") as string) : null,
            bodyType: formData.get("herBodyType")?.toString() || null,
            smokes: formData.get("herSmokes") === "true",
            drinks: formData.get("herDrinks") === "true",
          }
        : null;

      const existingCoupleDetails = await prismaClient.coupleDetails.findUnique({
        where: { userId },
      });

      let himId: string | undefined;
      let herId: string | undefined;

      if (needsHim && him && Object.values(him).some((value) => value !== null && value !== undefined)) {
        if (existingCoupleDetails?.himId) {
          // Atualizar PersonDetails existente para him
          const himRecord = await prismaClient.personDetails.update({
            where: { id: existingCoupleDetails.himId },
            data: {
              ...him,
              user: { disconnect: true },
            },
          });
          himId = himRecord.id;
        } else {
          // Criar novo PersonDetails para him
          const himRecord = await prismaClient.personDetails.create({
            data: him,
          });
          himId = himRecord.id;
        }
      }

      if (needsHer && her && Object.values(her).some((value) => value !== null && value !== undefined)) {
        if (existingCoupleDetails?.herId) {
          // Atualizar PersonDetails existente para her
          const herRecord = await prismaClient.personDetails.update({
            where: { id: existingCoupleDetails.herId },
            data: {
              ...her,
              user: { disconnect: true },
            },
          });
          herId = herRecord.id;
        } else {
          // Criar novo PersonDetails para her
          const herRecord = await prismaClient.personDetails.create({
            data: her,
          });
          herId = herRecord.id;
        }
      }

      // Definir explicitamente o tipo do objeto create
      const coupleDetailsCreateInput: Prisma.CoupleDetailsCreateInput = {
        user: { connect: { id: userId } },
        him: himId ? { connect: { id: himId } } : undefined,
        her: herId ? { connect: { id: herId } } : undefined,
      };

      const coupleDetails = await prismaClient.coupleDetails.upsert({
        where: { userId },
        update: {
          himId: needsHim ? himId : null,
          herId: needsHer ? herId : null,
        },
        create: coupleDetailsCreateInput,
      });

      if (himId) {
        await prismaClient.personDetails.update({
          where: { id: himId },
          data: {
            coupleDetailsHim: { connect: { id: coupleDetails.id } },
            user: { disconnect: true },
          },
        });
      }

      if (herId) {
        await prismaClient.personDetails.update({
          where: { id: herId },
          data: {
            coupleDetailsHer: { connect: { id: coupleDetails.id } },
            user: { disconnect: true },
          },
        });
      }
    } else {
      // Remover CoupleDetails e PersonDetails associados se não for papel de casal
      const existingCoupleDetails = await prismaClient.coupleDetails.findUnique({
        where: { userId },
      });

      if (existingCoupleDetails) {
        await prismaClient.personDetails.deleteMany({
          where: { coupleDetailsHim: { id: existingCoupleDetails.id } },
        });
        await prismaClient.personDetails.deleteMany({
          where: { coupleDetailsHer: { id: existingCoupleDetails.id } },
        });
        await prismaClient.coupleDetails.deleteMany({
          where: { userId },
        });
      }
    }

    // Atualizar os dados do usuário
    await prismaClient.user.update({
      where: { id: userId },
      data: {
        username: normalizedUsername || username,
        name: name || undefined,
        bio: bio || undefined,
        age: age ? parseInt(age, 10) : null,
        city: city || undefined,
        state: state || undefined,
        instagram: instagram || undefined,
        twitter: twitter || undefined,
        privacy: privacy || undefined,
        sexlog: sexlog || undefined,
        buupe: buupe || undefined,
        onlyfans: onlyfans || undefined,
        role: role || undefined,
        image: imageUrl || undefined,
        banner1: banner1Url || undefined,
        banner2: banner2Url || undefined,
        interests: interests.length > 0 ? interests : [],
        objectives: objectives.length > 0 ? objectives : [],
        fetishes: fetishes.length > 0 ? fetishes : [],
        personDetailsId,
      },
    });

    console.log("Perfil atualizado com sucesso.");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}

// Método GET para buscar informações do usuário
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params; // Corrigido: aguardar params
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!session || !userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (session.user.username !== username) {
    return NextResponse.json({ error: "Você não tem permissão para acessar este perfil" }, { status: 403 });
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { username },
      select: {
        username: true,
        name: true,
        bio: true,
        age: true,
        city: true,
        state: true,
        instagram: true,
        privacy: true,
        twitter: true,
        onlyfans: true,
        buupe: true,
        sexlog: true,
        role: true,
        image: true,
        banner1: true,
        banner2: true,
        interests: true,
        objectives: true,
        fetishes: true,
        coupleDetails: {
          include: {
            him: true,
            her: true,
          },
        },
        personDetails: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    return NextResponse.json({ error: "Erro ao buscar informações do usuário" }, { status: 500 });
  }
}

// Método OPTIONS para pré-verificação de CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}