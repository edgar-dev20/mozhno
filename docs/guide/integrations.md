# Интеграции

**можно.** интегрируется с вашим CI/CD, системами мониторинга и оповещений через **вебхуки** и REST API.

## Вебхуки

Вебхуки позволяют **можно.** отправлять HTTP-запросы на ваши endpoints при наступлении событий в системе.

### Создание вебхука

1. Перейдите в **Настройки → Вебхуки**.
2. Нажмите **«Создать вебхук»**.
3. Заполните поля:

| Поле | Обязательно | Описание |
|------|-------------|----------|
| **URL** | Да | Endpoint, на который будут приходить запросы |
| **Секрет** | Да | Подпись для верификации запросов. Генерируется автоматически. |
| **События** | Да | Какие события отправлять |
| **Активен** | Нет | Включён / выключен |

### Типы событий

| Событие | Описание | Полезная нагрузка |
|---------|----------|-------------------|
| `flag.created` | Создан новый флаг | `{ flagKey, flagName, flagType, createdBy }` |
| `flag.updated` | Изменены настройки флага (стратегия, правила, таргетинг) | `{ flagKey, changes, updatedBy }` |
| `flag.archived` | Флаг отправлен в архив | `{ flagKey, archivedBy }` |
| `flag.restored` | Флаг восстановлен из архива | `{ flagKey, restoredBy }` |
| `flag.deleted` | Флаг удалён | `{ flagKey, deletedBy }` |
| `segment.created` | Создан новый сегмент | `{ segmentKey, segmentName, createdBy }` |
| `segment.updated` | Изменены правила сегмента | `{ segmentKey, changes, updatedBy }` |
| `segment.deleted` | Сегмент удалён | `{ segmentKey, deletedBy }` |
| `apikey.created` | Создан API-ключ | `{ keyId, environment, createdBy }` |
| `apikey.revoked` | API-ключ отозван | `{ keyId, revokedBy }` |
| `environment.created` | Создано новое окружение | `{ envKey, envName, createdBy }` |
| `environment.deleted` | Окружение удалено | `{ envKey, deletedBy }` |

### Формат вебхука

Каждый вебхук — это HTTP `POST` запрос с JSON-телом:

```http
POST /your-webhook-endpoint HTTP/1.1
Host: your-server.example.com
Content-Type: application/json
X-Mozhno-Event: flag.updated
X-Mozhno-Signature: sha256=abcd1234...
X-Mozhno-Delivery: 550e8400-e29b-41d4-a716-446655440000
User-Agent: Mozhno-Webhook/1.0
```

```json
{
  "event": "flag.updated",
  "timestamp": "2026-06-21T13:41:05Z",
  "delivery": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "flagKey": "new-checkout",
    "flagName": "Новый чекаут",
    "environment": "production",
    "changes": {
      "strategy": {
        "type": "gradual",
        "percentage": { "from": 25, "to": 50 }
      }
    },
    "updatedBy": "admin@example.com"
  }
}
```

### Верификация подписи

Каждый вебхук подписан HMAC-SHA256. Секрет задаётся при создании вебхука.

```java
// Проверка подписи вебхука на стороне получателя
public boolean verifySignature(String payload, String signatureHeader, String secret) {
    String computed = "sha256=" + HmacUtils.hmacSha256Hex(secret, payload);
    return MessageDigest.isEqual(
        computed.getBytes(StandardCharsets.UTF_8),
        signatureHeader.getBytes(StandardCharsets.UTF_8)
    );
}
```

```typescript
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const computed = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}
```

> **Совет:** Всегда проверяйте подпись вебхука перед обработкой. Это защищает от поддельных запросов.

### Повторная отправка

Если ваш сервер возвращает код **не из семейства 2xx**, **можно.** повторяет отправку:

| Попытка | Задержка |
|---------|----------|
| 1 | Мгновенно |
| 2 | 30 секунд |
| 3 | 2 минуты |
| 4 | 10 минут |
| 5 | 30 минут |

