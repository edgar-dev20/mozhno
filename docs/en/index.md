---
layout: home

hero:
  name: "можно"
  text: Feature Flag Management Platform
  tagline: Ship features without deployment. Roll out changes gradually, segment your audience — all from a single dashboard.

  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/mozhno-dev/mozhno

features:
  - icon:
      src: /icons/rocket.svg
    title: Instant Setup
    details: Docker Compose — one command and the server is ready. The web dashboard is built-in, no separate frontend to configure.
    link: /en/guide/quick-start
    linkText: Start in 5 minutes
  - icon:
      src: /icons/sdk.svg
    title: Native SDKs
    details: Java and JavaScript SDKs evaluate flags locally, no network calls. Rules loaded once — decisions in microseconds.
    link: /en/sdk/overview
    linkText: Explore SDKs
  - icon:
      src: /icons/targeting.svg
    title: Flexible Targeting
    details: Boolean and multivariate flags, percentage rollout, user segments, custom strategies — any rollout scenario.
    link: /en/concepts/flags
    linkText: Learn more
  - icon:
      src: /icons/permissions.svg
    title: Granular Permissions
    details: API keys per environment, JWT authentication, complete audit log. Know who changed what and when.
    link: /en/guide/audit
    linkText: About audit
  - icon:
      src: /icons/opencore.svg
    title: Open Core
    details: Community edition with full functionality. Enterprise extensions (SSO, billing, webhooks) via SPI plugins, no forking.
    link: /en/advanced/open-core
    linkText: Architecture
  - icon:
      src: /icons/deploy.svg
    title: Production Ready
    details: Docker, Kubernetes, PostgreSQL. Health checks, HPA, PDB, metrics. Horizontal scaling without sticky sessions.
    link: /en/self-hosting/docker
    linkText: Deploy
---


