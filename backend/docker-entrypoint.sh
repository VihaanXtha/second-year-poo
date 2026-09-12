#!/bin/sh

set -e

# Check database driver
DB_CONNECTION=$(grep -o '^DB_CONNECTION=[^ ]*' /app/.env 2>/dev/null | cut -d= -f2 || echo "sqlite")

if [ "$DB_CONNECTION" = "mysql" ]; then
    echo "Waiting for MySQL to be ready..."
    DB_HOST=$(grep -o '^DB_HOST=[^ ]*' /app/.env 2>/dev/null | cut -d= -f2 || echo "mysql")
    DB_DATABASE=$(grep -o '^DB_DATABASE=[^ ]*' /app/.env 2>/dev/null | cut -d= -f2 || echo "circuit_bazaar")
    DB_USERNAME=$(grep -o '^DB_USERNAME=[^ ]*' /app/.env 2>/dev/null | cut -d= -f2 || echo "circuit")
    DB_PASSWORD=$(grep -o '^DB_PASSWORD=[^ ]*' /app/.env 2>/dev/null | cut -d= -f2 || echo "circuit")
    until php -r "new PDO('mysql:host=${DB_HOST};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
        sleep 2
    done
    echo "MySQL is ready!"
else
    echo "Using SQLite database, skipping MySQL wait..."
    mkdir -p /app/storage/framework/{cache,sessions,views} /app/storage/logs /app/database
    chmod -R 775 /app/storage /app/database
fi

# Create .env if it doesn't exist
if [ ! -f /app/.env ]; then
    echo "Creating .env file..."
    cp /app/.env.example /app/.env
fi

# Generate APP_KEY if not set
if ! grep -q "^APP_KEY=" /app/.env || grep -q "^APP_KEY=$" /app/.env; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Run seeders
echo "Seeding database..."
php artisan db:seed --force

# Start the server
echo "Starting server..."
exec php artisan serve --host=0.0.0.0 --port=8000