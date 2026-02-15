#!/usr/bin/env sh
set -e

until php artisan migrate --force; do
  echo "Database not ready yet. Retrying in 3 seconds..."
  sleep 3
done

# Optional production-safe seeding.
if [ "${RUN_SEEDERS:-false}" = "true" ]; then
  php artisan db:seed --class=Database\\Seeders\\ProductionSeeder --force
  php artisan db:seed --class=Database\\Seeders\\AdminSeeder --force
fi

# Optional full seeders for local/dev only (uses factories/Faker).
if [ "${RUN_FULL_SEEDERS:-false}" = "true" ]; then
  php artisan db:seed --force
fi

exec php artisan serve --host=0.0.0.0 --port=8000
