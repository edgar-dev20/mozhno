# База данных

Настройка PostgreSQL для **можно.**: миграции Flyway, пул соединений HikariCP, стратегии резервного копирования, откат миграций, версионирование схемы и рекомендации по индексам.

## Архитектура доступа к данным

**можно.** использует прямой доступ к базе данных через Spring `JdbcTemplate` — без JPA, Hibernate или другого ORM. Все SQL-запросы пишутся явно, RowMapper'ы преобразуют строки в Java-объекты. Это даёт:

- Полный контроль над SQL и производительностью запросов
- Отсутствие проблемы N+1, свойственной ORM
- Предсказуемое потребление памяти (нет persistence context)
- Прозрачное выполнение миграций через Flyway

## Создание базы данных

```sql
CREATE USER flags_user WITH PASSWORD 'secure-password';
CREATE DATABASE feature_flags OWNER flags_user;
GRANT ALL PRIVILEGES ON DATABASE feature_flags TO flags_user;
```

В Kubernetes — через StatefulSet или внешний управляемый сервис (Cloud SQL, RDS).

## Flyway-миграции

### Структура миграций

Миграции находятся в `mozhno-app/src/main/resources/db/migration/`:

```
db/migration/
├── V1__initial_schema.sql
├── V2__add_segments.sql
├── V3__add_api_keys.sql
├── V4__add_last_used_at_to_api_keys.sql
├── ...
└── V44__add_context_strict.sql
```

### Соглашение об именовании

```
V<версия>__<описание>.sql
```

- `V` — версионированная миграция (обязательный префикс)
- `<версия>` — целое число с опциональными подверсиями (`V1`, `V2_1`)
- `__` — двойное подчёркивание-разделитель
- `<описание>` — краткое описание изменений, слова разделены подчёркиванием

### Автозапуск

Миграции выполняются автоматически при старте приложения:

```bash
# docker-compose
docker compose up -d

# Kubernetes — поды применяют миграции при запуске
kubectl apply -f k8s/

# Ручной запуск
make migrate
```

Flyway ведёт таблицу `flyway_schema_history` для отслеживания применённых миграций:

| Колонка | Описание |
|---------|----------|
| `version` | Версия миграции |
| `description` | Описание из имени файла |
| `type` | Тип миграции (SQL, Java) |
| `script` | Имя файла миграции |
| `checksum` | Контрольная сумма содержимого |
| `installed_by` | Пользователь БД, применивший миграцию |
| `installed_on` | Дата и время применения |
| `execution_time` | Время выполнения (мс) |
| `success` | Успешность применения |

### Ручной запуск миграций

Если `SPRING_FLYWAY_ENABLED=false`, запустите миграции вручную:

```bash
Миграции Flyway выполняются **автоматически при старте** Spring Boot (через `spring.flyway.enabled=true`). При необходимости можно запустить вручную:

```bash
java -jar mozhno-app.jar --spring.flyway.enabled=true --spring.flyway.migrate=true
```

### Повторяемые миграции

Для обновляемых объектов (представления, хранимые функции) используйте префикс `R`:

```
R__refresh_materialized_view.sql
```

Повторяемые миграции выполняются каждый раз при изменении контрольной суммы, независимо от версии.

## Пул соединений HikariCP

### Конфигурация

| Переменная | По умолчанию | Продакшен | Описание |
|------------|-------------|-----------|----------|
| `HIKARI_MAX_POOL_SIZE` | `10` | `30` | Максимальное число соединений |
| `HIKARI_MIN_IDLE` | `5` | `5` | Минимальное число простаивающих соединений |
| `HIKARI_CONNECTION_TIMEOUT` | `30000` | `30000` | Таймаут получения соединения (мс) |
| `HIKARI_IDLE_TIMEOUT` | `600000` | `600000` | Таймаут бездействия (мс) |
| `HIKARI_MAX_LIFETIME` | `1800000` | `1800000` | Макс. время жизни соединения (мс) |
| `HIKARI_LEAK_DETECTION_THRESHOLD` | `0` | `60000` | Обнаружение утечек соединений (мс) |

### Расчёт размера пула

Формула для определения `maximumPoolSize`:

```
connections = ((core_count * 2) + effective_spindle_count)

