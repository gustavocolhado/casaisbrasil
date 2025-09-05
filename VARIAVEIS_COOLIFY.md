# 🔧 Variáveis de Ambiente para Coolify - Colibri Plus

## 📋 Lista Completa de Variáveis

### 🏠 **APLICAÇÃO BÁSICA**

```bash
# Informações da Aplicação
APP_NAME="Colibri Plus"
APP_DESCRIPTION="Social Network Web Application"
APP_KEYWORDS="Social Network, Web Application, Colibri Plus"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://seu-dominio.com
APP_DOCUMENTATION_URL=https://seu-dominio.com
APP_TIMEZONE=America/Sao_Paulo
APP_VERSION=1.0.0
APP_DEFAULT_CURRENCY=BRL

# Localização
APP_LOCALE=pt_BR
ADMIN_LOCALE=pt_BR
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=pt_BR

# Chaves de Segurança
APP_KEY=base64:SUA_CHAVE_AQUI
APP_SALT=seu_salt_aqui
APP_API_KEY=sua_api_key_aqui
APP_PREVIOUS_KEYS=

# Modo de Manutenção
APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

# Admin
ADMIN_EMAIL=admin@seu-dominio.com
ADMIN_PREFIX=admin

# Outros
HIDE_AUTHOR_ATTRIBUTION=false
APP_NEWS_RESOURCE_URL=https://t.me/colibriplus
```

### 🗄️ **BANCO DE DADOS**

```bash
# MySQL
DB_CONNECTION=mysql
DB_HOST=database
DB_PORT=3306
DB_DATABASE=colibriplus
DB_USERNAME=colibriplus_user
DB_PASSWORD=senha_super_segura_123
DB_ROOT_PASSWORD=senha_root_super_segura_123
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
DB_SOCKET=
DB_URL=

# SSL MySQL (opcional)
MYSQL_ATTR_SSL_CA=
```

### 🔴 **REDIS**

```bash
# Redis
REDIS_CLIENT=phpredis
REDIS_CLUSTER=redis
REDIS_PREFIX=colibri_plus_database_
REDIS_URL=
REDIS_HOST=redis
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1
```

### 📧 **EMAIL**

```bash
# Configuração de Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@seu-dominio.com
MAIL_FROM_NAME="Colibri Plus"
MAIL_EHLO_DOMAIN=seu-dominio.com
MAIL_URL=
MAIL_LOG_CHANNEL=
```

### 💳 **PAGAMENTOS**

```bash
# Stripe
STRIPE_ENABLED=true
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta_stripe
STRIPE_PUBLIC_KEY=pk_live_sua_chave_publica_stripe
STRIPE_WEBHOOK_SECRET=whsec_sua_webhook_secret
STRIPE_WEBHOOK_TOLERANCE=300

# PayPal
PAYPAL_ENABLED=false
PAYPAL_CLIENT_ID=
PAYPAL_SECRET_KEY=
PAYPAL_MODE=sandbox

# YooKassa
YOO_KASSA_ENABLED=false
YOO_KASSA_SHOP_ID=
YOO_KASSA_SECRET_KEY=

# Robokassa
ROBOKASSA_ENABLED=false
ROBOKASSA_MERCHANT_LOGIN=
ROBOKASSA_PASS_ONE=
ROBOKASSA_PASS_TWO=
ROBOKASSA_MODE=sandbox
```

### 📱 **SMS (VONAGE)**

```bash
# Vonage SMS
VONAGE_API_KEY=sua_api_key_vonage
VONAGE_API_SECRET=seu_api_secret_vonage
```

### 🔔 **BROADCASTING (REVERB)**

```bash
# Laravel Reverb
BROADCAST_CONNECTION=reverb
REVERB_APP_KEY=reverb_app_key
REVERB_APP_SECRET=reverb_app_secret
REVERB_APP_ID=reverb_app_id
REVERB_HOST=0.0.0.0
REVERB_PORT=443
REVERB_SCHEME=https
```

### 📡 **PUSHER (ALTERNATIVA)**

```bash
# Pusher (se preferir usar Pusher ao invés de Reverb)
PUSHER_APP_ID=seu_pusher_app_id
PUSHER_APP_KEY=seu_pusher_app_key
PUSHER_APP_SECRET=seu_pusher_app_secret
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
```

### 🎥 **FFMPEG**

```bash
# Processamento de Vídeo
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe
FFMPEG_TIMEOUT=3600
FFMPEG_THREADS=12
FFMPEG_TEMP_DIR=/var/ffmpeg-tmp
```

### 📁 **ARQUIVOS**

```bash
# Sistema de Arquivos
FILESYSTEM_DISK=local
```

### 🎯 **CACHE**

```bash
# Cache
CACHE_STORE=redis
CACHE_PREFIX=colibri_plus_cache_
DB_CACHE_TABLE=cache
DB_CACHE_CONNECTION=
DB_CACHE_LOCK_CONNECTION=
REDIS_CACHE_CONNECTION=cache
REDIS_CACHE_LOCK_CONNECTION=default
```

### 📊 **HORIZON**

```bash
# Laravel Horizon
HORIZON_DOMAIN=
HORIZON_PATH=colibrilab/horizon
```

