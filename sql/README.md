# Database Docker Setup

This folder contains the Docker configuration for the MySQL database and phpMyAdmin.

## Services

- **MySQL 8.0** on `localhost:3306`
- **phpMyAdmin** on `localhost:8081`

## Quick Start

```bash
# Start database and phpMyAdmin
cd sql
docker compose up -d

# Stop database and phpMyAdmin
cd sql
docker compose down

# View logs
cd sql
docker compose logs -f

# Check status
cd compose ps
```

## Access

- **MySQL**: `localhost:3306`
  - Username: `circuit`
  - Password: `circuit`
  - Database: `circuit_bazaar`

- **phpMyAdmin**: http://localhost:8081
  - Username: `circuit` or `root`
  - Password: `circuit` or `root`

## Data Persistence

MySQL data is stored in a Docker volume named `mysql_data`. This persists even if containers are removed.

To backup:
```bash
docker compose exec mysql mysqldump -u circuit -p circuit_bazaar > backup.sql
```

To restore:
```bash
docker compose exec -T mysql mysql -u circuit -p circuit_bazaar < backup.sql
```

## Initialization

Any `.sql` or `.sh` file in the `init/` folder will be executed automatically when the MySQL container starts for the first time.

## Credentials

Default credentials are set in `docker-compose.yml`. Change them if needed for production.

## Connection from Backend

Backend `.env` should use:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=circuit_bazaar
DB_USERNAME=circuit
DB_PASSWORD=circuit
```
