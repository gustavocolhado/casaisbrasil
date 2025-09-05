#!/bin/sh

# Aguardar o banco de dados estar disponível
echo "Aguardando banco de dados..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Banco de dados disponível!"

# Executar migrações
echo "Executando migrações..."
php artisan migrate --force

# Limpar e otimizar cache
echo "Otimizando aplicação..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Gerar chave da aplicação se não existir
if [ -z "$APP_KEY" ]; then
    echo "Gerando chave da aplicação..."
    php artisan key:generate --force
fi

# Criar link simbólico para storage se não existir
if [ ! -L public/storage ]; then
    echo "Criando link simbólico para storage..."
    php artisan storage:link
fi

# Definir permissões corretas
chown -R www:www /var/www/html/storage
chown -R www:www /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# Iniciar supervisor
echo "Iniciando serviços..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
