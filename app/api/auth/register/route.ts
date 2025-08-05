import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prismaClient from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { username, email, role, password, source } = await request.json()

    // Converter username e email para minúsculas
    const normalizedUsername = username?.toLowerCase().trim()
    const normalizedEmail = email?.toLowerCase().trim()

    // Validações
    if (!normalizedUsername || !normalizedEmail || !role || !password) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validar role
    const validRoles = [
      'casal_homem_mulher',
      'casal_mulheres', 
      'casal_homens',
      'homem',
      'mulher',
      'transex',
      'travesti'
    ]

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Tipo de perfil inválido' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUser = await prismaClient.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // Verificar se o username já existe
    const existingUsername = await prismaClient.user.findUnique({
      where: { username: normalizedUsername }
    })

    if (existingUsername) {
      return NextResponse.json(
        { message: 'Este nome de usuário já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário
    const user = await prismaClient.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        role,
        password: hashedPassword,
        signupSource: source || 'register_page',
        premium: false,
        credits: 0,
        followersCount: 0,
        viewsCount: 0,
        recommendationsCount: 0,
        interests: [],
        fetishes: [],
        objectives: []
      }
    })

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}