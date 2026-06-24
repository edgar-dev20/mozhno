---
layout: home

hero:
  name: "можно"
  text: Платформа управления фиче-флагами
  tagline: Включайте фичи на продакшене без деплоя. Раскатывайте изменения постепенно, сегментируйте аудиторию — всё из одной панели.

  actions:
    - theme: brand
      text: Быстрый старт
      link: /intro/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/mozhno-dev/mozhno

features:
  - icon:
      src: /icons/rocket.svg
    title: Флаги без деплоя
    details: Включайте и выключайте фичи в продакшене мгновенно. RELEASE для постепенной раскатки, KILLSWITCH для аварийного отключения. Никаких релизных циклов ради одной фичи.
    link: /concepts/flags
    linkText: Как работают флаги
  - icon:
      src: /icons/sdk.svg
    title: Локальная оценка в SDK
    details: SDK оценивают флаги прямо в вашем приложении — никаких сетевых запросов на каждый isEnabled(). Латентность меньше 1 мс, сервер не бутылочное горлышко.
    link: /sdk/overview
    linkText: Смотреть SDK
  - icon:
      src: /icons/targeting.svg
    title: Гибкие правила активации
    details: Процентный роллаут, сегменты, контекстные условия — комбинируйте в одной стратегии. AND-логика для правил, OR-логика для сегментов. Любой сценарий раскатки.
    link: /guide/targeting
    linkText: Про таргетинг
  - icon:
      src: /icons/permissions.svg
    title: Изолированные окружения
    details: Development, Staging, Production — независимые настройки на каждом. Флаг включён у разработчиков, на 10% в проде, выключен в staging. Никаких пересечений.
    link: /concepts/environments
    linkText: Про окружения
  - icon:
      src: /icons/opencore.svg
    title: Аудит каждого изменения
    details: Кто, когда и что изменил — полная история в панели. Каждое действие записано. Никаких «кто это включил в три часа ночи» без ответа.
    link: /guide/audit
    linkText: Про аудит
  - icon:
      src: /icons/deploy.svg
    title: REST API и вебхуки
    details: Автоматизируйте через CI/CD. Меняйте флаги из пайплайна. Интегрируйтесь с Mattermost. Управление флагами без ручного труда.
    link: /guide/integrations
    linkText: Про интеграции
---


