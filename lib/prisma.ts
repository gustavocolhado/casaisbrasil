import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient;

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

if(process.env.NODE_ENV === "production"){
  prisma = createPrismaClient();
}else{
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  }

  if(!globalWithPrisma.prisma){
    globalWithPrisma.prisma = createPrismaClient();
  }

  prisma = globalWithPrisma.prisma;
}

// Função para verificar e reconectar se necessário
const ensureConnection = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Prisma conectado ao banco de dados')
  } catch (error) {
    console.error('❌ Erro ao conectar Prisma:', error)
    
    // Tentar reconectar após 5 segundos
    setTimeout(async () => {
      try {
        await prisma.$connect()
        console.log('✅ Reconexão bem-sucedida')
      } catch (reconnectError) {
        console.error('❌ Falha na reconexão:', reconnectError)
      }
    }, 5000)
  }
}

// Verificar conexão inicial
ensureConnection()

export default prisma;