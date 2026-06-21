import{_ as t,o as a,c as r,a2 as n}from"./chunks/framework.DnrXFDHb.js";const g=JSON.parse('{"title":"Architecture","description":"","frontmatter":{},"headers":[],"relativePath":"en/advanced/architecture.md","filePath":"en/advanced/architecture.md"}'),s={name:"en/advanced/architecture.md"};function o(i,e,d,l,c,h){return a(),r("div",null,[...e[0]||(e[0]=[n(`<h1 id="architecture" tabindex="-1">Architecture <a class="header-anchor" href="#architecture" aria-label="Permalink to &quot;Architecture&quot;">​</a></h1><p>Technical architecture of <strong>можно.</strong> — module structure, tech stack, evaluation flow, and authentication.</p><h2 id="module-diagram" tabindex="-1">Module Diagram <a class="header-anchor" href="#module-diagram" aria-label="Permalink to &quot;Module Diagram&quot;">​</a></h2><pre class="mermaid">graph TD
    subgraph &quot;можно. Application&quot;
        APP[mozhno-app&lt;br/&gt;Entry point, static resources, Flyway]
        API[mozhno-web-api&lt;br/&gt;REST controllers, Spring Security 6, JWT, OpenAPI]
        CORE[mozhno-core&lt;br/&gt;Business logic, flag engine, storage, caching]
        SPI[mozhno-spi&lt;br/&gt;Extension interfaces]
    end

    APP --&gt; API
    APP --&gt; CORE
    API --&gt; CORE
    CORE --&gt; SPI
    SPI -.-&gt; ENT[Enterprise JAR&lt;br/&gt;PremiumPlugin implementations]

    DB[(PostgreSQL)]
    REACT[React 19 SPA&lt;br/&gt;Embedded static/]

    APP --&gt; DB
    APP --&gt; REACT
    CORE --&gt; DB
</pre><h3 id="module-responsibilities" tabindex="-1">Module Responsibilities <a class="header-anchor" href="#module-responsibilities" aria-label="Permalink to &quot;Module Responsibilities&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Module</th><th>Role</th><th>Key Classes</th></tr></thead><tbody><tr><td><strong>mozhno-spi</strong></td><td>Interface definitions for the plugin system. No dependencies on other modules.</td><td><code>AuthenticationProviderSpi</code>, <code>FeatureGateSpi</code>, <code>QuotaSpi</code>, <code>BillingSpi</code>, <code>PluginSlot</code>, <code>PremiumPlugin</code></td></tr><tr><td><strong>mozhno-core</strong></td><td>Business logic: flag evaluation engine, user/segment storage, audit trail, caching layer. Depends on <code>mozhno-spi</code>.</td><td><code>FlagService</code>, <code>SegmentService</code>, <code>AuditService</code>, <code>FlagEvaluator</code>, <code>CaffeineCacheConfig</code></td></tr><tr><td><strong>mozhno-web-api</strong></td><td>REST API layer: controllers, Spring Security 6 filter chain, JWT processing, OpenAPI/Swagger docs. Depends on <code>mozhno-core</code>.</td><td><code>FlagController</code>, <code>AuthController</code>, <code>JwtTokenProvider</code>, <code>SecurityConfig</code>, <code>ApiKeyFilter</code></td></tr><tr><td><strong>mozhno-app</strong></td><td>Spring Boot entry point, embedded static React SPA, Flyway migration runner. Depends on all modules above.</td><td><code>MozhnoApplication</code>, <code>FlywayConfig</code>, <code>StaticResourceConfig</code></td></tr></tbody></table><h2 id="tech-stack" tabindex="-1">Tech Stack <a class="header-anchor" href="#tech-stack" aria-label="Permalink to &quot;Tech Stack&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Layer</th><th>Technology</th><th>Version</th><th>Rationale</th></tr></thead><tbody><tr><td><strong>Runtime</strong></td><td>JDK</td><td>25</td><td>Virtual threads, ZGC, latest LTS features</td></tr><tr><td><strong>Framework</strong></td><td>Spring Boot</td><td>4.0</td><td>DI, auto-configuration, Actuator, production-ready defaults</td></tr><tr><td><strong>Database Access</strong></td><td>JdbcTemplate + RowMapper</td><td>—</td><td>Direct SQL, no ORM overhead, predictable query plans</td></tr><tr><td><strong>Migrations</strong></td><td>Flyway</td><td>10.x</td><td>Schema versioning, repeatable migrations, CI/CD integration</td></tr><tr><td><strong>Connection Pool</strong></td><td>HikariCP</td><td>6.x</td><td>Fastest JDBC pool, metrics, leak detection</td></tr><tr><td><strong>Caching</strong></td><td>Caffeine</td><td>3.x</td><td>In-process cache, Window TinyLFU, near-optimal hit rate</td></tr><tr><td><strong>Auth</strong></td><td>Spring Security 6</td><td>—</td><td>Filter chain, JWT stateless auth, method security</td></tr><tr><td><strong>JWT</strong></td><td>HMAC-SHA256</td><td>—</td><td>Symmetric signing, no external auth server needed</td></tr><tr><td><strong>Frontend</strong></td><td>React</td><td>19</td><td>SPA, declarative UI, ecosystem</td></tr><tr><td><strong>CSS</strong></td><td>Tailwind CSS</td><td>4</td><td>Utility-first, JIT compilation, design system tokens</td></tr><tr><td><strong>UI Primitives</strong></td><td>Radix UI</td><td>—</td><td>Headless accessible components, unstyled by default</td></tr><tr><td><strong>Docs / API</strong></td><td>SpringDoc OpenAPI</td><td>2.x</td><td>Swagger UI, request validation, schema generation</td></tr><tr><td><strong>Metrics</strong></td><td>Micrometer</td><td>—</td><td>Actuator integration, Prometheus support</td></tr><tr><td><strong>Build</strong></td><td>Gradle / Maven</td><td>—</td><td>Multi-module, reproducible builds</td></tr></tbody></table><h2 id="flag-evaluation-flow" tabindex="-1">Flag Evaluation Flow <a class="header-anchor" href="#flag-evaluation-flow" aria-label="Permalink to &quot;Flag Evaluation Flow&quot;">​</a></h2><pre class="mermaid">sequenceDiagram
    participant App as Your Application
    participant SDK as Java/JS SDK
    participant Server as Mozhno Server
    participant DB as PostgreSQL
    participant Cache as Caffeine Cache

    Note over SDK: Initialization
    SDK-&gt;&gt;Server: GET /api/sdk/flags&lt;br/&gt;Authorization: Bearer &lt;api-key&gt;
    Server-&gt;&gt;DB: SELECT flags for environment
    DB--&gt;&gt;Server: Flag list with rules
    Server--&gt;&gt;SDK: JSON payload
    SDK-&gt;&gt;SDK: Parse and cache locally

    Note over App,SDK: Runtime Flag Evaluation
    App-&gt;&gt;SDK: boolFlag(&quot;feature-x&quot;, context)
    SDK-&gt;&gt;SDK: Find flag in local cache
    SDK-&gt;&gt;SDK: Evaluate strategies against context
    SDK--&gt;&gt;App: true / false

    Note over SDK,Server: Background Sync (every 30s)
    SDK-&gt;&gt;Server: GET /api/sdk/flags?since=&lt;timestamp&gt;
    Server-&gt;&gt;Cache: Check flag cache
    alt Cache Hit
        Cache--&gt;&gt;Server: Cached flags
    else Cache Miss
        Server-&gt;&gt;DB: SELECT flags WHERE updated &gt; timestamp
        DB--&gt;&gt;Server: Updated flags
        Server-&gt;&gt;Cache: Update cache
    end
    Server--&gt;&gt;SDK: Delta (only changed flags)
    SDK-&gt;&gt;SDK: Merge delta into local cache
</pre><h3 id="key-design-decisions" tabindex="-1">Key Design Decisions <a class="header-anchor" href="#key-design-decisions" aria-label="Permalink to &quot;Key Design Decisions&quot;">​</a></h3><ol><li><p><strong>Local evaluation</strong> — the SDK holds a complete snapshot of flag rules. Evaluations happen in-process with zero network calls and zero latency. This is critical for high-throughput applications where a remote evaluation call on every <code>if (flag)</code> would add unacceptable overhead.</p></li><li><p><strong>Delta sync</strong> — the SDK sends a <code>since</code> timestamp. The server returns only flags changed since that timestamp, not the full set. For 1000 flags where 2 changed, the payload is ~200 bytes instead of ~50 KB.</p></li><li><p><strong>Server-side cache</strong> — the server caches flag rules in Caffeine (30 s TTL). SDK requests hit the cache, not the database directly. This absorbs the fan-out from many SDK instances polling the same environment.</p></li></ol><h2 id="jwt-authentication-flow" tabindex="-1">JWT Authentication Flow <a class="header-anchor" href="#jwt-authentication-flow" aria-label="Permalink to &quot;JWT Authentication Flow&quot;">​</a></h2><pre class="mermaid">sequenceDiagram
    participant Browser as Web Dashboard
    participant Server as Mozhno Server
    participant DB as PostgreSQL

    Note over Browser,Server: Login
    Browser-&gt;&gt;Server: POST /api/auth/login&lt;br/&gt;{email, password}
    Server-&gt;&gt;DB: SELECT user WHERE email = ?
    DB--&gt;&gt;Server: User (with bcrypt hash)
    Server-&gt;&gt;Server: Verify bcrypt(password, hash)
    Server-&gt;&gt;Server: Generate access token (15 min)
    Server-&gt;&gt;Server: Generate refresh token (7 days)
    Server-&gt;&gt;DB: INSERT refresh_token&lt;br/&gt;(family_id, token_hash, expiry)
    Server--&gt;&gt;Browser: {accessToken, refreshToken}

    Note over Browser,Server: Authenticated Request
    Browser-&gt;&gt;Server: GET /api/flags&lt;br/&gt;Authorization: Bearer &lt;accessToken&gt;
    Server-&gt;&gt;Server: Validate HMAC-SHA256 signature
    Server-&gt;&gt;Server: Parse claims (sub, roles, exp)
    Server-&gt;&gt;Server: Check exp &gt; now
    Server--&gt;&gt;Browser: Flag list

    Note over Browser,Server: Token Refresh
    Browser-&gt;&gt;Server: POST /api/auth/refresh&lt;br/&gt;{refreshToken}
    Server-&gt;&gt;DB: SELECT * FROM refresh_tokens&lt;br/&gt;WHERE token_hash = ?&lt;br/&gt;FOR UPDATE
    alt Token valid &amp; not revoked
        DB--&gt;&gt;Server: Token row (locked)
        Server-&gt;&gt;DB: UPDATE refresh_tokens SET revoked = true&lt;br/&gt;WHERE id = ?
        Server-&gt;&gt;DB: INSERT new refresh_token&lt;br/&gt;(same family_id, new hash)
        Server-&gt;&gt;Server: Generate new access + refresh tokens
        Server--&gt;&gt;Browser: {accessToken, refreshToken}
    else Token revoked (reuse detected)
        Server-&gt;&gt;DB: UPDATE refresh_tokens SET revoked = true&lt;br/&gt;WHERE family_id = ?
        Server--&gt;&gt;Browser: 401 Unauthorized
    end
</pre><h3 id="refresh-token-family-rotation" tabindex="-1">Refresh Token Family Rotation <a class="header-anchor" href="#refresh-token-family-rotation" aria-label="Permalink to &quot;Refresh Token Family Rotation&quot;">​</a></h3><p>Refresh tokens use <strong>family rotation</strong> for theft detection:</p><ol><li>On refresh, the old refresh token is revoked and a new one issued — both share the same <code>family_id</code>.</li><li>If a revoked token is presented (indicating it was stolen and the attacker is using it before the legitimate user), the <strong>entire family is revoked</strong>.</li><li>This forces all devices to re-authenticate, effectively locking out the attacker.</li></ol><p>The database uses <code>SELECT ... FOR UPDATE</code> row-level locking on refresh token lookup to prevent race conditions under concurrent requests.</p><h3 id="jwt-claims" tabindex="-1">JWT Claims <a class="header-anchor" href="#jwt-claims" aria-label="Permalink to &quot;JWT Claims&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Claim</th><th>Description</th></tr></thead><tbody><tr><td><code>sub</code></td><td>User ID</td></tr><tr><td><code>iat</code></td><td>Issued at (epoch seconds)</td></tr><tr><td><code>exp</code></td><td>Expiration (epoch seconds, +15 min from <code>iat</code>)</td></tr><tr><td><code>roles</code></td><td>User roles array (<code>[&quot;ADMIN&quot;, &quot;EDITOR&quot;, &quot;VIEWER&quot;]</code>)</td></tr></tbody></table><h2 id="spi-extension-system" tabindex="-1">SPI Extension System <a class="header-anchor" href="#spi-extension-system" aria-label="Permalink to &quot;SPI Extension System&quot;">​</a></h2><pre class="mermaid">graph TD
    REQ[Request] --&gt; CHAIN{SPI Priority Chain}
    CHAIN --&gt;|Priority 1| P1[Enterprise: SSO Auth]
    CHAIN --&gt;|Priority 2| P2[Enterprise: Custom Strategy]
    CHAIN --&gt;|Fall through| DEF[Default: Built-in Auth]
    P1 --&gt;|Not implemented, throws| CHAIN
    P2 --&gt;|Not implemented, throws| CHAIN
    DEF --&gt; RESP[Response]
</pre><p>Each SPI interface forms a priority chain. On each request, the system tries providers in order of priority. If a provider does not implement the interface (throws <code>UnsupportedOperationException</code>), the chain falls through to the next provider. The built-in default provider is always last.</p><p>See <a href="/en/advanced/open-core.html">Open Core</a> for the full SPI interface catalog and enterprise deployment model.</p><h2 id="static-resources" tabindex="-1">Static Resources <a class="header-anchor" href="#static-resources" aria-label="Permalink to &quot;Static Resources&quot;">​</a></h2><p>The React 19 SPA is built separately and embedded in the server JAR under <code>static/</code>. Spring Boot serves it as classpath static resources:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mozhno-app.jar</span></span>
<span class="line"><span>├── BOOT-INF/classes/static/</span></span>
<span class="line"><span>│   ├── index.html</span></span>
<span class="line"><span>│   ├── assets/</span></span>
<span class="line"><span>│   │   ├── index-abc123.js</span></span>
<span class="line"><span>│   │   └── index-def456.css</span></span>
<span class="line"><span>│   └── favicon.ico</span></span>
<span class="line"><span>└── WEB-INF/classes/db/migration/</span></span>
<span class="line"><span>    ├── V1__initial_schema.sql</span></span>
<span class="line"><span>    └── V2__add_audit_log.sql</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>No separate frontend server. No CORS configuration for the dashboard (same origin). All routes that don&#39;t match <code>/api/*</code> serve <code>index.html</code> for client-side routing.</p><h2 id="virtual-threads" tabindex="-1">Virtual Threads <a class="header-anchor" href="#virtual-threads" aria-label="Permalink to &quot;Virtual Threads&quot;">​</a></h2><p>Spring Boot 4.0 on JDK 25 uses virtual threads by default for request handling:</p><div class="language-yaml vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">spring</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  threads</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    virtual</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>Virtual threads are lightweight JVM-managed threads that allow the server to handle tens of thousands of concurrent connections without the overhead of platform threads. They are particularly effective for I/O-bound workloads like REST APIs where most time is spent waiting for database queries.</p><h2 id="related-pages" tabindex="-1">Related Pages <a class="header-anchor" href="#related-pages" aria-label="Permalink to &quot;Related Pages&quot;">​</a></h2><ul><li><a href="/en/advanced/open-core.html">Open Core</a> — SPI interfaces and enterprise features</li><li><a href="/en/advanced/migration.html">Migration</a> — Migrate from other platforms</li><li><a href="/en/self-hosting/docker.html">Docker</a> — Deployment</li></ul>`,34)])])}const u=t(s,[["render",o]]);export{g as __pageData,u as default};
