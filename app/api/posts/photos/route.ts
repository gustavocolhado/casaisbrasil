// app/api/videos/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

// Interface para a foto retornada
interface PhotoResponse {
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

// Função para buscar fotos com cache
const getPhotos = unstable_cache(
  async (page: number, limit: number, approved?: boolean) => {
    const skip = (page - 1) * limit;

    // Contar total de fotos
    const totalPhotos = await prisma.photo.count({
      where: approved !== undefined ? {
        post: {
          approved: approved
        }
      } : undefined
    });

    // Buscar fotos paginadas
    const photos = await prisma.photo.findMany({
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

    // Mapear fotos para o formato esperado
    return {
      photos: photos.map((photo: any): PhotoResponse => ({
        id: photo.id,
        url: photo.url,
        postId: photo.postId,
        postUrl: photo.post.url, // Incluir o campo url da tabela post
        description: photo.post.description || '',
        createdAt: photo.createdAt.toISOString(),
        likesCount: photo.post.likesCount || 0,
        commentsCount: photo.post.commentsCount || 0,
        user: {
          id: photo.user.id,
          username: photo.user.username,
          image: photo.user.image || null,
          access: photo.user.access,
          city: photo.user.city,
          state: photo.user.state,
          role: photo.user.role,
        },
        comments: photo.post.comments || [],
        visitorComments: photo.post.visitorComments || [],
      })),
      totalPhotos,
    };
  },
  ['photos', 'page', 'limit', 'approved'],
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

    // Buscar fotos
    const { photos, totalPhotos } = await getPhotos(page, limit, approved);
    const totalPages = Math.ceil(totalPhotos / limit);

    return NextResponse.json({
      photos,
      pagination: {
        total: totalPhotos,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}