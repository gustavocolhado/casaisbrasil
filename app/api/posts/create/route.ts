import { NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// Interface for the Express upload endpoint response
interface UploadResponse {
  mediaUrl?: string;
  error?: string;
}

interface UploadedFile {
  originalName: string;
  mediaUrl: string;
  type: 'image' | 'video';
}

export async function POST(req: Request) {
  // Extraindo os dados do formulário
  const formData = await req.formData();
  const description = formData.get("description")?.toString() || "";
  const userId = formData.get("userId")?.toString() || "";
  const mediaFiles = formData.getAll("mediaFiles") as File[];
  
  // Gerar URL única automaticamente
  const url = uuidv4();
  
  // Novos campos para funcionalidades premium
  const isPrivatePost = formData.get("isPrivatePost")?.toString() === "true";
  const creditsRequired = parseInt(formData.get("creditsRequired")?.toString() || "0");
  const postType = formData.get("postType")?.toString() || "feed";

  // Validação: apenas description e userId são obrigatórios
  if (!description || !userId) {
    return NextResponse.json(
      { error: "Campos obrigatórios estão faltando" },
      { status: 400 }
    );
  }

  // Validação de tamanho da descrição
  if (description.length < 10) {
    return NextResponse.json(
      { error: "A descrição deve ter pelo menos 10 caracteres" },
      { status: 400 }
    );
  }

  // Validação de tipos de arquivo no lado do servidor Next.js
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/mpeg",
    "video/webm",
    "video/avi",
    "video/mov",
    "video/wmv",
  ];

  const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  const videoTypes = [
    "video/mp4",
    "video/mpeg",
    "video/webm",
    "video/avi",
    "video/mov",
    "video/wmv",
  ];

  const maxFileSize = 50 * 1024 * 1024; // 50MB
  const maxFiles = 8;

  // Validação de quantidade de arquivos
  if (mediaFiles.length > maxFiles) {
    return NextResponse.json(
      { error: `Máximo de ${maxFiles} arquivos permitidos` },
      { status: 400 }
    );
  }

  // Validação de cada arquivo
  for (const file of mediaFiles) {
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Apenas imagens (jpg, jpeg, png, gif) ou vídeos (mp4, mpeg, webm, avi, mov, wmv) são permitidos",
        },
        { status: 400 }
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máximo 50MB)" },
        { status: 400 }
      );
    }
  }

  const mediaUrls: string[] = [];
  const uploadedFiles: UploadedFile[] = [];
  let newPostId: string | null = null;

  // Processar arquivos de mídia, se existirem
  if (mediaFiles.length > 0) {
    const expressUploadUrl = "https://up.confissoesdecorno.com/upload";

    for (const file of mediaFiles) {
      try {
        console.log(`Iniciando upload do arquivo: ${file.name}`);
        
        // Criar FormData para enviar o arquivo
        const form = new FormData();
        form.append("media", file, `${uuidv4()}-${file.name}`);

        // Enviar o arquivo para o servidor Express
        const response = await fetch(expressUploadUrl, {
          method: "POST",
          body: form,
        });

        if (!response.ok) {
          console.error(
            "Erro ao enviar arquivo para o servidor Express:",
            response.statusText
          );
          throw new Error(`Erro no servidor de upload: ${response.statusText}`);
        }

        // Tipar o resultado da resposta JSON
        const result = (await response.json()) as UploadResponse;

        // Verificar se mediaUrl existe
        if (result.mediaUrl) {
          mediaUrls.push(result.mediaUrl);
          uploadedFiles.push({
            originalName: file.name,
            mediaUrl: result.mediaUrl,
            type: imageTypes.includes(file.type) ? 'image' : 'video'
          });
          console.log(`Arquivo enviado com sucesso: ${result.mediaUrl}`);
        } else {
          console.error(
            "Erro: URL do arquivo não retornada pelo servidor Express",
            result.error || "Sem mensagem de erro"
          );
          throw new Error(result.error || "Erro ao obter URL do arquivo");
        }
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        
        // Rollback: deletar arquivos já enviados
        if (uploadedFiles.length > 0) {
          console.log("Iniciando rollback - deletando arquivos já enviados...");
          await rollbackUploads(uploadedFiles);
        }
        
        return NextResponse.json(
          { error: `Erro ao processar arquivo ${file.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
          { status: 500 }
        );
      }
    }
  }

  // Verificando o status do campo 'access' do usuário e validações premium
  let approved = false;
  let user = null;
  try {
    user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { 
        access: true, 
        premium: true,
        vipPlans: {
          where: { isActive: true },
          select: { id: true }
        }
      },
    });

    if (user?.access === 1) {
      approved = true;
    }

    // Validações para posts privados
    if (isPrivatePost) {
      if (!user?.premium) {
        return NextResponse.json(
          { error: "Apenas usuários premium podem criar posts privados" },
          { status: 403 }
        );
      }
      
      if (creditsRequired <= 0) {
        return NextResponse.json(
          { error: "Posts privados devem ter um valor em créditos maior que 0" },
          { status: 400 }
        );
      }
    }

    // Validações para posts VIP
    if (postType === 'vip') {
      if (!user?.premium) {
        return NextResponse.json(
          { error: "Apenas usuários premium podem criar posts VIP" },
          { status: 403 }
        );
      }
      
      if (user.vipPlans.length === 0) {
        return NextResponse.json(
          { error: "Você precisa ter pelo menos um plano VIP ativo para criar posts VIP" },
          { status: 403 }
        );
      }
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    
    // Rollback se não conseguir verificar o usuário
    if (uploadedFiles.length > 0) {
      await rollbackUploads(uploadedFiles);
    }
    
    return NextResponse.json(
      { error: "Erro ao verificar o usuário" },
      { status: 500 }
    );
  }

  // Criar o post no banco de dados
  try {
    console.log("Criando o post no banco de dados...");
    const newPost = await prismaClient.post.create({
      data: {
        description,
        url,
        mediaUrls,
        userId,
        viewCount: 0,
        likesCount: 0,
        approved,
        premium: user?.premium || false,
      },
    });
    newPostId = newPost.id;
    console.log("Post criado com sucesso:", newPost);

    // Criar PaidPost se for um post privado
    if (isPrivatePost && newPostId) {
      try {
        await prismaClient.paidPost.create({
          data: {
            postId: newPostId,
            creatorId: userId,
            price: 0, // Preço em reais (não usado para posts privados)
            priceCredits: creditsRequired,
            description: `Post privado - ${creditsRequired} créditos para acesso`,
            isActive: true,
          },
        });
        console.log("PaidPost criado com sucesso para post privado");
      } catch (error) {
        console.error("Erro ao criar PaidPost:", error);
        
        // Rollback: deletar post e arquivos
        try {
          await prismaClient.post.delete({ where: { id: newPostId } });
          await rollbackUploads(uploadedFiles);
        } catch (rollbackError) {
          console.error("Erro durante rollback:", rollbackError);
        }
        
        return NextResponse.json(
          { error: "Erro ao criar post privado" },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Erro ao criar post:", error);
    
    // Rollback se não conseguir criar o post
    if (uploadedFiles.length > 0) {
      await rollbackUploads(uploadedFiles);
    }
    
    return NextResponse.json(
      { error: "Erro ao criar post no banco de dados" },
      { status: 500 }
    );
  }

  // Cadastrar nas tabelas específicas (Photo ou Video)
  if (uploadedFiles.length > 0 && newPostId) {
    try {
      for (const uploadedFile of uploadedFiles) {
        if (uploadedFile.type === 'image') {
          await prismaClient.photo.create({
            data: {
              url: uploadedFile.mediaUrl,
              postId: newPostId,
              userId,
            },
          });
          console.log(`Foto cadastrada com sucesso: ${uploadedFile.mediaUrl}`);
        } else {
          await prismaClient.video.create({
            data: {
              url: uploadedFile.mediaUrl,
              postId: newPostId,
              userId,
            },
          });
          console.log(`Vídeo cadastrado com sucesso: ${uploadedFile.mediaUrl}`);
        }
      }
    } catch (error) {
      console.error("Erro ao cadastrar mídia na tabela específica:", error);
      
      // Rollback completo: deletar post e arquivos
      try {
        if (newPostId) {
          await prismaClient.post.delete({ where: { id: newPostId } });
        }
        await rollbackUploads(uploadedFiles);
      } catch (rollbackError) {
        console.error("Erro durante rollback:", rollbackError);
      }
      
      return NextResponse.json(
        { error: "Erro ao cadastrar mídia no banco de dados" },
        { status: 500 }
      );
    }
  }

  // Buscar o post finalizado com todas as informações
  try {
    const finalPost = await prismaClient.post.findUnique({
      where: { id: newPostId },
      include: {
        photos: true,
        videos: true,
        paidPost: true,
        User: {
          select: {
            username: true,
            name: true,
            image: true,
            premium: true,
          }
        }
      }
    });

    console.log("Post finalizado com sucesso:", finalPost);
    return NextResponse.json(finalPost);
  } catch (error) {
    console.error("Erro ao buscar post finalizado:", error);
    return NextResponse.json(
      { error: "Post criado mas erro ao retornar dados" },
      { status: 500 }
    );
  }
}

// Função para fazer rollback dos uploads em caso de erro
async function rollbackUploads(uploadedFiles: UploadedFile[]) {
  console.log(`Iniciando rollback de ${uploadedFiles.length} arquivos...`);
  
  for (const file of uploadedFiles) {
    try {
      // Aqui você pode implementar a lógica para deletar o arquivo do servidor externo
      // Por exemplo, fazer uma requisição DELETE para o servidor de upload
      const deleteUrl = `https://up.confissoesdecorno.com/delete`;
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mediaUrl: file.mediaUrl }),
      });

      if (response.ok) {
        console.log(`Arquivo deletado com sucesso: ${file.mediaUrl}`);
      } else {
        console.error(`Erro ao deletar arquivo: ${file.mediaUrl}`);
      }
    } catch (error) {
      console.error(`Erro durante rollback do arquivo ${file.mediaUrl}:`, error);
    }
  }
  
  console.log("Rollback concluído");
}