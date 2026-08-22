---
name: mozhno-server
description: Reference for the Mozhno feature-flag server (Spring Boot 4 / JDK 25, Gradle multi-module). Use when editing Java server code under /server — JdbcTemplate repositories, @Service business logic, REST controllers + assemblers, Flyway migrations, the open-core SPI, security/JWT/API-key auth, caching, and domain events. This project uses Spring JDBC, NOT JPA/Hibernate.
license: MIT
metadata:
  domain: backend
  role: specialist
  scope: implementation
  triggers: Mozhno server, Spring Boot, JdbcTemplate, Flyway, feature flags backend, Java REST API, SPI, JWT
---

# Mozhno Server

Backend of **Mozhno** — an open-core feature-flag management platform. Spring Boot 4.1 /
JDK 25, PostgreSQL, packaged as a single self-contained server (REST API + embedded web SPA).

> **CRITICAL:** This codebase does **NOT** use JPA/Hibernate. Persistence is **Spring
> `JdbcTemplate` + raw SQL + `RowMapper`**. Do **not** introduce `@Entity`, `JpaRepository`,
> `@GeneratedValue`, or Spring Data repositories. See [Feature Anatomy](#feature-anatomy).

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Language / runtime | Java, **JDK 25** toolchain (`-parameters` enabled) |
| Framework | **Spring Boot 4.1.0** (`io.spring.dependency-management` 1.1.7) |
| Persistence | **Spring JDBC** (`JdbcTemplate`, `RowMapper`) — no ORM |
| Database | PostgreSQL 15+ |
| Migrations | **Flyway** (`db/migration/V{n}__*.sql`) |
| Security | Spring Security 7 (Boot-managed), JWT via **jjwt 0.12** (HMAC-SHA256) + API keys |
| Rate limiting | **Bucket4j** (`RateLimitFilter` in the `security` package) |
| Caching | Spring Cache backed by **Caffeine** (`spring.cache.type: caffeine`) |
| API docs | springdoc-openapi 2.8 / OpenAPI 3.1, Swagger UI |
| Metrics / tracing | Micrometer + Actuator (Prometheus), Brave tracing bridge, `@Timed` |
| Boilerplate | Lombok (`@Getter/@Setter/@Data/@RequiredArgsConstructor`) |
| Build & test | Gradle multi-module, JaCoCo, JUnit 5, Testcontainers (PostgreSQL) |

## Module Map

Gradle multi-module (`server/settings.gradle`), group `dev.mozhno`. Dependency direction is
strictly `spi ← core ← web-api ← app`.

| Module | Path | Responsibility |
|--------|------|----------------|
| `mozhno-spi` | `server/mozhno-spi` | Service-provider **interfaces** for open-core extension points. No logic. |
| `mozhno-core` | `server/mozhno-core` | Domain logic: entities, JDBC repositories, `@Service` classes, events, security, exceptions, OSS SPI impls, Flyway migrations. |
| `mozhno-web-api` | `server/mozhno-web-api` | REST layer: `@RestController`s, request/response DTOs, **assemblers**, `GlobalExceptionHandler`. |
| `mozhno-app` | `server/mozhno-app` | Spring Boot entry point (`Server.java`), `application.yml`, logging config, embedded web static assets, metrics config. |

**`mozhno-core` domain packages:** `apikeys, audit, auth, client, common, config, contexts,
environments, events, exception, flags` (+ `flags/strategy`)`, integrations, logging, mail,
metrics, projects, security, segments, settings, spi` (+ `spi/impl`)`, tags, util`.
Top-level constants: `CacheNames`, `ContextType`, `Operator`.

**`mozhno-web-api` packages** mirror the core domains (each holds a `*Controller` +
`*Assembler`), plus the root `GlobalExceptionHandler`.

## Feature Anatomy

Every feature follows the same 5-layer shape. Copy these Mozhno-derived patterns exactly.

### 1. Entity — plain Lombok POJO (`mozhno-core`)

No JPA annotations. Column-to-field mapping lives in the repository's `RowMapper`
(e.g. DB column `flag_key` → field `key`).

```java
@Getter @Setter @NoArgsConstructor
public class Flag {
    private Integer id;
    private Integer projectId;      // multi-tenant scope key — present on every entity
    private String name;
    private String key;
    private FlagType flagType;
    private Instant createdAt;
    private boolean enabled;
    private boolean archived;
}
```

### 2. Repository — `@Repository` wrapping `JdbcTemplate` (`mozhno-core`)

Constructor-inject `JdbcTemplate`, define a `private static final RowMapper<T>`, write raw
SQL (text blocks for joins), use `GeneratedKeyHolder` for inserts, catch
`EmptyResultDataAccessException` → return `null`. **Always** filter by `projectId`.

```java
@Repository
public class FlagRepository {
    private final JdbcTemplate jdbc;
    public FlagRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private static final RowMapper<Flag> ROW_MAPPER = (rs, rowNum) -> {
        Flag f = new Flag();
        f.setId(rs.getInt("id"));
        f.setKey(rs.getString("flag_key"));   // column flag_key -> field key
        f.setFlagType(FlagType.valueOf(rs.getString("flag_type")));
        f.setEnabled(rs.getBoolean("enabled"));
        return f;
    };

    public Flag findByIdAndProjectId(Integer id, Integer projectId) {
        try {
            return jdbc.queryForObject(
                "SELECT ... FROM flags WHERE id = ? AND project_id = ?", ROW_MAPPER, id, projectId);
        } catch (EmptyResultDataAccessException e) {
            return null;   // callers translate null -> NotFoundException
        }
    }

    @CacheEvict(value = CacheNames.FLAGS, allEntries = true)
    public Flag save(Flag flag) {
        if (flag.getId() == null) {
            GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(con -> { /* PreparedStatement INSERT ... */ }, keyHolder);
            flag.setId(keyHolder.getKey().intValue());
        } else {
            jdbc.update("UPDATE flags SET ... WHERE id = ? AND project_id = ?", ...);
        }
        return flag;
    }
}
```

Pagination is manual: `LIMIT ? OFFSET ?` + a `COUNT(*)` query, returned as
`dev.mozhno.common.PageResponse<T>` (`new PageResponse<>(items, page, size, total)`).

### 3. Service — `@Service` + manual constructor injection (`mozhno-core`)

Manual constructors (no `@Autowired`, no Lombok on services). Reads =
`@Transactional(readOnly = true)`; writes = `@Transactional`. Evict caches on writes, publish
a `DomainEvent`, enforce quotas through the SPI, throw the custom exceptions.

```java
@Service
public class FlagService {
    private final FlagRepository flagRepository;
    private final DomainEventPublisher events;
    private final QuotaSpi quotaSpi;

    public FlagService(FlagRepository flagRepository, DomainEventPublisher events, QuotaSpi quotaSpi) {
        this.flagRepository = flagRepository;
        this.events = events;
        this.quotaSpi = quotaSpi;
    }

    @Transactional(readOnly = true)
    public Flag findById(Integer id, Integer projectId) {
        Flag flag = flagRepository.findByIdAndProjectId(id, projectId);
        if (flag == null) throw new NotFoundException("Flag", id);
        return flag;
    }

    @Transactional
    @CacheEvict(value = CacheNames.CLIENT_FLAGS, allEntries = true)
    public Flag create(FlagRequest request, Integer creatorId) {
        QuotaValidator.check(quotaSpi.canCreateFlag(request.getProjectId()));
        Flag flag = new Flag();
        // ... map request -> entity, validate enum with try/catch -> BadRequestException ...
        flag = flagRepository.save(flag);
        events.publish(DomainEvent.of(flag.getProjectId(), "flag.created", "flag",
            flag.getId(), flag.getName(), "Key: " + flag.getKey()));
        return flag;
    }
}
```

### 4. Controller — `@RestController` (`mozhno-web-api`)

`@RequestMapping("/api/v1/<resource>")`, Lombok `@RequiredArgsConstructor`, Swagger
`@Operation`/`@Tag`, Micrometer `@Timed`, `@PreAuthorize` for writes. The active tenant comes
from `@AuthenticationPrincipal UserPrincipal user` — **never** from the request body.

```java
@RestController
@RequestMapping("/api/v1/flags")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Flags", description = "Feature flag management")
public class FlagController {
    private final FlagService flagService;
    private final FlagAssembler flagAssembler;

    @GetMapping("/{id}")
    @Operation(summary = "Get flag by ID")
    public FlagResponse getById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal user) {
        return flagAssembler.toResponse(flagService.findById(id, user.projectId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER')")
    @Timed(value = "flags.create", description = "Time to create a flag")
    public FlagResponse create(@Valid @RequestBody FlagRequest request, @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());          // overwrite body tenant with JWT tenant
        return flagAssembler.toResponse(flagService.create(request, user.userId()));
    }
}
```

`UserPrincipal` is a record: `userId()`, `email()`, `role()`, `projectId()`, plus
`isAdmin()/isDeveloper()/isViewer()`.

### 5. Assembler — entity → response DTO (`mozhno-web-api`)

`@Component` that converts entities to response DTOs, resolving related data (tags, user
names, strategies) in batch. **Entities never cross the API boundary — assemblers do.**
Response DTOs use Lombok `@Builder`; request DTOs use `@Data` + Jakarta validation +
`@Schema`.

```java
@Component
public class FlagAssembler {
    // constructor-injected repositories for enrichment
    public FlagResponse toResponse(Flag flag) {
        return FlagResponse.builder().id(flag.getId()).name(flag.getName())
            .key(flag.getKey()).enabled(flag.isEnabled()).build();
    }
}
```

## Multi-Tenancy & Security

- **Tenant = `projectId`**, carried in the JWT (`project_id` claim) and exposed via
  `UserPrincipal.projectId()`. Set at login from `users.project_id` or during project creation.
- **Every** repository query and service method is scoped by `projectId`. When creating/
  updating, controllers set `request.setProjectId(user.projectId())` — never trust the body.
- **Roles:** `ADMIN` / `DEVELOPER` / `VIEWER`. Guard mutating endpoints with
  `@PreAuthorize("hasAnyRole('ADMIN','DEVELOPER')")`; admin-only with `hasRole('ADMIN')`.
- **Auth wiring spans three packages** (do not assume everything is in `auth`):
  - `security`: `SecurityConfig`, `SecurityProperties`, `RateLimitFilter` + `RateLimitProperties`
    (Bucket4j), `ApiKeyAuthentication`.
  - `auth`: `UserPrincipal`, `User`/`UserService`/`UserRepository`, `JwtService`/`JwtToken`,
    `AuthService`, `RefreshTokenService`, `PasswordValidator`, and the password-reset / invite
    token flows.
  - `spi/impl`: the pluggable authenticators — `DelegatingAuthenticationFilter` routing to
    `JwtAuthenticationProvider` (dashboard users) or `ApiKeyAuthenticationProvider` (SDK/client
    endpoints), and `PasswordAuthFlow`.

## Open-Core SPI

Premium features plug in via interfaces in `mozhno-spi`; the OSS build ships default impls, all
in `mozhno-core`'s `spi/impl` package.

| SPI | OSS default impl |
|-----|------------------|
| `QuotaSpi` | `NoOpQuotaProvider` (unlimited) |
| `FeatureGateSpi` | `CommunityFeatureGateProvider` |
| `BillingSpi` | `CommunityBillingProvider` |
| `WebhookLimitSpi` | `NoOpWebhookLimitProvider` |
| `AuditSpi` | `JdbcAuditProvider` |
| `AuditEventEnricher` | `NoOpAuditEventEnricher` |
| `MetricsSinkSpi` | `JdbcMetricsSinkProvider` |
| `NotificationSpi` | `LoggingNotificationProvider` / `SmtpNotificationProvider` |
| `AuthenticationFlowSpi` | `PasswordAuthFlow` |
| `AuthenticationProviderSpi` | `JwtAuthenticationProvider`, `ApiKeyAuthenticationProvider` |

To add an extension point: declare the interface in `mozhno-spi`, provide an OSS default
`@Component`/`@Service` impl in `mozhno-core`, and inject the interface where needed. Enforce
quotas via `QuotaValidator.check(quotaSpi.canCreateX(projectId))`.

## Exceptions

Custom hierarchy in `dev.mozhno.exception`, base `MozhnoException` (carries an `errorCode`).
Translated to JSON by `GlobalExceptionHandler` (`@RestControllerAdvice` in `mozhno-web-api`).
Throw domain exceptions from services — never leak stack traces.

| Exception | HTTP | When |
|-----------|------|------|
| `NotFoundException("Flag", id)` | 404 | Entity missing / wrong project |
| `BadRequestException` | 400 | Invalid input, bad enum value, limit exceeded |
| `ConflictException` | 409 | Unique-constraint / duplicate |
| `ForbiddenException` | 403 | Authorization failure |
| `InvalidCredentialsException` | (auth) | Login failure |
| `QuotaExceededException` | 402 | SPI quota exceeded (adds `current`/`limit`/`planName`) |

Bean-validation failures (`@Valid`) → 400 `VALIDATION_ERROR` with per-field details, handled
automatically. Error body shape: `{ error, code, [details], [traceId] }`.

## Caching

Spring Cache backed by **Caffeine** (`spring.cache.type: caffeine`, max 5000 entries /
5 min TTL by default). **Never** use raw cache-name strings — reference constants in
`dev.mozhno.CacheNames`: `CLIENT_FLAGS`, `FLAGS`, `CONTEXT_DEFINITIONS`, `TAGS`, `SEGMENTS`,
`PROJECTS`. Annotate write methods with `@CacheEvict(value = CacheNames.X, allEntries = true)`
on both the repository (`FLAGS`) and the service (`CLIENT_FLAGS`, the SDK-facing cache).

## Domain Events

Writes publish a `DomainEvent` via `DomainEventPublisher.publish(...)`, consumed by audit and
integration listeners. Use the factory:

```java
events.publish(DomainEvent.of(projectId, "flag.created", "flag", flagId, flagName, "Key: ..."));
```

Action naming: `"<resource>.<verb>"` (e.g. `flag.updated`, `flag.archived`, `user.created`).

## Configuration

- Type-safe `@ConfigurationProperties` classes (Lombok `@Getter/@Setter`, `@Validated`), e.g.
  `FlagsProperties` (`mozhno.flags`), `AuthProperties` (`mozhno.auth`), `JwtProperties`
  (`mozhno.jwt`), `SecurityProperties` (`mozhno.security`), `RateLimitProperties`
  (`mozhno.security.rate-limit` — note the nested prefix), plus `mozhno.audit`, `mozhno.client`,
  `mozhno.webhook`, `mozhno.metrics.async`, `mozhno.mail`, and root `mozhno` (`base-url`).
- Runtime config via `MOZHNO_*` env vars (see root `README.md`): `MOZHNO_DB_URL`,
  `MOZHNO_DB_USERNAME`, `MOZHNO_DB_PASSWORD`, `MOZHNO_JWT_SECRET`, `MOZHNO_BASE_URL`,
  `MOZHNO_SERVER_PORT` (8080), `MOZHNO_MANAGEMENT_PORT` (9090).
- Profiles: `application.yml` (default) + `application-dev.yml` (`SPRING_PROFILES_ACTIVE=dev`).
- **Never** put secrets in `application.yml`/`.properties` — use env vars.

## Migrations (Flyway)

Location: `server/mozhno-core/src/main/resources/db/migration`. Files are **append-only** and
immutable once merged.

- New schema change → new `V{next}__short_description.sql` (current max is `V45`).
- **Never edit or renumber an existing `V*` file.**
- After adding a table/column, update the affected `RowMapper` and SQL strings by hand.

## Testing

- JUnit 5 (`useJUnitPlatform`), JaCoCo report on every `test` run.
- **Testcontainers (PostgreSQL)** for repository/integration tests — Docker must be running.
- Layout under `mozhno-core/src/test/java/dev/mozhno`: `services/`, `repositories/`,
  `security/`, plus per-feature packages (`flags`, `auth`, `events`, `client`, …).
  `mozhno-core` exposes `testFixtures` reused by `mozhno-web-api` tests.
- Run: `./gradlew check` (or `make server-test` = `./gradlew check jacocoTestReport`).
- Java SDK tests (separate repo `mozhno-dev/mozhno-java-sdk`): `./gradlew check`.

### Test templates

Integration tests extend `BaseIntegrationTest` (Testcontainers Postgres + `@SpringBootTest`,
autowired real repos, `TRUNCATE` between tests). This repo does **not** use `@WebMvcTest` /
`@MockBean` slices.

**Repository test:**
```java
class FlagRepositoryTest extends BaseIntegrationTest {
    @Test
    void findByProjectId_returnsOnlyActiveProjectFlags() {
        Project p = new Project(); p.setName("P");
        Integer projectId = projectRepository.save(p).getId();

        Flag f = new Flag();
        f.setProjectId(projectId); f.setName("flag1"); f.setKey("flag-1");
        f.setFlagType(FlagType.RELEASE);
        flagRepository.save(f);

        assertEquals(1, flagRepository.findByProjectId(projectId).size());
    }
}
```

**Controller integration test** (real login → Bearer JWT; no mocked principal):
```java
class FlagControllerTest extends BaseIntegrationTest {
    @Autowired WebApplicationContext ctx;
    @Autowired PasswordEncoder passwordEncoder;
    MockMvc mockMvc; String token; Integer projectId;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(ctx)
            .apply(SecurityMockMvcConfigurers.springSecurity()).build();
        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status) VALUES (?,?,?,?)",
            "t@t.com", passwordEncoder.encode("secret"), "developer", "active");
        Project p = new Project(); p.setName("P");
        projectId = projectRepository.save(p).getId();
        String res = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"t@t.com\",\"password\":\"secret\",\"projectId\":" + projectId + "}"))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        token = new ObjectMapper().readTree(res).get("token").asText();
    }

    @Test
    void createFlag_returns201() throws Exception {
        mockMvc.perform(post("/api/v1/flags").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Dark Mode\",\"key\":\"dark-mode\"}"))
            .andExpect(status().isCreated());
    }
}
```

## Build & Run Commands

From repo root (`Makefile`) unless noted:

| Command | What |
|---------|------|
| `make db-up` | Start PostgreSQL via docker-compose |
| `make server-run` | Build web static assets, then `:mozhno-app:bootRun` (dev profile) |
| `make server-test` | `./gradlew check jacocoTestReport` |
| `cd server && ./gradlew :mozhno-app:bootRun` | Run the server directly |
| `cd server && ./gradlew check` | Full server test suite |
| `cd server && ./gradlew clean` | Clean build outputs |

- Swagger UI: `http://localhost:8080/swagger-ui.html`; OpenAPI: `/v3/api-docs`.
- Actuator (health/metrics/prometheus) on `MOZHNO_MANAGEMENT_PORT` (9090).

## Constraints

### MUST DO
| Rule | Pattern |
|------|---------|
| Use Spring JDBC | `@Repository` + `JdbcTemplate` + static `RowMapper` + raw SQL |
| Scope by tenant | Every query/method takes and filters by `projectId` |
| Trust the JWT, not the body | `request.setProjectId(user.projectId())` in controllers |
| Constructor injection in services | Manual constructor (no `@Autowired`, no Lombok on `@Service`) |
| Transaction scope | `@Transactional(readOnly = true)` reads / `@Transactional` writes |
| Validate input | `@Valid @RequestBody` + Jakarta constraints on request DTOs |
| Guard mutations | `@PreAuthorize("hasAnyRole('ADMIN','DEVELOPER')")` |
| Cross the boundary via assemblers | Return `*Response` DTOs, never entities |
| Cache names from constants | `CacheNames.*`, evict on writes |
| Publish domain events on writes | `events.publish(DomainEvent.of(...))` |
| Custom exceptions | Throw `NotFoundException`/`BadRequestException`/… (base `MozhnoException`) |
| New migration files | Append `V{n}__*.sql`; never edit existing ones |

### MUST NOT DO
- Introduce JPA/Hibernate: `@Entity`, `@Id`, `@GeneratedValue`, `JpaRepository`, Spring Data.
- Read `projectId` from the request body for authorization/scoping.
- Use raw cache-name string literals.
- Return entities from controllers, or expose stack traces to clients.
- Store secrets in `application.yml`/`.properties`.
- Edit or renumber an already-merged Flyway migration.
- Add cross-module dependencies against the `spi ← core ← web-api ← app` direction.

## No Deprecated APIs

Target the versions this repo runs on: **JDK 25, Spring Boot 4.1 (Spring Framework 7 / Spring
Security 7), springdoc 2.8, jjwt 0.12**. Do **not** introduce APIs deprecated in those versions.

- **Never call a `@Deprecated` method/class/constructor** — use its documented replacement.
  If a symbol you're about to use is deprecated, stop and switch to the non-deprecated API.
- Prefer the current idioms already used in this codebase over older Spring patterns, e.g.:
  - Security: lambda `SecurityFilterChain` DSL — **not** `WebSecurityConfigurerAdapter`
    (removed) or the deprecated `.and()` chaining / `authorizeRequests()`.
  - jjwt 0.12: builder API (`Jwts.builder()...signWith(key)`, `Jwts.parser().verifyWith(key)`)
    — **not** the deprecated 0.11 `parserBuilder()` / `setX(...)` / `signWith(alg, secret)` calls.
  - Use constructor injection, `RestClient`/`WebClient` over `RestTemplate`, `Instant`/
    `java.time` over legacy `Date`/`Calendar`.
- When adding a dependency call, check its Javadoc/release notes for the version in the BOM; if
  the method is marked deprecated or "for removal", pick the replacement.
- If replacing a deprecated call is non-trivial, leave a short `// TODO` and flag it rather than
  silently keeping the deprecated usage.
- Do not suppress the signal: avoid blanket `@SuppressWarnings("deprecation")` — fixing the call
  is preferred over hiding the warning.
