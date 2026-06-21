---
layout: home

hero:
  name: "можно."
  text: Платформа управления фиче-флагами
  tagline: Включайте фичи на продакшене без деплоя. Раскатывайте изменения постепенно, сегментируйте аудиторию — всё из одной панели.
  image:
    src: /logo.svg
    alt: можно.
  actions:
    - theme: brand
      text: Быстрый старт
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/edgar-dev20/mozhno

features:
  - icon: 🚀
    title: Мгновенный запуск
    details: Docker Compose — одна команда, и сервер готов. Веб-панель уже встроена, не нужно настраивать отдельный фронтенд.
    link: /guide/quick-start
    linkText: Запустить за 5 минут
  - icon: ⚡
    title: Нативные SDK
    details: Java и JavaScript SDK оценивают флаги локально, без сетевых вызовов. Загрузка правил один раз — решение за микросекунды.
    link: /sdk/overview
    linkText: Смотреть SDK
  - icon: 🎯
    title: Гибкий таргетинг
    details: Булевы и мультивариативные флаги, процентный роллаут, сегменты пользователей, кастомные стратегии — любой сценарий раскатки.
    link: /concepts/flags
    linkText: Изучить возможности
  - icon: 🔐
    title: Гранулярные права
    details: API-ключи на каждое окружение, JWT-аутентификация, полная история изменений. Контролируйте, кто и когда менял конфигурацию.
    link: /guide/audit
    linkText: Про аудит
  - icon: 🏗️
    title: Open Core
    details: Community-версия с полной функциональностью. Enterprise-расширения (SSO, биллинг, вебхуки) через SPI-плагины без форка.
    link: /advanced/open-core
    linkText: Архитектура
  - icon: 📦
    title: Готово к продакшену
    details: Docker, Kubernetes, PostgreSQL. Health checks, HPA, PDB, метрики. Горизонтальное масштабирование без sticky sessions.
    link: /self-hosting/docker
    linkText: Деплой
---

## Почему можно.

**можно.** создан для команд, которым нужна скорость и контроль. В отличие от облачных SaaS-решений, вы владеете данными. В отличие от других self-hosted платформ — получаете нативные SDK с локальной оценкой флагов без задержек сети.

### Ключевые отличия

| Возможность | можно. | LaunchDarkly | Unleash | Flagsmith |
|-------------|--------|-------------|---------|-----------|
| Open Source | ✅ AGPL v3 | ❌ Proprietary | ✅ Apache 2 | ✅ BSD |
| Локальная оценка в SDK | ✅ Да | ✅ Да | ❌ Только сервер | ✅ Да |
| Open Core (SPI) | ✅ Да | ❌ | ❌ | ❌ |
| Встроенная веб-панель | ✅ Да | ❌ Отдельно | ✅ Да | ✅ Да |
| Русский язык | ✅ Да | ❌ | ❌ | ❌ |