После 5 неудачных попыток вебхук помечается как недоставленный. Вы можете переотправить его вручную из панели управления.

### Тестирование вебхуков

На странице вебхука нажмите **«Отправить тестовый запрос»**. Система отправит тестовое событие `ping`:

```json
{
  "event": "ping",
  "timestamp": "2026-06-21T13:41:05Z",
  "delivery": "test-550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "message": "Тестовый вебхук от можно.",
    "webhookId": "wh_abc123"
  }
}
```

## CI/CD интеграция

### GitHub Actions

#### Обновление процента роллаута

```yaml
# .github/workflows/rollout.yml
name: Gradual Rollout
on:
  workflow_dispatch:
    inputs:
      flag_key:
        description: 'Ключ флага'
        required: true
        type: string
      percentage:
        description: 'Процент роллаута (0-100)'
        required: true
        type: number
      environment:
        description: 'Окружение (dev, staging, production)'
        required: true
        type: choice
        options:
          - dev
          - staging
          - production
        default: 'staging'

jobs:
  rollout:
    runs-on: ubuntu-latest
    steps:
      - name: Установить процент роллаута
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" \
            -X PATCH "${{ secrets.MOZHNO_URL }}/api/v1/flags/${{ github.event.inputs.flag_key }}/strategies" \
            -H "Authorization: Bearer ${{ secrets.MOZHNO_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d "{\"type\": \"gradual\", \"percentage\": ${{ github.event.inputs.percentage }}, \"environment\": \"${{ github.event.inputs.environment }}\"}")

          if [ "$response" -ne 200 ]; then
            echo "Ошибка: HTTP $response"
            exit 1
          fi
          echo "Флаг ${{ github.event.inputs.flag_key }} обновлён до ${{ github.event.inputs.percentage }}% на ${{ github.event.inputs.environment }}"
```

#### Включение флага при деплое

```yaml
# .github/workflows/deploy.yml
name: Deploy and Enable Flag
on:
  push:
    branches: [main]
    paths:
      - 'src/features/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Деплой
        run: ./deploy.sh

      - name: Включить флаг на staging
        run: |
          curl -X PATCH "${{ secrets.MOZHNO_URL }}/api/v1/flags/${{ env.FLAG_KEY }}/strategies" \
            -H "Authorization: Bearer ${{ secrets.MOZHNO_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"type": "default", "value": true, "environment": "staging"}'
```

#### Проверка состояния флагов перед релизом

```yaml
# .github/workflows/pre-release-check.yml
name: Pre-Release Flag Check
on:
  pull_request:
    types: [opened, synchronize]
    branches: [main]

jobs:
  check-flags:
    runs-on: ubuntu-latest
    steps:
      - name: Проверить состояние production-флагов
        run: |
          flags=$(curl -s "${{ secrets.MOZHNO_URL }}/api/v1/flags?environment=production" \
            -H "Authorization: Bearer ${{ secrets.MOZHNO_TOKEN }}")

          # Проверить, что нет флагов в статусе "роллаут" (не 0% и не 100%)
          echo "$flags" | jq -r '.[] | select(.rolloutPercentage > 0 and .rolloutPercentage < 100) | "⚠ \(.key): \(.rolloutPercentage)%"'

          # Проверить флаги без описания
          echo "$flags" | jq -r '.[] | select(.description == null or .description == "") | "📝 \(.key): нет описания"'
```

### GitLab CI

```yaml
# .gitlab-ci.yml
rollout_flag:
  stage: deploy
  when: manual
  variables:
    FLAG_KEY: "new-feature"
    PERCENTAGE: "10"
    ENVIRONMENT: "production"
  script:
    - |
      curl -X PATCH "${MOZHNO_URL}/api/v1/flags/${FLAG_KEY}/strategies" \
        -H "Authorization: Bearer ${MOZHNO_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"type\": \"gradual\", \"percentage\": ${PERCENTAGE}, \"environment\": \"${ENVIRONMENT}\"}"
```

