import { defineConfig } from 'vitepress'

const ruGuideSidebar = [
  { text: 'Введение', link: '/intro/getting-started' },
  { text: 'Быстрый старт', link: '/intro/quick-start' },
  { text: 'Установка', link: '/intro/installation' },
  { text: 'Конфигурация', link: '/intro/configuration' },
]

const ruGuidesSidebar = [
  { text: 'Работа с флагами', link: '/guide/flags-workflow' },
  { text: 'Таргетинг', link: '/guide/targeting' },
  { text: 'Роллаут', link: '/guide/rollout' },
  { text: 'Аудит', link: '/guide/audit' },
  { text: 'Метрики', link: '/guide/metrics' },
  { text: 'Интеграции', link: '/guide/integrations' },
  { text: 'Лучшие практики', link: '/guide/best-practices' },
]

const ruConceptsSidebar = [
  { text: 'Обзор', link: '/concepts/overview' },
  { text: 'Флаги', link: '/concepts/flags' },
  { text: 'Контексты', link: '/concepts/contexts' },
  { text: 'Сегменты', link: '/concepts/segments' },
  { text: 'Правила активации', link: '/concepts/strategies' },
  { text: 'Окружения', link: '/concepts/environments' },
  { text: 'API-ключи', link: '/concepts/api-keys' },
  { text: 'Пользователи и роли', link: '/concepts/users' },
]

const ruSdkSidebar = [
  { text: 'Обзор SDK', link: '/sdk/overview' },
  { text: 'Java SDK', link: '/sdk/java' },
  { text: 'JavaScript / TypeScript SDK', link: '/sdk/javascript' },
]

const ruApiSidebar = [
  { text: 'Обзор API', link: '/api/overview' },
]

const ruSelfHostingSidebar = [
  { text: 'Docker', link: '/self-hosting/docker' },
  { text: 'База данных', link: '/self-hosting/database' },
  { text: 'Масштабирование', link: '/self-hosting/scaling' },
  { text: 'Мониторинг', link: '/self-hosting/monitoring' },
]

const ruAdvancedSidebar = [
  { text: 'Архитектура', link: '/advanced/architecture' },
  { text: 'Безопасность', link: '/advanced/security' },
  { text: 'Open Core модель', link: '/advanced/open-core' },
  { text: 'Миграция', link: '/advanced/migration' },
  { text: 'ADR', link: '/adr/0001-use-jdbc-template-over-jpa' },
]

const enGuideSidebar = [
  { text: 'Introduction', link: '/en/intro/getting-started' },
  { text: 'Quick Start', link: '/en/intro/quick-start' },
  { text: 'Installation', link: '/en/intro/installation' },
  { text: 'Configuration', link: '/en/intro/configuration' },
]

const enGuidesSidebar = [
  { text: 'Flag Workflow', link: '/en/guide/flags-workflow' },
  { text: 'Targeting', link: '/en/guide/targeting' },
  { text: 'Rollout', link: '/en/guide/rollout' },
  { text: 'Audit', link: '/en/guide/audit' },
  { text: 'Metrics', link: '/en/guide/metrics' },
  { text: 'Integrations', link: '/en/guide/integrations' },
  { text: 'Best Practices', link: '/en/guide/best-practices' },
]

const enConceptsSidebar = [
  { text: 'Overview', link: '/en/concepts/overview' },
  { text: 'Flags', link: '/en/concepts/flags' },
  { text: 'Contexts', link: '/en/concepts/contexts' },
  { text: 'Segments', link: '/en/concepts/segments' },
  { text: 'Activation Rules', link: '/en/concepts/strategies' },
  { text: 'Environments', link: '/en/concepts/environments' },
  { text: 'API Keys', link: '/en/concepts/api-keys' },
  { text: 'Users & Roles', link: '/en/concepts/users' },
]

const enSdkSidebar = [
  { text: 'SDK Overview', link: '/en/sdk/overview' },
  { text: 'Java SDK', link: '/en/sdk/java' },
  { text: 'JavaScript / TypeScript SDK', link: '/en/sdk/javascript' },
]

