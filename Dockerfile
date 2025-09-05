# Multi-stage build para otimizar o tamanho da imagem
FROM node:20-alpine AS node-builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências Node.js
RUN npm ci

# Copiar arquivos de recursos
COPY resources/ ./resources/
COPY vite.config.js ./
COPY tailwind.config.js ./

# Build dos assets
RUN npm run build

# Estágio principal - PHP
FROM php:8.3-fpm-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    redis \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    sqlite-dev \
    openssl-dev \
    ffmpeg \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        pdo_mysql \
        mysqli \
        intl \
        mbstring \
        pcntl \
        zip \
        opcache \
        bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar usuário
RUN addgroup -g 1000 -S www && \
    adduser -u 1000 -D -S -G www www

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar arquivos do projeto
COPY --chown=www:www . .

# Copiar assets buildados do estágio anterior
COPY --from=node-builder --chown=www:www /app/public/build ./public/build

# Criar diretórios necessários do Laravel
RUN mkdir -p /var/www/html/bootstrap/cache \
    && mkdir -p /var/www/html/storage/app \
    && mkdir -p /var/www/html/storage/framework/cache \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/logs

# Instalar dependências PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Configurar permissões
RUN chown -R www:www /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Configurar PHP
COPY docker/colibriplus/php.ini /usr/local/etc/php/conf.d/99-custom.ini
COPY docker/colibriplus/opcache.ini /usr/local/etc/php/conf.d/99-opcache.ini

# Configurar Nginx
COPY docker/nginx/conf.d/nginx.conf /etc/nginx/http.d/default.conf

# Configurar Supervisor
RUN mkdir -p /etc/supervisor/conf.d
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Script de inicialização
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expor porta
EXPOSE 80

# Comando de inicialização
ENTRYPOINT ["/entrypoint.sh"]