Где:
- core_count       = количество ядер CPU
- effective_spindle_count = количество HDD (для SSD ~1)

Пример для 4-ядерного сервера с SSD:
connections = (4 * 2) + 1 = 9
```

Для **можно.** с 8 подами и лимитом 2 ядра на под:

```
Максимум соединений на кластер = 30 (на под) × 8 (подов) = 240
```

Убедитесь, что `max_connections` в PostgreSQL (`postgresql.conf`) превышает это значение с запасом:

```
max_connections = 300
```

### Мониторинг пула

HikariCP предоставляет метрики через JMX и Actuator. Проверка состояния пула:

```bash
curl http://localhost:8080/actuator/health
```

Ответ включает статус БД:

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "SELECT 1",
        "active": 5,
        "max": 30,
        "min": 5
      }
    }
  }
}
```

Настройка leak detection для продакшена:

```
HIKARI_LEAK_DETECTION_THRESHOLD=60000
```

HikariCP будет логировать предупреждения, если соединение не возвращено в пул за 60 секунд.

## Резервное копирование (Backup)

### Логический бэкап: pg_dump

```bash
pg_dump -h localhost -U flags_user -d feature_flags \
  -Fc -f mozhno_backup_$(date +%Y%m%d_%H%M%S).dump
```

| Флаг | Назначение |
|------|------------|
| `-Fc` | Формат custom (сжатый, поддерживает параллельное восстановление) |
| `-f` | Имя выходного файла |
| `-h` | Хост PostgreSQL |
| `-U` | Пользователь |

### Полный бэкап с исключениями

Исключите таблицы, которые можно восстановить:

```bash
pg_dump -h localhost -U flags_user -d feature_flags \
  -Fc \
  -T 'flyway_schema_history' \
  -f mozhno_full_$(date +%Y%m%d).dump
```

### Инкрементальный бэкап (WAL-архивация)

Для минимизации потери данных при сбое настройте непрерывное архивирование WAL в `postgresql.conf`:

```
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /archive/%f && cp %p /archive/%f'
```

Стратегия восстановления (Point-in-Time Recovery):

```bash
# 1. Восстановить полный бэкап
pg_restore -h localhost -U flags_user -d feature_flags mozhno_full.dump

# 2. Применить WAL до нужной точки
# recovery.conf:
restore_command = 'cp /archive/%f %p'
recovery_target_time = '2026-06-21 14:00:00'
```

### Kubernetes CronJob для бэкапов

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mozhno-backup
spec:
  schedule: '0 2 * * *'
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: postgres:15-alpine
              command:
                - /bin/sh
                - -c
                - |
                  pg_dump -h postgres.db.svc.cluster.local \
                    -U $(PGUSER) -d feature_flags -Fc \
                    -f /backups/mozhno_$(date +%Y%m%d_%H%M%S).dump
              env:
                - name: PGUSER
                  valueFrom:
                    secretKeyRef:
                      name: mozhno-secrets
                      key: SPRING_DATASOURCE_USERNAME
                - name: PGPASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: mozhno-secrets
                      key: SPRING_DATASOURCE_PASSWORD
              volumeMounts:
                - name: backup
                  mountPath: /backups
          volumes:
            - name: backup
              persistentVolumeClaim:
                claimName: mozhno-backups
```

### Восстановление из бэкапа

```bash
pg_restore -h localhost -U flags_user -d feature_flags \
  -c --if-exists mozhno_backup_20260621_020000.dump
