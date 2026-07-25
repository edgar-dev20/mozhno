# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
