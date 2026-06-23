# Мониторинг и health checks

**можно**<span class=brand-dot>.</span> предоставляет endpoints для проверки здоровья, метрики Prometheus и распределённую трассировку через Spring Boot Actuator и Micrometer.

## Health Check

### Endpoint

```
GET /actuator/health
```

Ответ:

```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

Статусы:
- `UP` — компонент работает нормально
- `DOWN` — компонент недоступен

### Использование в Docker

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health | grep -q UP"]
  interval: 15s
  timeout: 5s
  retries: 3
  start_period: 60s
```

### Использование в Kubernetes

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 60
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
```

## Prometheus-метрики

### Endpoint

```
GET /actuator/prometheus
```

Метрики доступны в формате Prometheus и включают:

| Категория | Примеры метрик |
|-----------|---------------|
| **HTTP-запросы** | `http_server_requests_seconds_count`, `http_server_requests_seconds_sum` |
| **JVM** | `jvm_memory_used_bytes`, `jvm_gc_pause_seconds`, `jvm_threads_live` |
| **HikariCP** | `hikaricp_connections_active`, `hikaricp_connections_pending` |
| **Cache** | `cache_gets_total`, `cache_puts_total`, `cache_evictions_total` |

### Настройка Prometheus

```yaml
scrape_configs:
  - job_name: 'mozhno'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['mozhno:8080']
```

### Key метрики для мониторинга

| Метрика | Что отслеживать |
|---------|-----------------|
| `http_server_requests_seconds_count` | Общее количество запросов |
| `http_server_requests_seconds_sum{status="5.."}` | Ошибки сервера |
| `jvm_memory_used_bytes{area="heap"}` | Использование heap-памяти |
| `hikaricp_connections_active` | Активные соединения с БД (должно быть < `maxSize`) |
| `hikaricp_connections_pending` | Очередь на соединение (должна быть ~0) |

## Распределённая трассировка

**можно**<span class=brand-dot>.</span> использует Micrometer Tracing с Brave. Каждый запрос получает `traceId` и `spanId`, которые передаются в заголовках:

| Заголовок | Описание |
|-----------|----------|
| `X-B3-TraceId` | Идентификатор трассировки |
| `X-B3-SpanId` | Идентификатор спана |

`traceId` также попадает в логи через MDC (ключ `traceId`).

Настройка вероятности сэмплирования:

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MANAGEMENT_TRACING_SAMPLING_PROBABILITY` | `1.0` | Доля трассируемых запросов (0.0–1.0) |

## Логирование

Формат логов: JSON (через Logstash Logback Encoder). Структура записи:

```json
{
  "@timestamp": "2026-06-21T13:41:05.123Z",
  "level": "INFO",
  "logger": "dev.mozhno.flags.FlagService",
  "message": "Flag updated: new-checkout",
  "traceId": "abc123",
  "service": "feature-flags"
}
```

Чувствительные данные (JWT, API-ключи, пароли) автоматически маскируются через `SensitiveDataMasker`.

## Важные переменные окружения

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `LOGGING_LEVEL_DEV_MOZHNO` | `INFO` | Уровень логирования приложения |
| `LOGGING_LEVEL_ROOT` | `INFO` | Корневой уровень логирования |
| `MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE` | `health,info,metrics,prometheus` | Список доступных actuator-эндпоинтов |
| `MANAGEMENT_TRACING_SAMPLING_PROBABILITY` | `1.0` | Доля трассируемых запросов |

## Что дальше?

- [Docker](/self-hosting/docker) — healthcheck и переменные окружения
- [Kubernetes](/self-hosting/kubernetes) — liveness/readiness probes
- [Масштабирование](/self-hosting/scaling) — горизонтальное масштабирование
- [Метрики](/guide/metrics) — метрики использования флагов