### 📝 **LOGS**

```bash
# Logging
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_DEPRECATIONS_TRACE=false
LOG_STACK=single
LOG_LEVEL=debug
LOG_DAILY_DAYS=14
LOG_SLACK_WEBHOOK_URL=
LOG_SLACK_USERNAME=Laravel Log
LOG_SLACK_EMOJI=:boom:
LOG_PAPERTRAIL_HANDLER=
PAPERTRAIL_URL=
PAPERTRAIL_PORT=
LOG_STDERR_FORMATTER=
LOG_SYSLOG_FACILITY=LOG_USER
VIDEO_PROCESS_LOGGING=false
AUDIO_PROCESS_LOGGING=false

# Log Viewer
LOG_VIEWER_ENABLED=true
LOG_VIEWER_API_ONLY=false
LOG_VIEWER_API_STATEFUL_DOMAINS=
LOG_VIEWER_CACHE_DRIVER=
```

### 🔐 **AUTENTICAÇÃO**

```bash
# Auth
AUTH_GUARD=web
AUTH_PASSWORD_BROKER=users
AUTH_MODEL=App\Models\User
AUTH_PASSWORD_RESET_TOKEN_TABLE=password_reset_tokens
AUTH_PASSWORD_TIMEOUT=10800
```

### 📢 **ANÚNCIOS**

```bash
# Sistema de Anúncios
ADS_NAME=ColibriAds
ADS_MIN_BUDGET=5
ADS_MAX_BUDGET=10000
ADS_DEFAULT_APPROVAL=true
ADS_PRICE_PER_VIEW=0.01
ADS_AD_REFRESH_INTERVAL=30
ADS_CHARGE_INTERVAL=10
```

### 📞 **CONTATOS**

```bash
# Informações de Contato
CONTACTS_EMAIL=contato@seu-dominio.com
CONTACTS_PHONE=+55 11 99999-9999
CONTACTS_ADDRESS="Sua Rua, 123 - São Paulo, SP"
```

### 🔔 **NOTIFICAÇÕES**

```bash
# Notificações
NOTIFICATIONS_EMAIL_ENABLED=true
NOTIFICATIONS_BROADCAST_ENABLED=true
NOTIFICATIONS_PUSH_ENABLED=false
```

### 🌐 **SESSÃO E FILAS**

```bash
# Sessão
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Filas
QUEUE_CONNECTION=redis
```

### 🔒 **SANCTUM**

```bash
# Laravel Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,seu-dominio.com
```

### 🎨 **APARÊNCIA**

```bash
# Configurações de Aparência
APPEARANCE_PRIMARY_COLOR=#3B82F6
APPEARANCE_SECONDARY_COLOR=#6B7280
APPEARANCE_LOGO_URL=
APPEARANCE_FAVICON_URL=
```

### 🏪 **MARKETPLACE**

```bash
# Marketplace
MARKETPLACE_ENABLED=true
MARKETPLACE_COMMISSION_RATE=5
MARKETPLACE_MIN_WITHDRAWAL=50
```

### 📱 **RECURSOS**

```bash
# Recursos da Aplicação
FEATURES_CHAT_ENABLED=true
FEATURES_STORIES_ENABLED=true
FEATURES_MARKETPLACE_ENABLED=true
FEATURES_ADS_ENABLED=true
FEATURES_VERIFICATION_ENABLED=true
```

## 🚀 **Como Configurar no Coolify**

### 1. **Acesse o Painel do Coolify**
- Vá para seu projeto
- Clique em **"Environment Variables"**

### 2. **Adicione as Variáveis**
- Copie cada variável da lista acima
- Cole no campo **"Key"** e **"Value"**
- Clique em **"Add"**

### 3. **Variáveis Obrigatórias (Mínimas)**
Se você quiser começar com o mínimo, configure pelo menos estas:

```bash
APP_NAME="Colibri Plus"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://seu-dominio.com
APP_KEY=base64:SUA_CHAVE_AQUI
DB_CONNECTION=mysql
DB_HOST=database
DB_PORT=3306
DB_DATABASE=colibriplus
DB_USERNAME=colibriplus_user
DB_PASSWORD=senha_super_segura
REDIS_HOST=redis
REDIS_PORT=6379
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha
MAIL_FROM_ADDRESS=noreply@seu-dominio.com
```

### 4. **Gerar APP_KEY**
Se você não tem uma APP_KEY, execute:
```bash
php artisan key:generate
```

### 5. **Testar Configuração**
Após configurar todas as variáveis:
1. Faça o deploy
2. Verifique os logs
3. Teste a aplicação

## ⚠️ **Importante**

- **Nunca** commite o arquivo `.env` no Git
- Use senhas **fortes** para produção
- Configure **SSL** para HTTPS
- Faça **backup** das configurações
- Teste em **ambiente de desenvolvimento** primeiro

## 🔧 **Comandos Úteis**

```bash
# Limpar cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Otimizar para produção
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Executar migrações
php artisan migrate --force

# Criar link simbólico
php artisan storage:link
```

---

**🎯 Com essas variáveis configuradas, sua aplicação Colibri Plus estará pronta para produção no Coolify!**
