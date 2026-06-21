import { defineConfig } from 'vitepress'

const ruGuideSidebar = [
  { text: 'Введение', link: '/guide/getting-started' },
  { text: 'Быстрый старт', link: '/guide/quick-start' },
  { text: 'Установка', link: '/guide/installation' },
  { text: 'Конфигурация', link: '/guide/configuration' },
]

const ruGuidesSidebar = [
  { text: 'Работа с флагами', link: '/guide/flags-workflow' },
  { text: 'Таргетинг', link: '/guide/targeting' },
  { text: 'Роллаут', link: '/guide/rollout' },
  { text: 'Аудит', link: '/guide/audit' },
  { text: 'Интеграции', link: '/guide/integrations' },
  { text: 'Лучшие практики', link: '/guide/best-practices' },
]

const ruConceptsSidebar = [
  { text: 'Обзор', link: '/concepts/overview' },
  { text: 'Флаги', link: '/concepts/flags' },
  { text: 'Сегменты', link: '/concepts/segments' },
  { text: 'Стратегии', link: '/concepts/strategies' },
  { text: 'Окружения', link: '/concepts/environments' },
]

const ruSdkSidebar = [
  { text: 'Обзор SDK', link: '/sdk/overview' },
  { text: 'Java SDK', link: '/sdk/java' },
  { text: 'JavaScript / TypeScript SDK', link: '/sdk/javascript' },
]

const ruApiSidebar = [
  { text: 'Обзор API', link: '/api/overview' },
  { text: 'REST API Reference', link: '/api/rest' },
]

const ruSelfHostingSidebar = [
  { text: 'Docker', link: '/self-hosting/docker' },
  { text: 'Kubernetes', link: '/self-hosting/kubernetes' },
  { text: 'База данных', link: '/self-hosting/database' },
  { text: 'Масштабирование', link: '/self-hosting/scaling' },
]

const ruAdvancedSidebar = [
  { text: 'Архитектура', link: '/advanced/architecture' },
  { text: 'Open Core модель', link: '/advanced/open-core' },
  { text: 'Миграция', link: '/advanced/migration' },
]

const enGuideSidebar = [
  { text: 'Introduction', link: '/en/guide/getting-started' },
  { text: 'Quick Start', link: '/en/guide/quick-start' },
  { text: 'Installation', link: '/en/guide/installation' },
  { text: 'Configuration', link: '/en/guide/configuration' },
]

const enGuidesSidebar = [
  { text: 'Flag Workflow', link: '/en/guide/flags-workflow' },
  { text: 'Targeting', link: '/en/guide/targeting' },
  { text: 'Rollout', link: '/en/guide/rollout' },
  { text: 'Audit', link: '/en/guide/audit' },
  { text: 'Integrations', link: '/en/guide/integrations' },
  { text: 'Best Practices', link: '/en/guide/best-practices' },
]

const enConceptsSidebar = [
  { text: 'Overview', link: '/en/concepts/overview' },
  { text: 'Flags', link: '/en/concepts/flags' },
  { text: 'Segments', link: '/en/concepts/segments' },
  { text: 'Strategies', link: '/en/concepts/strategies' },
  { text: 'Environments', link: '/en/concepts/environments' },
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
  { text: 'Kubernetes', link: '/en/self-hosting/kubernetes' },
  { text: 'Database', link: '/en/self-hosting/database' },
  { text: 'Scaling', link: '/en/self-hosting/scaling' },
]

const enAdvancedSidebar = [
  { text: 'Architecture', link: '/en/advanced/architecture' },
  { text: 'Open Core Model', link: '/en/advanced/open-core' },
  { text: 'Migration', link: '/en/advanced/migration' },
]