### Jenkins

```groovy
// Jenkinsfile
pipeline {
    agent any
    parameters {
        choice(name: 'FLAG_KEY', choices: ['new-checkout', 'ai-search', 'dark-mode'], description: 'Ключ флага')
        string(name: 'PERCENTAGE', defaultValue: '10', description: 'Процент роллаута')
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'production'], description: 'Окружение')
    }
    stages {
        stage('Rollout') {
            steps {
                sh """
                    curl -X PATCH "${MOZHNO_URL}/api/v1/flags/${params.FLAG_KEY}/strategies" \
                        -H "Authorization: Bearer ${MOZHNO_TOKEN}" \
                        -H "Content-Type: application/json" \
                        -d '{"type": "gradual", "percentage": ${params.PERCENTAGE}, "environment": "${params.ENVIRONMENT}"}'
                """
            }
        }
    }
}
```

## Интеграция с оповещениями

### Slack

```yaml
# .github/workflows/slack-flag-notify.yml
name: Notify Slack on Flag Changes
on:
  repository_dispatch:
    types: [mozhno-webhook]

jobs:
  slack:
    runs-on: ubuntu-latest
    steps:
      - name: Отправить в Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "channel": "#feature-flags",
              "text": "🔄 Флаг `${{ github.event.client_payload.data.flagKey }}` изменён",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Флаг:* `${{ github.event.client_payload.data.flagKey }}`\n*Окружение:* ${{ github.event.client_payload.data.environment }}\n*Изменил:* ${{ github.event.client_payload.data.updatedBy }}\n*Изменения:* ${{ toJson(github.event.client_payload.data.changes) }}"
                  }
                }
              ]
            }
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### Microsoft Teams

Настройте вебхук **можно.** → Incoming Webhook в Teams:

```
URL вебхука: https://mycompany.webhook.office.com/webhookb2/...
События: flag.updated, flag.archived, flag.deleted
```

Формат сообщения будет автоматически адаптирован под Teams (Adaptive Card).

## Интеграция с мониторингом

### Datadog

```yaml
# .github/workflows/datadog-flag-metric.yml
name: Flag Change to Datadog
on:
  repository_dispatch:
    types: [mozhno-webhook]

jobs:
  datadog:
    runs-on: ubuntu-latest
    steps:
      - name: Отправить событие в Datadog
        run: |
          curl -X POST "https://api.datadoghq.com/api/v1/events" \
            -H "DD-API-KEY: ${{ secrets.DD_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "title": "Flag updated: ${{ github.event.client_payload.data.flagKey }}",
              "text": "Flag ${{ github.event.client_payload.data.flagKey }} was updated to ${{ toJson(github.event.client_payload.data.changes) }} by ${{ github.event.client_payload.data.updatedBy }}",
              "alert_type": "info",
              "tags": ["feature-flag", "environment:${{ github.event.client_payload.data.environment }}", "flag:${{ github.event.client_payload.data.flagKey }}"]
            }'
```

### Prometheus / Grafana

Используйте custom metrics в приложении для отслеживания оценок флагов:

```java
// Отправка метрики при каждой оценке флага
if (client.isFlagEnabled("new-feature", ctx)) {
    meterRegistry.counter("feature_flag.evaluation",
        "flag", "new-feature",
        "result", "enabled"
    ).increment();
}
```

В Grafana настройте дашборд с панелями:
- Количество оценок флага в секунду
- Соотношение enabled/disabled
- Распределение по вариантам (для мультивариативных флагов)

## Что дальше?

- [REST API](/api/rest) — полная документация по API
- [Аудит](/guide/audit) — история всех изменений
- [Роллаут](/guide/rollout) — стратегии постепенной раскатки
- [Self-hosting](/self-hosting/docker) — деплой сервера
