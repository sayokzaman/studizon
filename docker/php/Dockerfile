FROM composer:2 AS build
WORKDIR /app

RUN apk add --no-cache nodejs npm bash

COPY . .
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader \
    && npm ci \
    && npm run build \
    && rm -rf node_modules

FROM php:8.4-cli-alpine
WORKDIR /var/www/html

RUN apk add --no-cache bash postgresql-dev sqlite-dev \
    && docker-php-ext-install pdo pdo_pgsql pdo_sqlite

COPY --from=build /app /var/www/html

RUN mkdir -p database storage/framework/cache storage/framework/sessions storage/framework/views storage/logs \
    && touch database/database.sqlite \
    && chown -R www-data:www-data storage bootstrap/cache database

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

CMD ["entrypoint.sh"]
