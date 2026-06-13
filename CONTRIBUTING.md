# Contributing to Mozhno

Спасибо, что решили внести вклад. Следуйте этому гайду — и PR будет принят быстрее.

## Development Setup

```bash
git clone https://github.com/edgar-dev20/mozhno.git
cd mozhno
cp .env.example .env
```

### Server (Spring Boot)

```bash
cd server
./gradlew :mozhno-app:bootRun     # Запуск (требуется PostgreSQL)
./gradlew check                    # Тесты + JaCoCo coverage
```

### Web UI (React)

```bash
cd web
npm ci                             # Установка зависимостей
npm run dev                        # Dev-сервер с HMR (проксирует API на :8080)
npm test                           # Vitest тесты
```

### JS SDK

```bash
cd sdks/js
npm ci
npm run build
npm test
```

### Java SDK

```bash
cd server
./gradlew :mozhno-client-java:build
./gradlew :mozhno-client-java:test
```

## Branching

- `main` — основная ветка, base для всех PR
- `feature/*` — новые фичи
- `fix/*` — багфиксы
- `docs/*` — документация

## Conventional Commits

Формат: `type(scope): message`

| Тип | Когда |
|-----|-------|
| `feat` | Новая фича |
| `fix` | Багфикс |
| `docs` | Только документация |
| `chore` | Зависимости, конфигурация, CI |
| `refactor` | Рефакторинг без изменения поведения |
| `test` | Добавление или исправление тестов |
| `style` | Форматирование, линтер |

Примеры:
- `feat(server): add gradual rollout strategy`
- `fix(web): correct flag evaluation in dark mode`
- `chore(deps): bump postgresql to 42.7`

## Pull Request Process

1. Форк и клон репозитория
2. Установите pre-commit хуки: `pre-commit install`
3. Создайте ветку от `main`: `git checkout -b feature/my-feature`
4. Внесите изменения, добавьте тесты
5. Убедитесь, что тесты и линтеры проходят: `./gradlew check` (server) или `npm test && npm run lint` (web/sdk)
6. Следуйте стилю кода в существующих файлах (4 пробела в Java, 2 пробела в TS/TSX)
7. Коммиты в формате Conventional Commits
8. Создайте PR в `main`

### PR Checklist

- [ ] Код компилируется без ошибок
- [ ] Все тесты проходят
- [ ] Код проходит линтеры (`npm run lint`)
- [ ] Новый код покрыт тестами
- [ ] Нет закомментированного кода или отладочных логов
- [ ] Документация обновлена при необходимости

## Code Style

### Java
- 4 пробела для отступов
- Фигурные скобки на той же строке (K&R)
- `camelCase` для переменных и методов, `PascalCase` для классов

### TypeScript / React
- 2 пробела для отступов
- `camelCase` для переменных и функций
- `PascalCase` для компонентов
- `kebab-case` для имён файлов

## License

Внося свой вклад, вы соглашаетесь с тем, что ваш код будет распространяться под лицензией [GNU AGPL v3.0](LICENSE).
