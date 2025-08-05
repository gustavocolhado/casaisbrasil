// app/api/videos/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

// Interface para o vídeo retornado
interface VideoResponse {
  id: string;
  url: string;
  postId: string;
  postUrl: string; // Novo campo para o url da tabela post
  description: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  user: {
    id: string;
    username: string;
    image: string | null;
    access?: number;
    city?: string | null;
    state?: string | null;
    role?: string | null;
  };
  comments: any[];
  visitorComments: any[];
}

// Função para buscar vídeos com cache
const getVideos = unstable_cache(
  async (page: number, limit: number, approved?: boolean) => {
    const skip = (page - 1) * limit;

    // Contar total de vídeos
    const totalVideos = await prisma.video.count({
      where: approved !== undefined ? {
        post: {
          approved: approved
        }
      } : undefined
    });

    // Buscar vídeos paginados
    const videos = await prisma.video.findMany({
      where: approved !== undefined ? {
        post: {
          approved: approved
        }
      } : undefined,
      select: {
        id: true,
        url: true,
        postId: true,
        createdAt: true,
        post: {
          select: {
            description: true,
            url: true, // Adicionar o campo url da tabela post
            likesCount: true,
            commentsCount: true,
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    image: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
            visitorComments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                username: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
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
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    // Mapear vídeos para o formato esperado
    return {
      videos: videos.map((video: any): VideoResponse => ({
        id: video.id,
        url: video.url,
        postId: video.postId,
        postUrl: video.post.url, // Incluir o campo url da tabela post
        description: video.post.description || '',
        createdAt: video.createdAt.toISOString(),
        likesCount: video.post.likesCount || 0,
        commentsCount: video.post.commentsCount || 0,
        user: {
          id: video.user.id,
          username: video.user.username,
          image: video.user.image || null,
          access: video.user.access,
          city: video.user.city,
          state: video.user.state,
          role: video.user.role,
        },
        comments: video.post.comments || [],
        visitorComments: video.post.visitorComments || [],
      })),
      totalVideos,
    };
  },
  ['videos', 'page', 'limit', 'approved'],
  { revalidate: 300 } // Cache por 5 minutos
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const approved = searchParams.get('approved') === 'true';

    // Validar parâmetros
    if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
      return NextResponse.json({ message: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Buscar vídeos
    const { videos, totalVideos } = await getVideos(page, limit, approved);
    const totalPages = Math.ceil(totalVideos / limit);

    return NextResponse.json({
      videos,
      pagination: {
        total: totalVideos,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}