import prismaClient from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface UserData {
  id: string;
  username: string;
  image: string | null;
  access?: number | null;
  city?: string | null;
  state?: string | null;
  role?: string | null;
}

interface CommentData {
  id: string;
  content: string;
  postId: string;
  userId: string | null;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    image: string | null;
    access?: number | null;
    city?: string | null;
    state?: string | null;
    role?: string | null;
  } | null;
}

interface VisitorCommentData {
  id: string;
  username: string;
  content: string;
  postId: string;
  createdAt: Date;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  postId: string;
  description: string;
  likesCount: number;
  commentsCount: number;
  User: UserData;
  comments: CommentData[];
  visitorComments: VisitorCommentData[];
  createdAt: Date;
  paidPost?: {
    id: string;
    priceCredits: number;
    description: string;
    isActive: boolean;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const { identifier } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  console.log("Tentando buscar usuário:", identifier);

  try {
    const user = await prismaClient.user.findUnique({
      where: { username: identifier },
      select: { id: true, username: true, image: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const photos = await prismaClient.photo.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
                image: true,
                access: true,
                city: true,
                state: true,
                role: true,
              },
            },
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    image: true,
                    access: true,
                    city: true,
                    state: true,
                    role: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            visitorComments: {
              orderBy: { createdAt: "desc" },
            },
            paidPost: {
              select: {
                id: true,
                priceCredits: true,
                description: true,
                isActive: true,
              }
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Função para garantir dados padrão do usuário
    const getSafeUserData = (postUser: UserData | null, fallbackUser: UserData): UserData => {
      return postUser ? {
        id: postUser.id,
        username: postUser.username,
        image: postUser.image,
        access: postUser.access ?? undefined,
        city: postUser.city ?? undefined,
        state: postUser.state ?? undefined,
        role: postUser.role ?? undefined,
      } : fallbackUser;
    };

    const transformedPhotos: MediaItem[] = photos.map(photo => {
      // Usuário fallback caso não exista post.User
      const fallbackUser: UserData = {
        id: user.id,
        username: user.username,
        image: user.image,
      };

      if (!photo.post) {
        return {
          id: photo.id,
          url: photo.url,
          type: 'photo',
          postId: '',
          description: '',
          likesCount: 0,
          commentsCount: 0,
          User: fallbackUser,
          comments: [],
          visitorComments: [],
          createdAt: photo.createdAt,
          paidPost: null
        };
      }

      return {
        id: photo.id,
        url: photo.url,
        type: 'photo',
        postId: photo.post.id,
        description: photo.post.description || '',
        likesCount: photo.post.likesCount || 0,
        commentsCount: (photo.post.comments?.length || 0) + (photo.post.visitorComments?.length || 0),
        User: getSafeUserData(photo.post.User, fallbackUser),
        comments: photo.post.comments?.map(comment => ({
          id: comment.id,
          content: comment.content,
          postId: comment.postId,
          userId: comment.userId,
          createdAt: comment.createdAt,
          user: comment.user ? {
            id: comment.user.id,
            username: comment.user.username,
            image: comment.user.image,
            access: comment.user.access ?? undefined,
            city: comment.user.city ?? undefined,
            state: comment.user.state ?? undefined,
            role: comment.user.role ?? undefined,
          } : null,
        })) || [],
        visitorComments: photo.post.visitorComments?.map(vc => ({
          id: vc.id,
          username: vc.username,
          content: vc.content,
          postId: vc.postId,
          createdAt: vc.createdAt,
        })) || [],
        createdAt: photo.createdAt,
        paidPost: photo.post.paidPost
      };
    });

    const totalPhotos = await prismaClient.photo.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      items: transformedPhotos,
      total: totalPhotos,
      page,
      limit,
      totalPages: Math.ceil(totalPhotos / limit),
    });
  } catch (error) {
    console.error("Erro ao buscar fotos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}