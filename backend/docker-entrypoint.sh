#!/bin/sh

set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until php -r "new PDO('mysql:host=${DB_HOST:-mysql};dbname=${DB_DATABASE:-circuit_bazaar}', '${DB_USERNAME:-circuit}', '${DB_PASSWORD:-circuit}');" 2>/dev/null; do
    sleep 2
done
echo "MySQL is ready!"

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
php artisan db:seed --class=AdminUserSeeder --force
php artisan db:seed --class=VendorUserSeeder --force

# Start the server
echo "Starting server..."
exec php artisan serve --host=0.0.0.0 --port=8000
