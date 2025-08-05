import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prismaClient from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Atualizar lastSeen do usuário usando query raw
    await prismaClient.$runCommandRaw({
      update: "users",
      updates: [{
        q: { _id: { $oid: session.user.id } },
        u: { $set: { lastSeen: { $date: new Date().toISOString() } } }
      }]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar lastSeen:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 