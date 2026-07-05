# AGENTS.md

Root guide for the **Mozhno** monorepo — an open-core feature-flag management platform.
This file is the always-loaded map. It is intentionally thin: **when you work inside a
package, open that package's `SKILL.md` for the real conventions and patterns.**

## Where to look

| You are working in… | Read this first |
|---------------------|-----------------|
| `server/` (Java backend) | [`server/SKILL.md`](server/SKILL.md) — `mozhno-server` skill |
| `web/` (React UI) | [`web/SKILL.md`](web/SKILL.md) — `mozhno-web` skill |
| `sdks/java`, `sdks/js` | [`sdks/SKILL.md`](sdks/SKILL.md) — `mozhno-sdks` skill |

Keep this file as an index — do **not** duplicate package details here (avoids drift). Put
package-specific rules in the relevant `SKILL.md`.

## Repository layout

| Path | What |
|------|------|
| `server/` | Spring Boot 4 / JDK 25 backend (Gradle multi-module: `mozhno-spi`, `mozhno-core`, `mozhno-web-api`, `mozhno-app`) |
| `web/` | React 19 SPA (Vite, Tailwind v4), published as `@mozhno/core-ui`; built into the server's static assets |
| `sdks/` | `java`, `js` client SDKs + shared `design-tokens` |
| `docs/` | VitePress documentation site |

The server serves the built web UI as static assets — one self-contained artifact.

## Top-level commands (root `Makefile`)

| Command | What |
|---------|------|
| `make dev` | Start Postgres, then run server + web in separate terminals |
| `make db-up` / `make db-down` | Start / stop PostgreSQL (docker-compose) |
| `make server-run` | Build web static assets, then run the server (dev profile) |
| `make server-test` | `./gradlew check jacocoTestReport` |
| `make web-dev` / `make web-test` / `make web-lint` | Web dev server / tests / lint |
| `make js-sdk-test` / `make js-sdk-build` | JS SDK tests / build |
| `make java-sdk-test` | `./gradlew :mozhno-client-java:check` |
| `make docker-up` / `make docker-down` | Full stack via docker-compose |

**Requirements:** JDK 25 (server), JDK 17+ (SDK), Node.js 24, PostgreSQL 15+.

## Project-wide invariants

- **Backend persistence = Spring `JdbcTemplate` + raw SQL. NOT JPA/Hibernate.** Never add
  `@Entity`, `JpaRepository`, `@GeneratedValue`, or Spring Data repositories. (See
  `server/SKILL.md`.)
- **Multi-tenancy:** every resource is scoped by `projectId`, taken from the JWT
  (`UserPrincipal.projectId()` on the server), never from the request body.
- **Roles:** `ADMIN` / `DEVELOPER` / `VIEWER` — mutating server endpoints are guarded with
  `@PreAuthorize`.
- **DB migrations are append-only:** add a new Flyway `V{n}__*.sql`; never edit or renumber an
  existing one.
- **Web styling uses semantic design tokens only** — no raw Tailwind color values (e.g.
  `bg-red-600`, `text-white`, `bg-black/50`). Enforced as an ESLint error. (See `web/SKILL.md`.)
- **Open-core boundary:** the core (`server/` + `web/`) is source-available under BSL 1.1.
  Keep premium/paid logic OUT of the core — extend via the server SPI (`mozhno-spi` +
  `spi/impl` OSS defaults) and the web plugin registry (`PluginSlot` / `pluginRegistry`).
  Details: "Open-Core SPI" in `server/SKILL.md`, "PluginRegistry API" in `web/SKILL.md`.
- **i18n:** user-facing web strings live in `web/src/i18n/locales/{en,ru}.ts` and must stay in
  sync across both locales.
- **No deprecated APIs:** write against the versions this repo pins (see each `SKILL.md`); never
  introduce methods/classes marked `@Deprecated`/`@deprecated` — use the documented replacement.

## Before you finish (Definition of Done)

Verify only the area(s) you touched, then confirm green before declaring done:

- **Server:** `make server-test` (or `./gradlew check`). Docker must be running (Testcontainers).
- **Web:** `make web-test` + `make web-lint`; if you touched UI strings, `en.ts` and `ru.ts`
  must both be updated (i18n stays in sync — enforced by a key-parity test).
- **JS SDK:** `make js-sdk-test`. **Java SDK:** `make java-sdk-test`.
- No `@Deprecated`/`@deprecated` calls introduced; no secrets committed.
- Do not commit unless explicitly asked.

## Conventions

- Do not commit unless explicitly asked.
- Match existing code style in each package; check neighboring files before introducing a new
  library.
- License: source-available under Business Source License 1.1 (see `LICENSE`) — not a
  classic OSI license; check compatibility before adding a dependency.
