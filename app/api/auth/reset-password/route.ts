import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Função para validar força da senha
function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/[A-Za-z]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos um número' };
  }
  
  return { isValid: true, message: 'Senha válida' };
}

// Função para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json();

    // Validações básicas
    if (!token || !email || !newPassword) {
      return NextResponse.json({ 
        error: 'Token, e-mail e nova senha são obrigatórios' 
      }, { status: 400 });
    }

    if (typeof token !== 'string' || typeof email !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json({ 
        error: 'Dados inválidos' 
      }, { status: 400 });
    }

    // Validar formato do email
    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        error: 'Formato de e-mail inválido' 
      }, { status: 400 });
    }

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        error: passwordValidation.message 
      }, { status: 400 });
    }

    // Verificar se o token é válido
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      console.log(`Tentativa de reset com token inválido: ${token}`);
      return NextResponse.json({ 
        error: 'Token inválido ou expirado' 
      }, { status: 400 });
    }

    if (verificationToken.expires < new Date()) {
      console.log(`Tentativa de reset com token expirado: ${token}`);
      return NextResponse.json({ 
        error: 'Token expirado. Solicite um novo link de recuperação.' 
      }, { status: 400 });
    }

    // Verificar se o e-mail corresponde ao usuário
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!user) {
      console.log(`Tentativa de reset para usuário não encontrado: ${email}`);
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 400 });
    }

    if (user.id !== verificationToken.userId) {
      console.log(`Tentativa de reset com email incorreto. Token: ${token}, Email fornecido: ${email}`);
      return NextResponse.json({ 
        error: 'Token inválido para este e-mail' 
      }, { status: 400 });
    }

    // Verificar se a nova senha é diferente da atual
    const isSamePassword = await bcrypt.compare(newPassword, user.password || '');
    if (isSamePassword) {
      return NextResponse.json({ 
        error: 'A nova senha deve ser diferente da senha atual' 
      }, { status: 400 });
    }

    // Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12); // Aumentei para 12 rounds

    // Atualizar a senha do usuário em uma transação
    await prisma.$transaction(async (tx) => {
      // Atualizar a senha do usuário
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Deletar o token usado
      await tx.verificationToken.delete({ where: { token } });
    });

    // Log de sucesso
    console.log(`Senha redefinida com sucesso para o usuário: ${email}`);

    return NextResponse.json({ 
      message: 'Senha redefinida com sucesso! Você será redirecionado para a página de login.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma Error:', error, error.meta);
      
      if (error.code === 'P2025') {
        return NextResponse.json({ 
          error: 'Token não encontrado' 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: 'Erro ao redefinir a senha. Tente novamente.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor. Tente novamente mais tarde.' 
    }, { status: 500 });
  }
}