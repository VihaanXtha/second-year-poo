FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libxpm-dev \
    libzip-dev \
    libxml2-dev \
    oniguruma-dev \
    mysql-client \
    nodejs \
    npm

RUN docker-php-ext-configure gd --with-jpeg --with-webp --with-xpm
RUN docker-php-ext-install pdo pdo_mysql mbstring exif gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction

COPY . .

RUN composer dump-autoload --no-scripts --no-interaction

RUN mkdir -p /app/storage/framework/{cache,sessions,views} \
    && mkdir -p /app/storage/logs \
    && chmod -R 775 /app/storage

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]