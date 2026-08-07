# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-08-03

### Changed
- JWT secrets now accept plain text (≥32 chars) or Base64 — auto-detected via round-trip check
- JWT signing explicitly pinned to HS256, preventing `WeakKeyException` on key-length mismatch

### Fixed
- `WeakKeyException` when auto-generated 256-bit key tried to verify HS384 tokens

## [1.1.1] — 2026-08-07

### Changed
- **Email templates redesigned** to match the design system — SaaS-style cards with brand accent bar, Onest font, wordmark with copper dot; subjects now live in the templates themselves (`<title>`), not in Java maps
- **User invitation simplified** — name field removed from the admin invite form; the invited user sets their name upon activation
- **User email and name are immutable** — admins can no longer change them via the edit form or API; `UserUpdateRequest` accepts only password, role, status, locale
- Success banners on auth pages (invite accept, password reset, forgot password) now use the `Alert` design-system component

### Removed
- `UserUpdateRequest.email` and `UserUpdateRequest.name` fields
- `name` field from `InviteUserRequest`
- Subject line maps from `UserInviteService` and `PasswordResetService`

## [1.1.0] — 2026-08-04

### Changed
- **Projects are indestructible** — use `POST /projects/reset` to wipe data, project ID is permanent
- **`{id}` removed from all project endpoints** — project ID is taken from the JWT
- **JWT secrets** accept plain text (≥32 chars) or Base64, auto-detected
- **JWT signing** explicitly pinned to HS256
- **User hierarchy** via `users.created_by` — admin group isolation, last-admin protection
- **Onboarding** shows only for admins with default "My Project" name — one-click dismiss persisted

### Removed
- `POST /projects` — projects are created once at bootstrap
- `DELETE /projects/{id}` — use `POST /projects/reset` instead
- `POST /auth/select-project` — project context lives in JWT from DB
- `SelectProjectRequest`, `linkCreatorAndChildrenToProject`, `linkOrphansToProject`

### Fixed
- `WeakKeyException` when auto-generated 256-bit key tried to verify HS384 tokens
- Double fetch on `/users` and `/audit` pages — migrated to React Query
- Stale canvasRef in DashboardLayout breaking logo accent color
- `reset()` now creates 3 environments (Production/Staging/Development) matching `createDefaultProject`
- Invite accept correctly inherits inviter's project, with default-project fallback

### Added
- `POST /projects/reset` — clears all project data, resets name to "My Project"
- `deleteByProjectId` on all 13 data repositories
- User-project lifecycle integration tests (12 scenarios)
- `UserServiceTest`, `JwtPropertiesTest` unit tests
- `users.created_by` FK with ON DELETE SET NULL
- Backfill migration V53 for orphaned users

## [1.0.0] — 2026-08-03

### Added
- Multi-stage Docker image with web UI embedded into Spring Boot fat JAR
- CI pipeline with path-based filtering for server, web, and SDK tests
- Docker release workflow publishing to `mozhnodev/mozhno` (amd64 + arm64)
- Java SDK publishing to GitHub Packages Maven (`dev.mozhno:mozhno-client-java`)
- JavaScript SDK publishing to GitHub Packages npm (`@mozhno/client-js`)
- StarChart.cc integration in README
- Bilingual README (Russian + English)
- Dependabot configuration for Gradle, npm, Docker, and GitHub Actions
- Security policy (`SECURITY.md`) with responsible disclosure process
- Contributing guide (`CONTRIBUTING.md`) with conventional commits
- Code of Conduct (`CODE_OF_CONDUCT.md`) — Contributor Covenant 2.1
- Issue templates for bugs, features, and documentation
- Pull request template with checklist
- CodeQL static analysis in CI pipeline
- `.gitattributes` for consistent line endings across platforms

### Changed
- Separated Docker, Java SDK, and JS SDK release workflows by tag prefix
