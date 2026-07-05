# ADR-0002: Use SPI for Open Core Architecture

**Date:** 2026-06-12
**Status:** Accepted

## Context

Mozhno использует модель Open Core: community edition с полной функциональностью +
возможность подключения enterprise-расширений (SSO, аудит, биллинг, квоты, вебхуки).

Нужен механизм, позволяющий заменять реализации без форка кодовой базы, с приоритетами
и поддержкой нескольких провайдеров одновременно.

## Decision

Использован **Service Provider Interface (SPI)** — набор Java-интерфейсов в модуле
`mozhno-spi`, которые реализуются в `mozhno-core` (дефолтные реализации) или во внешних
JAR-файлах (enterprise-расширения).

Spring автоматически собирает все бины, реализующие SPI-интерфейсы, через `List<SPI>`.
Провайдеры сортируются по `priority()` и пробуются по цепочке.

## Consequences

**Позитивные:**
- Zero-cost для community edition: дефолтные реализации всегда доступны.
- Enterprise-расширения — это обычные Spring-бины в отдельном JAR. Никакой магии с
  classpath, plugin-системами или OSGi.
- Приоритеты гарантируют детерминированный порядок: custom-провайдер может перехватить
  запрос до дефолтного.
- Тестируемость: каждый SPI можно замокать независимо.

**Негативные:**
- Нельзя гарантировать порядок загрузки нескольких enterprise-JAR (решается приоритетами).
- Сложность отладки: цепочка провайдеров может быть длинной.

## Examples

- `AuthenticationProviderSpi` — цепочка: JWT → API Key → (SSO/LDAP в enterprise)
- `AuthenticationFlowSpi` — логин: password → (Google/SAML в enterprise)
- `QuotaSpi` — NoOpQuotaProvider → (Plan-based quota в enterprise)
- `BillingSpi` — CommunityBillingProvider → (Stripe-based в enterprise)
- `FeatureGateSpi` — все фичи включены → (Tier-based gating в enterprise)
