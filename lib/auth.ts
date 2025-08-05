import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import prismaClient from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@prisma/client';

// Função para gerar username único
async function generateUniqueUsername(email: string): Promise<string> {
  const baseUsername = email.split('@')[0].toLowerCase();
  let username = baseUsername;
  let counter = 1;
  
  // Verificar se o username já existe
  while (await prismaClient.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
}

// Adapter personalizado para lidar com o campo username obrigatório
function CustomPrismaAdapter(prisma: any) {
  const adapter = PrismaAdapter(prisma);
  
  return {
    ...adapter,
    async createUser(data: any) {
      console.log('CustomPrismaAdapter.createUser chamado com:', data);
      
      // Normalizar email para minúsculas
      const normalizedEmail = data.email?.toLowerCase().trim();
      
      // Gerar username único
      const username = await generateUniqueUsername(normalizedEmail);
      console.log('Username gerado:', username);
      
      // Criar usuário com username único
      const userData = {
        ...data,
        email: normalizedEmail,
        username,
        signupSource: 'google',
        credits: 0,
        premium: false,
      };
      
      console.log('Dados do usuário a serem criados:', userData);
      
      try {
        const user = await prismaClient.user.create({
          data: userData,
        });
        console.log('Usuário criado com sucesso:', user);
        return user;
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        throw error;
      }
    }
  };
}

async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  return await bcrypt.compare(inputPassword, storedPassword);
}

export const authOptions: AuthOptions = {
  adapter: CustomPrismaAdapter(prismaClient),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        source: { label: 'Source', type: 'text' },
      },
      async authorize(credentials, req) {
        const email = credentials?.email;
        const password = credentials?.password;
        const source = String(credentials?.source || '');

        if (!email || !password) {
          throw new Error('Email e senha são obrigatórios');
        }

        // Normalizar email para minúsculas
        const normalizedEmail = email.toLowerCase().trim();

        const user = await prismaClient.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) {
          throw new Error('Email ou senha incorretos');
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Email ou senha incorretos');
        }

        if (!user.signupSource) {
          await prismaClient.user.update({
            where: { email },
            data: { signupSource: source },
          });
        }

        return {
          id: user.id,
          email: user.email,
          premium: user.premium,
          username: user.username,
          name: user.name || undefined,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      // Para login com Google, deixar o PrismaAdapter fazer todo o trabalho
      // O callback signIn será chamado após o usuário ser criado/encontrado
      return true;
    },
    async session({ session, token }) {
      if (token && token.email) {
        try {
          const user = await prismaClient.user.findUnique({
            where: { email: token.email as string },
          }) as any;

          if (user) {
            // Verifica se a assinatura premium expirou
            const now = new Date();
            if (user.expireDate && user.expireDate < now && user.premium) {
              try {
                await prismaClient.user.update({
                  where: { id: user.id },
                  data: { premium: false },
                });
              } catch (updateError) {
                console.error('Erro ao atualizar status premium:', updateError);
              }
            }

            (session.user as any) = {
              ...session.user,
              id: user.id,
              username: user.username,
              image: user.image,
              name: user.name,
              email: user.email,
              premium: user.premium,
              expireDate: user.premium ? user.expireDate : null,
              role: user.role || '',
              credits: user.credits || 0,
            };
          }
        } catch (error) {
          console.error('Erro ao buscar usuário na sessão:', error);
          // Retornar sessão sem dados adicionais em caso de erro
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Persiste os dados do usuário no token
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.name = user.name;
        token.premium = (user as any).premium;
        token.expireDate = (user as any).expireDate || null;
        token.email = user.email;
        token.credits = (user as any).credits || 0;
      }

      // Atualiza o token quando o usuário faz login
      if (account) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      // Se a URL for a landing page e o usuário estiver logado, redirecionar para /home
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/home`;
      }
      
      // Permite redirecionamentos relativos e absolutos para o mesmo domínio
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    newUser: '/register',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log de atividades ou outras ações pós-login
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
    async signOut({ token, session }) {
      // Limpeza ou log ao deslogar
      console.log('User signed out');
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Helper para usar em rotas API
export const getAuthOptions = (req: NextApiRequest, res: NextApiResponse): AuthOptions => ({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async redirect({ url, baseUrl }) {
      const callbackUrl = req.query.callbackUrl as string | undefined;
      if (callbackUrl) {
        const decodedUrl = decodeURIComponent(callbackUrl);
        if (decodedUrl.startsWith('/') || new URL(decodedUrl).origin === baseUrl) {
          return decodedUrl;
        }
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
});