# Интеграции

**можно.** поддерживает пользовательские вебхуки — HTTP-запросы, которые сервер отправляет на ваш URL при изменениях в системе.

## Как это работает

При наступлении события (создание/изменение/удаление флага, сегмента, стратегии и т.д.) сервер отправляет HTTP POST на указанный URL. Отправка происходит асинхронно, после коммита транзакции в БД.

Тело запроса формируется по заданному вами шаблону с подстановкой переменных события.

## Настройка вебхука

### Через веб-панель

Раздел **Интеграции** → **Подключить**. Поля:

| Поле | Описание |
|------|----------|
| **Название** | Человекочитаемое имя вебхука |
| **URL** | HTTPS-адрес, куда сервер отправит POST |
| **Заголовки** | Произвольные HTTP-заголовки (JSON-объект). По умолчанию: `Content-Type: application/json` |
| **Тело** | Шаблон тела запроса. Использует переменные события. Без тела — запрос без тела |
| **События** | Какие системные события вызывают отправку |
| **Активен** | Включён / выключен |

### Через REST API

Создание:

```bash
curl -X POST "http://localhost:8080/api/v1/integrations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My webhook",
    "enabled": true,
    "type": "custom_webhook",
    "configJson": "{\"url\":\"https://my-server.example.com/hooks\",\"headers\":{\"Content-Type\":\"application/json\"},\"body\":\"{ \\\"event\\\": \\\"[[events.action]]\\\", \\\"resource\\\": \\\"[[events.resourceName]]\\\" }\"}",
    "eventSubscriptionsJson": "[\"flag.created\",\"flag.updated\",\"flag.archived\"]"
  }'
```

Просмотр:

```bash
curl "http://localhost:8080/api/v1/integrations" \
  -H "Authorization: Bearer $TOKEN"
```

Обновление:

```bash
curl -X PUT "http://localhost:8080/api/v1/integrations/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false, "name": "My webhook", "type": "custom_webhook", "configJson": "...", "eventSubscriptionsJson": "..."}'
```

Удаление:

```bash
curl -X DELETE "http://localhost:8080/api/v1/integrations/1" \
  -H "Authorization: Bearer $TOKEN"
```

## Типы событий

| Событие | Когда |
|---------|-------|
| `flag.created` | Создан новый флаг |
| `flag.updated` | Изменены поля флага |
| `flag.archived` | Флаг отправлен в архив |
| `flag.unarchived` | Флаг восстановлен из архива |
| `flag.deleted` | Флаг удалён |
| `segment.created` | Создан новый сегмент |
| `segment.updated` | Изменены правила сегмента |
| `segment.deleted` | Сегмент удалён |
| `strategy.updated` | Изменена стратегия флага |
| `apikey.created` | Создан API-ключ |
| `apikey.updated` | Изменён API-ключ |
| `apikey.deleted` | API-ключ удалён |
| `environment.created` | Создано окружение |
| `environment.updated` | Изменено окружение |
| `environment.deleted` | Окружение удалено |
| `project.updated` | Изменены настройки проекта |

## Переменные шаблона тела

Подстановки, которые заменяются при отправке вебхука:

- `events.action` — код события (flag.created, flag.updated и т.д.)
- `events.resourceType` — тип ресурса (flag, segment, strategy, apikey, environment, project)
- `events.resourceId` — ID ресурса (число)
- `events.resourceName` — имя/ключ ресурса
- `events.details` — детали изменения (текст)
- `events.projectId` — ID проекта
- `events.user.id` — ID пользователя
- `events.user.name` — имя пользователя
- `events.user.email` — email пользователя
- `events.timestamp` — время события (ISO 8601)

В шаблоне тела переменные обрамляются двойными фигурными скобками.

При передаче JSON-конфига через API используйте двойные квадратные скобки: `[[events.action]]`.

## Особенности

- **HTTPS only** — URL должен использовать HTTPS, без loopback/localhost
- **Таймаут** — 30 секунд на запрос
- **Fire-and-forget** — нет повторных попыток при ошибке. Последняя ошибка сохраняется в `lastError`
- **Асинхронно** — отправка не блокирует пользовательский запрос
- **Лимиты** — количество вебхуков ограничено (зависит от плана)

## Что дальше?

- [REST API](/api/rest) — полная документация по API
- [Аудит](/guide/audit) — история всех изменений
