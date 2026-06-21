---
layout: home

hero:
  name: "можно"
  text: Платформа управления фиче-флагами
  tagline: Включайте фичи на продакшене без деплоя. Раскатывайте изменения постепенно, сегментируйте аудиторию — всё из одной панели.

  actions:
    - theme: brand
      text: Быстрый старт
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/mozhno-dev/mozhno

features:
  - icon:
      src: /icons/rocket.svg
    title: Мгновенный запуск
    details: Docker Compose — одна команда, и сервер готов. Веб-панель уже встроена, не нужно настраивать отдельный фронтенд.
    link: /guide/quick-start
    linkText: Запустить за 5 минут
  - icon:
      src: /icons/sdk.svg
    title: Нативные SDK
    details: Java и JavaScript SDK оценивают флаги локально, без сетевых вызовов. Загрузка правил один раз — решение за микросекунды.
    link: /sdk/overview
    linkText: Смотреть SDK
  - icon:
      src: /icons/targeting.svg
    title: Гибкий таргетинг
    details: Булевы и мультивариативные флаги, процентный роллаут, сегменты пользователей, кастомные стратегии — любой сценарий раскатки.
    link: /concepts/flags
    linkText: Изучить возможности
  - icon:
      src: /icons/permissions.svg
    title: Гранулярные права
    details: API-ключи на каждое окружение, JWT-аутентификация, полная история изменений. Контролируйте, кто и когда менял конфигурацию.
    link: /guide/audit
    linkText: Про аудит
  - icon:
      src: /icons/opencore.svg
    title: Open Core
    details: Community-версия с полной функциональностью. Enterprise-расширения (SSO, биллинг, вебхуки) через SPI-плагины без форка.
    link: /advanced/open-core
    linkText: Архитектура
  - icon:
      src: /icons/deploy.svg
    title: Готово к продакшену
    details: Docker, Kubernetes, PostgreSQL. Health checks, HPA, PDB, метрики. Горизонтальное масштабирование без sticky sessions.
    link: /self-hosting/docker
    linkText: Деплой
---


