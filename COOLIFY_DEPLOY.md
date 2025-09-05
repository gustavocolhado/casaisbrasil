# 🚀 Guia de Deploy no Coolify - Colibri Plus

## 📋 Pré-requisitos

1. **Conta no Coolify** configurada
2. **Repositório Git** com o código do projeto
3. **Servidor** com Docker instalado
4. **Domínio** configurado (opcional)

## 🔧 Configuração do Projeto

### 1. Preparar o Repositório

Certifique-se de que os seguintes arquivos estão no seu repositório:

```
├── Dockerfile                    # ✅ Criado
├── docker-compose.yml           # ✅ Criado
├── docker/
│   ├── entrypoint.sh           # ✅ Criado
│   ├── supervisor/
│   │   └── supervisord.conf    # ✅ Criado
│   ├── colibriplus/
│   │   ├── Dockerfile          # ✅ Existente
│   │   ├── php.ini             # ✅ Existente
│   │   └── opcache.ini         # ✅ Existente
│   └── nginx/
│       └── conf.d/
│           └── nginx.conf      # ✅ Existente
├── .env.example                 # ⚠️ Restaurar se necessário
└── composer.json               # ✅ Existente
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Aplicação
APP_NAME="Colibri Plus"
APP_ENV=production
APP_KEY=base64:SUA_CHAVE_AQUI
APP_DEBUG=false
APP_URL=https://seu-dominio.com

# Banco de Dados
DB_CONNECTION=mysql
DB_HOST=database
DB_PORT=3306
DB_DATABASE=colibriplus
DB_USERNAME=colibriplus_user
DB_PASSWORD=senha_super_segura
DB_ROOT_PASSWORD=senha_root_super_segura

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=seu-smtp.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@dominio.com
MAIL_PASSWORD=sua-senha
MAIL_ENCRYPTION=tls

# Stripe (Pagamentos)
STRIPE_KEY=pk_live_sua_chave_publica
STRIPE_SECRET=sk_live_sua_chave_secreta

# Vonage (SMS)
VONAGE_API_KEY=sua_api_key
VONAGE_API_SECRET=seu_api_secret

# Outras configurações
QUEUE_CONNECTION=redis
BROADCAST_DRIVER=pusher
CACHE_DRIVER=redis
SESSION_DRIVER=redis
```

## 🐳 Deploy no Coolify

### Passo 1: Criar Novo Projeto

1. Acesse seu painel do Coolify
2. Clique em **"New Project"**
3. Escolha **"Docker Compose"**
4. Nomeie o projeto: `colibriplus`

### Passo 2: Configurar Repositório

1. **Source**: Selecione seu repositório Git
2. **Branch**: `main` (ou sua branch principal)
3. **Docker Compose File**: `docker-compose.yml`

### Passo 3: Configurar Variáveis de Ambiente

No Coolify, adicione todas as variáveis do seu `.env`:

```bash
# Copie todas as variáveis do seu .env para o painel do Coolify
APP_NAME=Colibri Plus
APP_ENV=production
APP_KEY=base64:SUA_CHAVE_AQUI
# ... (todas as outras variáveis)
```

### Passo 4: Configurar Domínio (Opcional)

1. **Domain**: `seu-dominio.com`
2. **SSL**: Ativar SSL automático
3. **Force HTTPS**: Ativar

### Passo 5: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build e deploy completar
3. Verifique os logs para garantir que tudo está funcionando

## 🔍 Verificações Pós-Deploy

### 1. Verificar Logs

```bash
# No painel do Coolify, verifique os logs do container principal
# Procure por mensagens como:
# ✅ "Banco de dados disponível!"
# ✅ "Executando migrações..."
# ✅ "Otimizando aplicação..."
# ✅ "Iniciando serviços..."
```

### 2. Testar Funcionalidades

- [ ] Aplicação carrega corretamente
- [ ] Login/Registro funcionando
- [ ] Upload de arquivos funcionando
- [ ] Chat em tempo real funcionando
- [ ] Sistema de pagamentos funcionando

### 3. Verificar Serviços

```bash
# Verificar se todos os containers estão rodando
docker ps

# Deve mostrar:
# - colibriplus-app (aplicação principal)
# - colibriplus-database (MySQL)
# - colibriplus-redis (Redis)
```

## 🛠️ Comandos Úteis

### Acessar Container da Aplicação

```bash
# Via Coolify ou diretamente
docker exec -it colibriplus-app sh

# Executar comandos Laravel
php artisan migrate
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Backup do Banco de Dados

```bash
# Criar backup
docker exec colibriplus-database mysqldump -u root -p colibriplus > backup.sql

# Restaurar backup
docker exec -i colibriplus-database mysql -u root -p colibriplus < backup.sql
```

## 🚨 Troubleshooting

### Problema: Aplicação não carrega

**Solução:**
1. Verificar logs do container
2. Verificar se todas as variáveis de ambiente estão corretas
3. Verificar se o banco de dados está acessível

### Problema: Erro de permissões

**Solução:**
```bash
# Acessar container e corrigir permissões
docker exec -it colibriplus-app sh
chown -R www:www /var/www/html/storage
chown -R www:www /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache
```

### Problema: Assets não carregam

**Solução:**
```bash
# Rebuild dos assets
docker exec -it colibriplus-app sh
npm run build
php artisan storage:link
```

### Problema: Migrações não executam

**Solução:**
```bash
# Executar migrações manualmente
docker exec -it colibriplus-app php artisan migrate --force
```

## 📊 Monitoramento

### Configurar Monitoramento

1. **Health Checks**: Configure health checks no Coolify
2. **Logs**: Monitore logs regularmente
3. **Performance**: Use ferramentas como New Relic ou DataDog
4. **Backup**: Configure backups automáticos do banco

### Métricas Importantes

- CPU e Memória dos containers
- Uso de disco
- Latência da aplicação
- Erros nos logs
- Uptime dos serviços

## 🔄 Atualizações

### Deploy de Atualizações

1. Faça push das alterações para o repositório
2. No Coolify, clique em **"Redeploy"**
3. Aguarde o build e deploy
4. Verifique se tudo está funcionando

### Rollback

Se algo der errado:
1. No Coolify, vá para **"Deployments"**
2. Selecione uma versão anterior
3. Clique em **"Redeploy"**

## 🎯 Otimizações

### Performance

1. **OPcache**: Já configurado no Dockerfile
2. **Redis**: Para cache e sessões
3. **CDN**: Configure um CDN para assets estáticos
4. **Database**: Otimize queries e índices

### Segurança

1. **SSL**: Sempre use HTTPS
2. **Firewall**: Configure firewall no servidor
3. **Updates**: Mantenha dependências atualizadas
4. **Backups**: Configure backups regulares

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Coolify
2. Consulte a documentação do Laravel
3. Verifique a documentação do Coolify
4. Entre em contato com o suporte

**Boa sorte com seu deploy! 🚀**
