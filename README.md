# Feature Flags Service

## Quick Start

### 1. Start PostgreSQL
```bash
docker-compose up -d
```

### 2. Run migrations & server
```bash
cd server
./gradlew flywayMigrate bootRun
```

Server starts at http://localhost:8080

### 3. Open UI
Open http://localhost:8080 in your browser

## Database Migrations

Migrations are managed by **Flyway**. All migration files are in `server/src/main/resources/db/migration/`.

### Commands
```bash
./gradlew flywayMigrate   # Apply pending migrations
./gradlew flywayInfo      # Check migration status
./gradlew flywayClean     # Drop all tables (dev only!)
./gradlew flywayRepair     # Repair failed migrations
```

### Creating a New Migration
1. Create file: `V2__your_change.sql` in `db/migration/`
2. Add SQL: `ALTER TABLE flags ADD COLUMN new_field VARCHAR(255);`
3. Restart server - migration applies automatically

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed instructions.

## API Documentation
Swagger UI: http://localhost:8080/swagger-ui.html

## Database
- Host: localhost:5432
- Database: feature_flags
- User: flags_user
- Password: flags_password

## pgAdmin (PostgreSQL UI)
- URL: http://localhost:5050
- Email: admin@admin.com
- Password: admin
- Connect: Right-click "Servers" → Create → Server → Host: postgres, Port: 5432