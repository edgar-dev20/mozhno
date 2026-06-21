# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Mozhno, please report it responsibly.

**Do not open a public issue.** Instead, send an email to:

📧 **security@mozhno.dev**

We will respond within 72 hours with:
- Confirmation of receipt
- Initial assessment of severity
- An estimated timeline for a fix

## Process

1. Your report will be treated confidentially until a fix is released.
2. We will work with you to understand and reproduce the issue.
3. Once a fix is ready, we will release a patch and publish a security advisory.
4. You will be credited in the advisory (unless you prefer to remain anonymous).

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest release (`v*.*.*`) | ✅ |
| Pre-release / `main` branch | ⚠️ Best effort |
| Older versions | ❌ |

## Scope

Security reports are welcome for:
- The Mozhno server (Spring Boot application)
- The web dashboard (React SPA)
- Java SDK (`dev.mozhno:mozhno-client-java`)
- JavaScript SDK (`@mozhno/client-js`)
- Docker images published to `ghcr.io/mozhno-dev/mozhno`

Out of scope:
- Issues in third-party dependencies (report to the respective project)
- Theoretical attacks requiring physical access to the server
- Denial-of-service via resource exhaustion at the application layer

## Disclosure Policy

We follow a 90-day responsible disclosure window:
- Day 0: Report received and acknowledged
- Day 30: Fix developed and internally tested
- Day 60: Release candidate shared with reporter for verification
- Day 90: Public release and advisory published

The timeline may be adjusted for critical vulnerabilities requiring an out-of-cycle release.

## PGP Key

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
(Optional: add your PGP key here for encrypted reports)
-----END PGP PUBLIC KEY BLOCK-----
```