```

| Флаг | Назначение |
|------|------------|
| `-c` | Удалить существующие объекты перед созданием |
| `--if-exists` | Использовать `IF EXISTS` при удалении |
| `-d` | Целевая база данных |

## Откат миграций (Rollback)

Flyway не поддерживает автоматический откат миграций. Для отката используйте ручные undo-миграции:

### Стратегия 1: Undo-миграции

Создайте парную миграцию для каждого изменения:

```
V8__add_column_priority.sql
U8__drop_column_priority.sql
```

Примените undo-миграцию вручную:

```bash
./gradlew :mozhno-app:flywayUndo
```

### Стратегия 2: Repair

Если миграция находится в процессе (в статусе `pending` или `failed`), исправьте её вручную и выполните repair:

```bash
./gradlew :mozhno-app:flywayRepair
```

### Стратегия 3: Ручной откат через SQL

Примените обратные DDL-запросы вручную и обновите таблицу `flyway_schema_history`:

```sql
BEGIN;
  ALTER TABLE flags DROP COLUMN priority;
  DELETE FROM flyway_schema_history WHERE version = '8';
COMMIT;
```

## Версионирование схемы

Каждый релиз **можно.** включает новую версию схемы базы данных. Миграции накапливаются последовательно и никогда не изменяются задним числом — это гарантирует воспроизводимость развёртывания на любой версии.

| Версия схемы | Версия можно. | Основные изменения |
|--------------|-------------|--------------------|
| V1 | 1.0 | Начальная схема: флаги, окружения |
| V2 | 1.1 | Сегменты и правила таргетинга |
| V3 | 1.2 | Стратегии роллаута |
| V4 | 1.3 | Аудит-лог изменений |
| V5 | 2.0 | API-ключи и гранулярные права |
| V6 | 2.1 | Refresh-токены и семейная ротация |
| V7 | 2.2 | Реестр плагинов и слоты расширений |

## Рекомендации по индексам

### Критические индексы (создаются миграциями)

```sql
-- Поиск флага по ключу и окружению (основной путь SDK)
CREATE INDEX idx_flags_env_key ON flags (environment_id, flag_key);

-- Поиск правил стратегий по флагу
CREATE INDEX idx_strategy_rules_flag ON strategy_rules (flag_id);

-- Поиск сегментов по окружению
CREATE INDEX idx_segments_env ON segments (environment_id);

-- Аудит-лог по времени (сортировка в UI)
CREATE INDEX idx_audit_log_timestamp ON audit_log (created_at DESC);

-- Поиск refresh-токенов по хешу
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);

-- API-ключи по окружению
CREATE INDEX idx_api_keys_env ON api_keys (environment_id);
```

### Рекомендации по производительности

1. **Анализируйте план запросов** с помощью `EXPLAIN ANALYZE` перед добавлением индекса
2. **Используйте частичные индексы** для запросов с WHERE-условиями:
   ```sql
   CREATE INDEX idx_active_flags ON flags (flag_key)
     WHERE archived = false;
   ```
3. **Обновляйте статистику** после массовых изменений:
   ```sql
   ANALYZE flags;
   ANALYZE strategy_rules;
   ```
4. **Мониторьте использование индексов**:
   ```sql
   SELECT schemaname, tablename, indexrelname, idx_scan, idx_tup_read
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY idx_scan DESC;
   ```
5. **Избегайте избыточных индексов** — каждый индекс замедляет INSERT/UPDATE/DELETE

## Подключение с SSL

Для защищённого соединения с PostgreSQL:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/feature_flags?ssl=true&sslmode=require
```

Параметры `sslmode`:

| Режим | Защита | Описание |
|-------|--------|----------|
| `disable` | Нет | Без шифрования (только разработка) |
| `require` | Да | Требуется SSL, сертификат не проверяется |
| `verify-ca` | Да | SSL + проверка сертификата CA |
| `verify-full` | Да | SSL + проверка сертификата и имени хоста |

Для продакшен-окружения используйте `verify-full`. Для этого потребуется импортировать CA-сертификат в truststore JVM.

## Что дальше?

- [Docker](/self-hosting/docker) — контейнеризация PostgreSQL и приложения
- [Kubernetes](/self-hosting/kubernetes) — StatefulSet, PV, PVC для продакшен-окружения
- [Масштабирование](/self-hosting/scaling) — sizing пула соединений при горизонтальном масштабировании
- [Конфигурация](/guide/configuration) — все переменные окружения для БД
