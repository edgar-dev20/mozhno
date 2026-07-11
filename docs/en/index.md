---
layout: home

hero:
  name: "можно"
  text: Feature Flag Management Platform
  tagline: Ship features without deployment. Gradual rollouts, audience segments, full audit trails — from a single dashboard.

  actions:
    - theme: brand
      text: Get Started
      link: /en/intro/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/mozhno-dev/mozhno

features:
  - icon:
      src: /icons/rocket.svg
    title: Flags Without Deployment
    details: Toggle features in production instantly. RELEASE for gradual rollout, KILLSWITCH for emergency shutdown. No release cycles for a single feature.
    link: /en/concepts/flags
    linkText: How flags work
  - icon:
      src: /icons/sdk.svg
    title: Local Evaluation in SDK
    details: SDKs evaluate flags inside your application — no network calls on every isEnabled(). Sub-millisecond latency, server is not a bottleneck.
    link: /en/sdk/overview
    linkText: Explore SDKs
  - icon:
      src: /icons/targeting.svg
    title: Flexible Activation Rules
    details: Percentage rollout, segments, context constraints — combine in a single strategy. AND logic for constraints, OR logic for segments. Any rollout scenario.
    link: /en/guide/targeting
    linkText: About targeting
  - icon:
      src: /icons/permissions.svg
    title: Isolated Environments
    details: Development, Staging, Production — independent settings per environment. Flag on for developers, at 10% in prod, off in staging. No cross-environment leaks.
    link: /en/concepts/environments
    linkText: About environments
  - icon:
      src: /icons/opencore.svg
    title: Complete Audit Trail
    details: Who changed what and when — full history in the dashboard. Every action is recorded. No «who turned this on at 3 AM» without an answer.
    link: /en/guide/audit
    linkText: About audit
  - icon:
      src: /icons/deploy.svg
    title: REST API and Webhooks
    details: Automate via CI/CD. Toggle flags from your pipeline. Integrate with Mattermost. Manage flags without manual work.
    link: /en/guide/integrations
    linkText: About integrations
---


