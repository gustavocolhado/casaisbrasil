# 🔴 Redis no Coolify - Guia Completo

## 🎯 **O que é Redis e para que serve?**

O Redis é um banco de dados em memória que o Colibri Plus usa para:

- **Cache** - Armazenar dados temporários para melhor performance
- **Sessões** - Gerenciar sessões de usuários
- **Filas** - Processar jobs em background (Laravel Horizon)
- **Broadcasting** - Chat em tempo real
- **Rate Limiting** - Controle de requisições

## 🚀 **Como Configurar Redis no Coolify**

### **Opção 1: Redis como Serviço Separado (Recomendado)**

#### 1. **Criar Serviço Redis no Coolify**

1. No painel do Coolify, vá para **"Resources"**
2. Clique em **"New Resource"**
3. Selecione **"Database"**
4. Escolha **"Redis"**
5. Configure:
   - **Name**: `colibriplus-redis`
   - **Version**: `7-alpine` (mais leve)
   - **Memory**: `512MB` (ou mais se necessário)
   - **Password**: `senha_redis_super_segura`

#### 2. **Conectar ao Projeto Principal**

1. Vá para seu projeto principal
2. Em **"Environment Variables"**, adicione:

```bash
# Redis Configuration
REDIS_CLIENT=phpredis
REDIS_CLUSTER=redis
REDIS_PREFIX=colibri_plus_database_
REDIS_HOST=colibriplus-redis
REDIS_PORT=6379
REDIS_PASSWORD=senha_redis_super_segura
REDIS_DB=0
REDIS_CACHE_DB=1
REDIS_CACHE_CONNECTION=cache
REDIS_CACHE_LOCK_CONNECTION=default

# Cache usando Redis
CACHE_STORE=redis
CACHE_PREFIX=colibri_plus_cache_

# Sessões usando Redis
SESSION_DRIVER=redis

# Filas usando Redis
QUEUE_CONNECTION=redis
```

### **Opção 2: Redis no Docker Compose (Atual)**

Se você quiser manter o Redis no mesmo docker-compose.yml:

```yaml
# No seu docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    container_name: colibriplus-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass senha_redis_super_segura
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - colibriplus-network

volumes:
  redis_data:
    driver: local
```

## 🔧 **Configurações Detalhadas**

### **1. Configuração Básica**

```bash
# Cliente Redis
REDIS_CLIENT=phpredis

# Host e Porta
REDIS_HOST=redis  # ou colibriplus-redis se for serviço separado
REDIS_PORT=6379

# Autenticação
REDIS_PASSWORD=senha_redis_super_segura

# Prefixo para evitar conflitos
REDIS_PREFIX=colibri_plus_database_
```

### **2. Configuração de Cache**

```bash
# Usar Redis para cache
CACHE_STORE=redis
CACHE_PREFIX=colibri_plus_cache_

# Conexões específicas
REDIS_CACHE_CONNECTION=cache
REDIS_CACHE_LOCK_CONNECTION=default
REDIS_CACHE_DB=1
```

### **3. Configuração de Sessões**

```bash
# Usar Redis para sessões
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_SECURE_COOKIE=true
```

### **4. Configuração de Filas**

```bash
# Usar Redis para filas
QUEUE_CONNECTION=redis

# Laravel Horizon
HORIZON_DOMAIN=
HORIZON_PATH=colibrilab/horizon
```

## 📊 **Monitoramento do Redis**

### **1. Verificar Status**

```bash
# Acessar container Redis
docker exec -it colibriplus-redis redis-cli

# Verificar conexões
INFO clients

# Verificar memória
INFO memory

# Verificar chaves
KEYS *

# Sair
exit
```

### **2. Comandos Úteis**

```bash
# Ver todas as chaves
redis-cli KEYS "*"

# Ver chaves específicas
redis-cli KEYS "colibri_plus_*"

# Limpar cache
redis-cli FLUSHDB

# Ver informações do servidor
redis-cli INFO
```

