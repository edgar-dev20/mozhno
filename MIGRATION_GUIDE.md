# Database Migration Guide (Flyway)

## Overview
This project uses Flyway for database schema migrations. All migrations are stored in `server/src/main/resources/db/migration/`.

## Migration File Naming Convention
```
V<VERSION>__<DESCRIPTION>.sql
```
Example: `V2__add_user_roles.sql`

## How to Create a New Migration

### 1. Determine the next version number
Check existing migrations in `src/main/resources/db/migration/`:
- `V1__initial_schema.sql` - first version
- Next migration should be `V2__your_change.sql`, then `V3__`, etc.

### 2. Create the migration file
Create a new SQL file with the appropriate version:
```sql
-- V2__add_new_column.sql
ALTER TABLE flags ADD COLUMN new_column VARCHAR(255);
```

### 3. Apply migrations
When the application starts, Flyway automatically applies pending migrations.

To manually apply migrations:
```bash
cd server
./gradlew flywayMigrate
```

## Migration Commands

### Apply pending migrations
```bash
./gradlew flywayMigrate
```

### Check migration status
```bash
./gradlew flywayInfo
```

### Clean (drop all tables) - USE WITH CAUTION
```bash
./gradlew flywayClean
```
⚠️ **Warning**: This will drop ALL tables. Only use in development or as a last resort.

### Repair (fix failed migrations)
```bash
./gradlew flywayRepair
```

## Best Practices

1. **Never modify existing migration files** - Once a migration is applied, it should never be changed. Create a new migration instead.

2. **Always create reversible migrations** - Include rollback scripts when possible.

3. **Test migrations locally first** - Before committing, ensure migrations work with a fresh database.

4. **Use meaningful names** - Describe the change clearly in the filename.

5. **One logical change per migration** - Easier to troubleshoot and rollback if needed.

## Example Workflow for Adding a New Feature

### 1. Update entity
Add new field to your Java entity class.

### 2. Create migration
Create `V2__add_new_field_to_flags.sql`:
```sql
ALTER TABLE flags ADD COLUMN new_field VARCHAR(255);
```

### 3. Restart the application
Flyway will automatically apply the new migration on startup.

## Current Schema (V1)

- `projects` - Projects
- `environments` - Environments per project
- `tags` - Tags per project
- `context_definitions` - Context definitions per project
- `context_values` - Context values
- `flags` - Feature flags
- `flag_strategies` - Flag activation strategies
- `flag_tag_values` - Tag values assigned to flags