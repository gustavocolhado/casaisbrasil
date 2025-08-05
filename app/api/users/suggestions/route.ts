import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema validation for query parameters
const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(1000).default(50),
});

// GET handler for fetching random users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { limit } = QuerySchema.parse(Object.fromEntries(searchParams));

    // Se o limite for alto, buscar todos os usuários
    if (limit >= 1000) {
      const allUsers = await prisma.user.findMany({
        select: {
          username: true,
          name: true,
          image: true,
          role: true,
          city: true,
          state: true,
          followersCount: true,
          premium: true,
        },
        orderBy: {
          premium: 'desc', // Premium primeiro
        },
      });

      return NextResponse.json({
        success: true,
        data: allUsers,
      });
    }

    // Para limites menores, usar a lógica de randomização
    const users = await prisma.user.aggregateRaw({
      pipeline: [
        {
          $match: {
            premium: true, // Prioritize premium users first
          },
        },
        { $sample: { size: Math.ceil(limit / 2) } }, // Randomize premium users
        {
          $project: {
            username: 1,
            name: 1,
            image: 1,
            role: 1,
            city: 1,
            state: 1,
            followersCount: 1,
            premium: 1,
            _id: 0,
          },
        },
        {
          $unionWith: {
            coll: "user",
            pipeline: [
              { $match: { premium: { $ne: true } } }, // Non-premium users
              { $sample: { size: Math.floor(limit / 2) } }, // Randomize non-premium users
              {
                $project: {
                  username: 1,
                  name: 1,
                  image: 1,
                  role: 1,
                  city: 1,
                  state: 1,
                  followersCount: 1,
                  premium: 1,
                  _id: 0,
                },
              },
            ],
          },
        },
        { $limit: limit }, // Ensure final limit
      ],
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching random users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch random users',
      },
      { status: 500 }
    );
  }
}