const enApiSidebar = [
  { text: 'API Overview', link: '/en/api/overview' },
  { text: 'REST API Reference', link: '/en/api/rest' },
]

const enSelfHostingSidebar = [
  { text: 'Docker', link: '/en/self-hosting/docker' },
  { text: 'Database', link: '/en/self-hosting/database' },
  { text: 'Scaling', link: '/en/self-hosting/scaling' },
  { text: 'Monitoring', link: '/en/self-hosting/monitoring' },
]

const enAdvancedSidebar = [
  { text: 'Architecture', link: '/en/advanced/architecture' },
  { text: 'Security', link: '/en/advanced/security' },
  { text: 'Open Core Model', link: '/en/advanced/open-core' },
  { text: 'Migration', link: '/en/advanced/migration' },
]

export default defineConfig({
  title: 'можно.',
  description: 'Documentation for можно. — open-core feature flag management platform',
  base: '/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#3d4f7a' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
  ],

  locales: {
    root: {
      label: 'Русский',
      lang: 'ru',
      dir: 'ltr',
      title: 'можно.',
      description: 'Документация можно. — open-core платформы управления фиче-флагами',

      themeConfig: {
        nav: [
          { text: 'Введение', link: '/intro/getting-started' },
          { text: 'Концепты', link: '/concepts/overview' },
          { text: 'Руководства', link: '/guide/flags-workflow' },
          { text: 'SDK', link: '/sdk/overview' },
          { text: 'API', link: '/api/overview' },
          { text: 'Self-hosting', link: '/self-hosting/docker' },
          { text: 'Advanced', link: '/advanced/architecture' },
        ],

        sidebar: {
          '/intro/': [
            { text: 'Введение', link: '/intro/getting-started' },
            { text: 'Быстрый старт', link: '/intro/quick-start' },
            { text: 'Установка', link: '/intro/installation' },
            { text: 'Конфигурация', link: '/intro/configuration' },
          ],
          '/guide/': [
            { text: 'Работа с флагами', link: '/guide/flags-workflow' },
            { text: 'Таргетинг', link: '/guide/targeting' },
            { text: 'Роллаут', link: '/guide/rollout' },
            { text: 'Аудит', link: '/guide/audit' },
            { text: 'Метрики', link: '/guide/metrics' },
            { text: 'Интеграции', link: '/guide/integrations' },
            { text: 'Лучшие практики', link: '/guide/best-practices' },
          ],
          '/concepts/': [{ text: 'Концепты', items: ruConceptsSidebar }],
          '/sdk/': [{ text: 'SDK', items: ruSdkSidebar }],
          '/api/': [{ text: 'API', items: ruApiSidebar }],
          '/self-hosting/': [{ text: 'Self-hosting', items: ruSelfHostingSidebar }],
          '/advanced/': [{ text: 'Advanced', items: ruAdvancedSidebar }],
          '/adr/': [{ text: 'ADR', items: [
            { text: '0001 — JDBC Template', link: '/adr/0001-use-jdbc-template-over-jpa' },
            { text: '0002 — SPI Open Core', link: '/adr/0002-use-spi-for-open-core' },
            { text: '0003 — JWT over Sessions', link: '/adr/0003-use-jwt-over-sessions' },
          ]}],
        },

        outline: { label: 'На странице' },
        docFooter: { prev: 'Назад', next: 'Далее' },
        darkModeSwitchLabel: 'Тема',
        sidebarMenuLabel: 'Меню',
        returnToTopLabel: 'Наверх',
        langMenuLabel: 'Язык',
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      dir: 'ltr',
      title: 'можно.',
      description: 'Documentation for можно. — open-core feature flag management platform',

      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/intro/getting-started' },
          { text: 'Concepts', link: '/en/concepts/overview' },
          { text: 'Guides', link: '/en/guide/flags-workflow' },
          { text: 'SDK', link: '/en/sdk/overview' },
          { text: 'API', link: '/en/api/overview' },
          { text: 'Self-hosting', link: '/en/self-hosting/docker' },
          { text: 'Advanced', link: '/en/advanced/architecture' },
        ],

        sidebar: {
          '/en/intro/': [
            { text: 'Introduction', link: '/en/intro/getting-started' },
            { text: 'Quick Start', link: '/en/intro/quick-start' },
            { text: 'Installation', link: '/en/intro/installation' },
            { text: 'Configuration', link: '/en/intro/configuration' },
          ],
          '/en/guide/': [
            { text: 'Flag Workflow', link: '/en/guide/flags-workflow' },
            { text: 'Targeting', link: '/en/guide/targeting' },
            { text: 'Rollout', link: '/en/guide/rollout' },
            { text: 'Audit', link: '/en/guide/audit' },
            { text: 'Metrics', link: '/en/guide/metrics' },
            { text: 'Integrations', link: '/en/guide/integrations' },
            { text: 'Best Practices', link: '/en/guide/best-practices' },
          ],
          '/en/concepts/': [{ text: 'Concepts', items: enConceptsSidebar }],
          '/en/sdk/': [{ text: 'SDK', items: enSdkSidebar }],
          '/en/api/': [{ text: 'API', items: enApiSidebar }],
          '/en/self-hosting/': [{ text: 'Self-hosting', items: enSelfHostingSidebar }],
          '/en/advanced/': [{ text: 'Advanced', items: enAdvancedSidebar }],
          '/en/adr/': [{ text: 'ADR', items: [
            { text: '0001 — JDBC Template', link: '/en/adr/0001-use-jdbc-template-over-jpa' },
            { text: '0002 — SPI Open Core', link: '/en/adr/0002-use-spi-for-open-core' },
            { text: '0003 — JWT over Sessions', link: '/en/adr/0003-use-jwt-over-sessions' },
          ]}],
        },

        editLink: {
          text: 'Edit this page',
        },

        outline: { label: 'On this page' },
        docFooter: { prev: 'Previous', next: 'Next' },
        darkModeSwitchLabel: 'Theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top',
        langMenuLabel: 'Language',
      },
    },
  },

  themeConfig: {
    logo: false,
    siteTitle: '',

    search: {
      provider: 'local',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mozhno-dev/mozhno' },
    ],

    editLink: {
      pattern: 'https://github.com/mozhno-dev/mozhno/edit/main/docs/:path',
      text: 'Редактировать страницу',
    },

    footer: {
      message: 'Released under the BSL 1.1 License.',
      copyright: '© 2026 можно.',
    },
  },

  ignoreDeadLinks: [
    /^http:\/\/localhost/,
    /^https?:\/\/localhost/,
    '/swagger-ui',
  ],

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    lineNumbers: true,
    config: (md) => {
      const fence = md.renderer.rules.fence!.bind(md.renderer.rules)
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx]
        if (token.info.trim() === 'mermaid') {
          return `<pre class="mermaid">${md.utils.escapeHtml(token.content)}</pre>`
        }
        return fence(tokens, idx, options, env, slf)
      }
    },
  },

  sitemap: {
    hostname: 'https://docs.mozhno.dev',
  },

  transformHead: async (context: any) => {
    const page: string = context.page
    if (!page) return []

    const isRu = !page.startsWith('en/')
    const title = context.pageData?.title || context.title || 'можно.'
    const description = isRu
      ? 'Документация платформы управления фиче-флагами можно.'
      : 'Feature flag management platform documentation.'

    let urlPath = '/' + page.replace(/\.md$/, '.html')
    urlPath = urlPath.replace(/\/index\.html$/, '/')

    const ruPath = isRu ? urlPath : urlPath.replace('/en', '')
    const enPath = isRu ? '/en' + urlPath : urlPath

    return [
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:locale', content: isRu ? 'ru_RU' : 'en_US' }],
      ['meta', { name: 'description', content: description }],
      ['link', { rel: 'canonical', href: `https://docs.mozhno.dev${urlPath}` }],
      ['link', { rel: 'alternate', hreflang: 'ru', href: `https://docs.mozhno.dev${ruPath}` }],
      ['link', { rel: 'alternate', hreflang: 'en', href: `https://docs.mozhno.dev${enPath}` }],
    ]
  },
})