## 🚨 **Troubleshooting**

### **Problema: Redis não conecta**

**Solução:**
1. Verificar se o container Redis está rodando:
   ```bash
   docker ps | grep redis
   ```

2. Verificar logs do Redis:
   ```bash
   docker logs colibriplus-redis
   ```

3. Testar conexão:
   ```bash
   docker exec -it colibriplus-redis redis-cli ping
   ```

### **Problema: Erro de autenticação**

**Solução:**
1. Verificar senha no docker-compose.yml
2. Verificar variável REDIS_PASSWORD
3. Reiniciar containers

### **Problema: Memória insuficiente**

**Solução:**
1. Aumentar memória do container Redis
2. Configurar política de expiração:
   ```bash
   # No redis.conf
   maxmemory 512mb
   maxmemory-policy allkeys-lru
   ```

## 🔒 **Segurança**

### **1. Senha Forte**
```bash
# Use uma senha forte
REDIS_PASSWORD=MinhaSenh@Redis123!@#
```

### **2. Firewall**
- Configure firewall para bloquear acesso externo
- Use apenas conexões internas entre containers

### **3. Backup**
```bash
# Backup do Redis
docker exec colibriplus-redis redis-cli BGSAVE

# Restaurar backup
docker cp backup.rdb colibriplus-redis:/data/
```

## 📈 **Performance**

### **1. Otimizações**

```bash
# Configurações de performance
REDIS_CLIENT=phpredis
REDIS_CLUSTER=redis

# Persistência
REDIS_SAVE="900 1 300 10 60 10000"
```

### **2. Monitoramento**

```bash
# Ver estatísticas
redis-cli INFO stats

# Ver comandos por segundo
redis-cli INFO commandstats
```

## 🎯 **Configuração Completa para Coolify**

### **Variáveis de Ambiente:**

```bash
# Redis Básico
REDIS_CLIENT=phpredis
REDIS_CLUSTER=redis
REDIS_PREFIX=colibri_plus_database_
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=senha_redis_super_segura
REDIS_DB=0
REDIS_CACHE_DB=1

# Cache
CACHE_STORE=redis
CACHE_PREFIX=colibri_plus_cache_
REDIS_CACHE_CONNECTION=cache
REDIS_CACHE_LOCK_CONNECTION=default

# Sessões
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_SECURE_COOKIE=true

# Filas
QUEUE_CONNECTION=redis

# Horizon
HORIZON_DOMAIN=
HORIZON_PATH=colibrilab/horizon
```

## 🚀 **Deploy**

### **1. Com Redis Separado:**
1. Crie o serviço Redis no Coolify
2. Configure as variáveis de ambiente
3. Faça deploy do projeto principal
4. Teste a conexão

### **2. Com Docker Compose:**
1. Atualize o docker-compose.yml
2. Configure as variáveis de ambiente
3. Faça deploy
4. Verifique se todos os containers estão rodando

## ✅ **Verificação**

Após o deploy, verifique:

1. **Redis funcionando:**
   ```bash
   docker exec -it colibriplus-redis redis-cli ping
   # Deve retornar: PONG
   ```

2. **Cache funcionando:**
   ```bash
   php artisan cache:put test "Hello Redis"
   php artisan cache:get test
   # Deve retornar: Hello Redis
   ```

3. **Sessões funcionando:**
   - Faça login na aplicação
   - Verifique se a sessão persiste

4. **Filas funcionando:**
   ```bash
   php artisan queue:work
   # Deve processar jobs
   ```

---

## 🎉 **Resumo**

O Redis no Coolify é essencial para:
- **Performance** - Cache rápido
- **Escalabilidade** - Filas em background
- **Confiabilidade** - Sessões persistentes
- **Tempo Real** - Chat e notificações

Configure corretamente e sua aplicação Colibri Plus terá excelente performance! 🚀
