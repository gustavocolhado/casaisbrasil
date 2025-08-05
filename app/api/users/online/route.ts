import { NextRequest, NextResponse } from 'next/server'
import prismaClient from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Buscar usuários online (últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const onlineUsers = await prismaClient.user.findMany({
      where: {
        lastSeen: {
          gte: fiveMinutesAgo
        },
        id: {
          not: session.user.id // Excluir o usuário atual
        }
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        role: true,
        premium: true,
        lastSeen: true,
        followersCount: true,
        viewsCount: true,
        recommendationsCount: true,
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        lastSeen: 'desc'
      },
      skip,
      take: limit
    })

    // Contar total de usuários online
    const totalOnline = await prismaClient.user.count({
      where: {
        lastSeen: {
          gte: fiveMinutesAgo
        }
      }
    })

    // Formatar dados dos usuários
    const formattedUsers = onlineUsers.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      image: user.image,
      role: user.role,
      premium: user.premium,
      lastSeen: user.lastSeen,
      followersCount: user.followersCount,
      viewsCount: user.viewsCount,
      recommendationsCount: user.recommendationsCount,
      postsCount: user._count.posts
    }))

    return NextResponse.json({
      users: formattedUsers,
      total: totalOnline,
      page,
      limit,
      hasMore: skip + limit < totalOnline
    })

  } catch (error) {
    console.error('Erro ao buscar usuários online:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 