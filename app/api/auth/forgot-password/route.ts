import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'crypto';
import { createSMTPTransporter } from '@/lib/smtp-config';

const prisma = new PrismaClient();

// Cache para rate limiting (em produção, use Redis)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

// Função auxiliar para validar variáveis de ambiente
function getEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não está definida`);
  }
  return value;
}

// Função para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para rate limiting
function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxRequests = 3; // Máximo 3 tentativas por 15 minutos

  const key = `forgot-password:${email}`;
  const cached = rateLimitCache.get(key);

  if (!cached || now > cached.resetTime) {
    rateLimitCache.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (cached.count >= maxRequests) {
    return false;
  }

  cached.count++;
  return true;
}

// Template de email melhorado
function createEmailTemplate(resetLink: string, username: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Recuperação de Senha</h1>
          <p>Olá ${username}, você solicitou a redefinição da sua senha</p>
        </div>
        <div class="content">
          <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se você não fez essa solicitação, pode ignorar este e-mail.</p>
          
          <p>Para redefinir sua senha, clique no botão abaixo:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">🔑 Redefinir Minha Senha</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Este link expira em 1 hora</li>
              <li>Não compartilhe este link com ninguém</li>
              <li>Se você não solicitou esta recuperação, ignore este e-mail</li>
            </ul>
          </div>
          
          <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
          <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
        </div>
        <div class="footer">
          <p>Este e-mail foi enviado automaticamente. Não responda a este e-mail.</p>
          <p>&copy; 2024 Confissões de Corno. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validação básica
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    // Validar formato do email
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Formato de e-mail inválido' }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json({ 
        error: 'Muitas tentativas. Tente novamente em 15 minutos.' 
      }, { status: 429 });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      console.log(`Tentativa de recuperação de senha para email não cadastrado: ${email}`);
      return NextResponse.json({ 
        message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.' 
      }, { status: 200 });
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // Expira em 1 hora

    // Use uma transação para evitar condições de corrida
    await prisma.$transaction(async (tx) => {
      // Remover tokens existentes para este usuário
      await tx.verificationToken.deleteMany({
        where: { userId: user.id },
      });

      // Verificar colisão de token (muito improvável, mas por segurança)
      const existingToken = await tx.verificationToken.findUnique({
        where: { token },
      });
      if (existingToken) {
        throw new Error('Colisão de token detectada');
      }

      // Salvar token no banco
      await tx.verificationToken.create({
        data: {
          userId: user.id,
          token,
          expires,
        },
      });
    });

    // Configurar o transporte de e-mail
    const transporter = createSMTPTransporter();

    // Enviar e-mail com o link de redefinição
    const resetLink = `${getEnvVariable('NEXTAUTH_URL')}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const mailOptions = {
      from: `"Confissões de Corno" <${getEnvVariable('SMTP_USER')}>`,
      to: email,
      subject: '🔐 Recuperação de Senha - Confissões de Corno',
      html: createEmailTemplate(resetLink, user.username || user.name || 'Usuário'),
    };

    await transporter.sendMail(mailOptions);
    
    // Log de sucesso
    console.log(`E-mail de recuperação enviado com sucesso para: ${email}`);
    
    return NextResponse.json({ 
      message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.' 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma Error:', error, error.meta);
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Erro interno. Tente novamente.' },
          { status: 500 }
        );
      }
    } else if (error instanceof Error && error.message.includes('certificate has expired')) {
      console.error('SMTP Certificate Error:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar e-mail. Tente novamente mais tarde.' },
        { status: 500 }
      );
    } else if (error instanceof Error && error.message.includes('Variável de ambiente')) {
      console.error('Environment Variable Error:', error);
      return NextResponse.json(
        { error: 'Erro de configuração do servidor.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor. Tente novamente mais tarde.' 
    }, { status: 500 });
  }
}