export default defineConfig({
  title: 'можно.',
  description: 'Documentation for можно. — open-core feature flag management platform',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
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
          { text: 'Введение', link: '/guide/getting-started' },
          { text: 'Концепты', link: '/concepts/overview' },
          { text: 'Руководства', link: '/guide/flags-workflow' },
          { text: 'SDK', link: '/sdk/overview' },
          { text: 'API', link: '/api/overview' },
          { text: 'Self-hosting', link: '/self-hosting/docker' },
          { text: 'Advanced', link: '/advanced/architecture' },
        ],

        sidebar: {
          '/guide/': [
            { text: 'Введение', link: '/guide/getting-started' },
            { text: 'Быстрый старт', link: '/guide/quick-start' },
            { text: 'Установка', link: '/guide/installation' },
            { text: 'Конфигурация', link: '/guide/configuration' },
            { text: 'Работа с флагами', link: '/guide/flags-workflow' },
            { text: 'Таргетинг', link: '/guide/targeting' },
            { text: 'Роллаут', link: '/guide/rollout' },
            { text: 'Аудит', link: '/guide/audit' },
            { text: 'Интеграции', link: '/guide/integrations' },
            { text: 'Лучшие практики', link: '/guide/best-practices' },
          ],
          '/concepts/': [{ text: 'Концепты', items: ruConceptsSidebar }],
          '/sdk/': [{ text: 'SDK', items: ruSdkSidebar }],
          '/api/': [{ text: 'API', items: ruApiSidebar }],
          '/self-hosting/': [{ text: 'Self-hosting', items: ruSelfHostingSidebar }],
          '/advanced/': [{ text: 'Advanced', items: ruAdvancedSidebar }],
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
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'Concepts', link: '/en/concepts/overview' },
          { text: 'Guides', link: '/en/guide/flags-workflow' },
          { text: 'SDK', link: '/en/sdk/overview' },
          { text: 'API', link: '/en/api/overview' },
          { text: 'Self-hosting', link: '/en/self-hosting/docker' },
          { text: 'Advanced', link: '/en/advanced/architecture' },
        ],

        sidebar: {
          '/en/guide/': [
            { text: 'Introduction', link: '/en/guide/getting-started' },
            { text: 'Quick Start', link: '/en/guide/quick-start' },
            { text: 'Installation', link: '/en/guide/installation' },
            { text: 'Configuration', link: '/en/guide/configuration' },
            { text: 'Flag Workflow', link: '/en/guide/flags-workflow' },
            { text: 'Targeting', link: '/en/guide/targeting' },
            { text: 'Rollout', link: '/en/guide/rollout' },
            { text: 'Audit', link: '/en/guide/audit' },
            { text: 'Integrations', link: '/en/guide/integrations' },
            { text: 'Best Practices', link: '/en/guide/best-practices' },
          ],
          '/en/concepts/': [{ text: 'Concepts', items: enConceptsSidebar }],
          '/en/sdk/': [{ text: 'SDK', items: enSdkSidebar }],
          '/en/api/': [{ text: 'API', items: enApiSidebar }],
          '/en/self-hosting/': [{ text: 'Self-hosting', items: enSelfHostingSidebar }],
          '/en/advanced/': [{ text: 'Advanced', items: enAdvancedSidebar }],
        },
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
      message: 'Released under the AGPL v3.0 License.',
      copyright: '© 2026 можно.',
    },
  },

  ignoreDeadLinks: [
    /^http:\/\/localhost/,
    /^https?:\/\/localhost/,
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
    const page = context.page
    if (!page || !page.path) return []

    const path = page.path
    const isRu = !path.startsWith('/en')
    const title = page.title || 'можно.'
    const description = isRu
      ? 'Документация платформы управления фиче-флагами можно.'
      : 'Feature flag management platform documentation.'

    return [
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:locale', content: isRu ? 'ru_RU' : 'en_US' }],
      ['meta', { name: 'description', content: description }],
      ['link', { rel: 'alternate', hreflang: 'ru', href: `https://docs.mozhno.dev${isRu ? path : path.replace('/en', '')}` }],
      ['link', { rel: 'alternate', hreflang: 'en', href: `https://docs.mozhno.dev${isRu ? '/en' + path : path}` }],
    ]
  },
})
