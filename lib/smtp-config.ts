import nodemailer from 'nodemailer'

// Função auxiliar para validar variáveis de ambiente
function getEnvVariable(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não está definida`)
  }
  return value
}

// Configurações SMTP baseadas no host
export function createSMTPTransporter() {
  const host = getEnvVariable('SMTP_HOST')
  const port = parseInt(getEnvVariable('SMTP_PORT'))
  const secure = getEnvVariable('SMTP_SECURE') === 'true'
  const user = getEnvVariable('SMTP_USER')
  const pass = getEnvVariable('SMTP_PASSWORD')

  // Configurações específicas por provedor
  const configs: Record<string, any> = {
    // Gmail
    'smtp.gmail.com': {
      host,
      port,
      secure: false, // Gmail usa STARTTLS na porta 587
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      requireTLS: true,
      ignoreTLS: false,
    },
    // Outlook/Hotmail
    'smtp-mail.outlook.com': {
      host,
      port,
      secure: false,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      requireTLS: true,
      ignoreTLS: false,
    },
    // SendGrid
    'smtp.sendgrid.net': {
      host,
      port,
      secure: false,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      requireTLS: true,
      ignoreTLS: false,
    },
    // Configuração genérica
    'default': {
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      requireTLS: true,
      ignoreTLS: false,
    }
  }

  const config = configs[host] || configs.default

  return nodemailer.createTransport(config)
}

// Função para testar a conexão SMTP
export async function testSMTPConnection() {
  try {
    const transporter = createSMTPTransporter()
    
    // Verificar se a conexão está funcionando
    await transporter.verify()
    
    console.log('✅ Conexão SMTP verificada com sucesso')
    return { success: true, message: 'Conexão SMTP OK' }
  } catch (error) {
    console.error('❌ Erro na verificação SMTP:', error)
    return { 
      success: false, 
      message: 'Erro na conexão SMTP',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
} 