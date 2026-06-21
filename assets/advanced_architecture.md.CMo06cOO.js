import{_ as a,o as e,c as n,a2 as s}from"./chunks/framework.DnrXFDHb.js";const g=JSON.parse('{"title":"Архитектура сервера","description":"","frontmatter":{},"headers":[],"relativePath":"advanced/architecture.md","filePath":"advanced/architecture.md"}'),r={name:"advanced/architecture.md"};function i(l,t,d,p,o,h){return e(),n("div",null,[...t[0]||(t[0]=[s(`<h1 id="архитектура-сервера" tabindex="-1">Архитектура сервера <a class="header-anchor" href="#архитектура-сервера" aria-label="Permalink to &quot;Архитектура сервера&quot;">​</a></h1><p>Модульная структура <strong>можно.</strong>: диаграмма модулей, технологический стек, поток оценки флагов и JWT-аутентификация.</p><h2 id="модульная-структура" tabindex="-1">Модульная структура <a class="header-anchor" href="#модульная-структура" aria-label="Permalink to &quot;Модульная структура&quot;">​</a></h2><p><strong>можно.</strong> разделён на четыре Maven-модуля, образующих строгий граф зависимостей:</p><pre class="mermaid">graph TD
    SPI[mozhno-spi&lt;br/&gt;Service Provider Interface]
    CORE[mozhno-core&lt;br/&gt;Бизнес-логика]
    WEB[mozhno-web-api&lt;br/&gt;REST API и безопасность]
    APP[mozhno-app&lt;br/&gt;Точка входа]

    SPI --&gt; CORE
    CORE --&gt; WEB
    WEB --&gt; APP
</pre><table tabindex="0"><thead><tr><th>Модуль</th><th>Назначение</th><th>Ключевые классы</th></tr></thead><tbody><tr><td><code>mozhno-spi</code></td><td>Интерфейсы расширений (SPI)</td><td><code>AuthenticationProviderSpi</code>, <code>AuthenticationFlowSpi</code>, <code>QuotaSpi</code>, <code>BillingSpi</code>, <code>FeatureGateSpi</code>, <code>PluginSlot</code></td></tr><tr><td><code>mozhno-core</code></td><td>Бизнес-логика, движок флагов, хранение</td><td><code>FlagService</code>, <code>SegmentService</code>, <code>StrategyEvaluator</code>, <code>AuditService</code>, <code>FlagRowMapper</code></td></tr><tr><td><code>mozhno-web-api</code></td><td>REST-контроллеры, Spring Security, JWT, OpenAPI</td><td><code>FlagController</code>, <code>AuthController</code>, <code>JwtTokenProvider</code>, <code>SecurityConfig</code></td></tr><tr><td><code>mozhno-app</code></td><td>Точка входа, статические ресурсы, миграции Flyway</td><td><code>MozhnoApplication</code>, <code>application.properties</code>, <code>db/migration/*.sql</code></td></tr></tbody></table><h3 id="направление-зависимостеи" tabindex="-1">Направление зависимостей <a class="header-anchor" href="#направление-зависимостеи" aria-label="Permalink to &quot;Направление зависимостей&quot;">​</a></h3><p>Зависимости направлены вниз по стеку:</p><ul><li><code>mozhno-spi</code> не зависит ни от одного модуля — чистые интерфейсы</li><li><code>mozhno-core</code> зависит только от <code>mozhno-spi</code> — реализует бизнес-логику через интерфейсы SPI</li><li><code>mozhno-web-api</code> зависит от <code>mozhno-core</code> — предоставляет REST API поверх бизнес-логики</li><li><code>mozhno-app</code> зависит от всех модулей — собирает приложение, конфигурирует Spring Boot, внедряет реализации</li></ul><p>Это гарантирует, что бизнес-логика не зависит от HTTP-транспорта, а SPI-контракты не привязаны к конкретной реализации.</p><h2 id="технологическии-стек" tabindex="-1">Технологический стек <a class="header-anchor" href="#технологическии-стек" aria-label="Permalink to &quot;Технологический стек&quot;">​</a></h2><h3 id="бэкенд" tabindex="-1">Бэкенд <a class="header-anchor" href="#бэкенд" aria-label="Permalink to &quot;Бэкенд&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Технология</th><th>Версия</th><th>Назначение</th></tr></thead><tbody><tr><td><strong>JDK</strong></td><td>25</td><td>Среда выполнения. Виртуальные потоки (Project Loom), ZGC</td></tr><tr><td><strong>Spring Boot</strong></td><td>4.0</td><td>DI-контейнер, авто-конфигурация, Actuator</td></tr><tr><td><strong>Spring Security</strong></td><td>6.x</td><td>Аутентификация, авторизация, JWT-фильтры</td></tr><tr><td><strong>JdbcTemplate</strong></td><td>—</td><td>Прямые SQL-запросы без ORM. RowMapper для маппинга</td></tr><tr><td><strong>Flyway</strong></td><td>10.x</td><td>Версионирование схемы БД, миграции</td></tr><tr><td><strong>HikariCP</strong></td><td>6.x</td><td>Пул соединений к PostgreSQL</td></tr><tr><td><strong>Caffeine</strong></td><td>3.x</td><td>Ин-мемори кеш (флаги, сегменты, API-ключи)</td></tr><tr><td><strong>ZGC</strong></td><td>—</td><td>Сборщик мусора с субмиллисекундными паузами</td></tr><tr><td><strong>jjwt</strong></td><td>0.12.x</td><td>JWT: создание, подпись HMAC-SHA256, валидация</td></tr></tbody></table><h3 id="фронтенд" tabindex="-1">Фронтенд <a class="header-anchor" href="#фронтенд" aria-label="Permalink to &quot;Фронтенд&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Технология</th><th>Версия</th><th>Назначение</th></tr></thead><tbody><tr><td><strong>React</strong></td><td>19</td><td>SPA-фреймворк, Server Components</td></tr><tr><td><strong>Tailwind CSS</strong></td><td>4</td><td>Utility-first CSS, JIT-компиляция</td></tr><tr><td><strong>Radix UI</strong></td><td>—</td><td>Headless UI-компоненты (доступность, клавиатурная навигация)</td></tr><tr><td><strong>Node.js</strong></td><td>24</td><td>Среда сборки фронтенда</td></tr></tbody></table><h3 id="инфраструктура" tabindex="-1">Инфраструктура <a class="header-anchor" href="#инфраструктура" aria-label="Permalink to &quot;Инфраструктура&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Технология</th><th>Назначение</th></tr></thead><tbody><tr><td><strong>PostgreSQL</strong></td><td>Персистентное хранение всех данных</td></tr><tr><td><strong>Docker</strong></td><td>Контейнеризация, трёхэтапная сборка</td></tr><tr><td><strong>Kubernetes</strong></td><td>Оркестрация, авто-масштабирование, отказоустойчивость</td></tr></tbody></table><h3 id="почему-jdbctemplate-а-не-jpa-hibernate" tabindex="-1">Почему JdbcTemplate, а не JPA/Hibernate <a class="header-anchor" href="#почему-jdbctemplate-а-не-jpa-hibernate" aria-label="Permalink to &quot;Почему JdbcTemplate, а не JPA/Hibernate&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Критерий</th><th>JdbcTemplate</th><th>JPA/Hibernate</th></tr></thead><tbody><tr><td>Контроль SQL</td><td>Полный — запросы пишутся вручную</td><td>Ограниченный — генерация через JPQL/HQL</td></tr><tr><td>Производительность</td><td>Предсказуемая — нет магии ORM</td><td>Может деградировать из-за Lazy Loading, dirty checking</td></tr><tr><td>Потребление памяти</td><td>Низкое — нет persistence context</td><td>Выше из-за кеша первого уровня</td></tr><tr><td>Сложность маппинга</td><td>Ручные RowMapper&#39;ы</td><td>Автоматический маппинг</td></tr><tr><td>Кривая обучения</td><td>Низкая — обычный SQL</td><td>Высокая — знание JPA-спецификации</td></tr></tbody></table><p>Выбор JdbcTemplate обусловлен тем, что система фича-флагов имеет чётко определённые SQL-запросы без сложных объектных графов. Явный SQL даёт полный контроль над планом выполнения и упрощает оптимизацию индексов.</p><h2 id="встраивание-фронтенда" tabindex="-1">Встраивание фронтенда <a class="header-anchor" href="#встраивание-фронтенда" aria-label="Permalink to &quot;Встраивание фронтенда&quot;">​</a></h2><p>React 19 SPA собирается отдельно (Node.js 24, Webpack/Vite), результат помещается в <code>static/</code>. При сборке JAR статические файлы копируются в ресурсы <code>mozhno-app</code>:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mozhno-app/src/main/resources/static/</span></span>
<span class="line"><span>├── index.html</span></span>
<span class="line"><span>├── assets/</span></span>
<span class="line"><span>│   ├── main-abc123.js</span></span>
<span class="line"><span>│   └── main-abc123.css</span></span>
<span class="line"><span>└── favicon.ico</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>Spring Boot обслуживает статику как classpath-ресурсы. Swagger UI и OpenAPI-спецификация также раздаются из ресурсов JAR.</p><p>Docker-образ использует трёхэтапную сборку:</p><div class="language-dockerfile vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">dockerfile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Этап 1: Сборка фронтенда</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> node:24-alpine </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">AS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> web-builder</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WORKDIR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /app</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mozhno-web/ .</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RUN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> npm ci &amp;&amp; npm run build</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Этап 2: Сборка Java</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> eclipse-temurin:25-alpine </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">AS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> java-builder</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WORKDIR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /app</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> . .</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> --from=web-builder /app/dist ./mozhno-app/src/main/resources/static/</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RUN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ./mvnw package -DskipTests</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Этап 3: Runtime</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ubuntu:noble</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RUN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> apt-get update &amp;&amp; apt-get install -y openjdk-25-jre-headless</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> --from=java-builder /app/mozhno-app/target/*.jar app.jar</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">USER</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 1000</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ENTRYPOINT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;java&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;-jar&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;app.jar&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><h2 id="поток-оценки-флага" tabindex="-1">Поток оценки флага <a class="header-anchor" href="#поток-оценки-флага" aria-label="Permalink to &quot;Поток оценки флага&quot;">​</a></h2><p>Процесс принятия решения о значении флага при вызове SDK:</p><pre class="mermaid">flowchart TD
    START([SDK вызывает&lt;br/&gt;isEnabled flagKey, context])
    LOAD[Загрузка конфигурации&lt;br/&gt;флага из кеша]
    CHECK_FLAG{Флаг существует&lt;br/&gt;и активен?}
    DEFAULT[Вернуть&lt;br/&gt;значение по умолчанию]
    IS_MULTI{Флаг&lt;br/&gt;мультивариативный?}
    MULTI_VAL[Вернуть строковое&lt;br/&gt;значение варианта]
    STRATEGIES[Итерация по стратегиям&lt;br/&gt;в порядке приоритета]
    NEXT_STRATEGY{Есть следующая&lt;br/&gt;стратегия?}
    EVALUATE_TYPE{Тип стратегии}
    DEF_STRAT[Default:&lt;br/&gt;вернуть on/off]
    GRAD_STRAT[Gradual:&lt;br/&gt;hash userId % 100&lt;br/&gt;сравнить с процентом]
    SCHED_STRAT[Scheduled:&lt;br/&gt;текущее время в&lt;br/&gt;диапазоне активации?]
    CUSTOM_STRAT[Custom:&lt;br/&gt;вызов FeatureGateSpi]
    MATCH{Стратегия&lt;br/&gt;совпала?}
    RETURN_TRUE[Вернуть true&lt;br/&gt;или значение варианта]
    RETURN_FALSE[Вернуть false]

    START --&gt; LOAD
    LOAD --&gt; CHECK_FLAG
    CHECK_FLAG --&gt;|Нет| DEFAULT
    CHECK_FLAG --&gt;|Да| IS_MULTI
    IS_MULTI --&gt;|Нет| STRATEGIES
    IS_MULTI --&gt;|Да| MULTI_VAL
    STRATEGIES --&gt; NEXT_STRATEGY
    NEXT_STRATEGY --&gt;|Нет| RETURN_FALSE
    NEXT_STRATEGY --&gt;|Да| EVALUATE_TYPE
    EVALUATE_TYPE --&gt; DEF_STRAT
    EVALUATE_TYPE --&gt; GRAD_STRAT
    EVALUATE_TYPE --&gt; SCHED_STRAT
    EVALUATE_TYPE --&gt; CUSTOM_STRAT
    DEF_STRAT --&gt; MATCH
    GRAD_STRAT --&gt; MATCH
    SCHED_STRAT --&gt; MATCH
    CUSTOM_STRAT --&gt; MATCH
    MATCH --&gt;|Да| RETURN_TRUE
    MATCH --&gt;|Нет| NEXT_STRATEGY
</pre><p><strong>Ключевой момент:</strong> оценка флага происходит <strong>локально в SDK</strong> без сетевого запроса к серверу. Правила загружаются фоновым процессом и кешируются. Это даёт латентность &lt; 1 мс.</p><h2 id="поток-jwt-аутентификации" tabindex="-1">Поток JWT-аутентификации <a class="header-anchor" href="#поток-jwt-аутентификации" aria-label="Permalink to &quot;Поток JWT-аутентификации&quot;">​</a></h2><h3 id="аутентификация-логин" tabindex="-1">Аутентификация (логин) <a class="header-anchor" href="#аутентификация-логин" aria-label="Permalink to &quot;Аутентификация (логин)&quot;">​</a></h3><pre class="mermaid">sequenceDiagram
    participant Client as Клиент (браузер)
    participant Server as Сервер можно.
    participant DB as PostgreSQL
    participant JWT as JwtTokenProvider

    Client-&gt;&gt;Server: POST /api/auth/login&lt;br/&gt;{email, password}
    Server-&gt;&gt;Server: Проверка учётных данных
    Server-&gt;&gt;JWT: generateAccessToken(user)
    JWT-&gt;&gt;JWT: Подпись HMAC-SHA256
    JWT--&gt;&gt;Server: access_token (15 мин)
    Server-&gt;&gt;JWT: generateRefreshToken(user)
    JWT-&gt;&gt;JWT: Генерация случайного токена
    JWT-&gt;&gt;DB: INSERT INTO refresh_tokens&lt;br/&gt;(user_id, token_hash, family)
    DB--&gt;&gt;Server: OK
    Server--&gt;&gt;Client: { access_token, refresh_token }
</pre><h3 id="доступ-к-api" tabindex="-1">Доступ к API <a class="header-anchor" href="#доступ-к-api" aria-label="Permalink to &quot;Доступ к API&quot;">​</a></h3><pre class="mermaid">sequenceDiagram
    participant Client
    participant Filter as JwtAuthFilter
    participant Provider as JwtTokenProvider
    participant Controller as REST Controller

    Client-&gt;&gt;Filter: GET /api/flags&lt;br/&gt;Authorization: Bearer &lt;access_token&gt;
    Filter-&gt;&gt;Provider: validateToken(access_token)
    Provider-&gt;&gt;Provider: Проверка подписи HMAC-SHA256
    Provider-&gt;&gt;Provider: Проверка срока действия
    Provider--&gt;&gt;Filter: Authentication (валидный)
    Filter-&gt;&gt;Filter: SecurityContextHolder.set(auth)
    Filter-&gt;&gt;Controller: запрос продолжается
    Controller--&gt;&gt;Client: данные флагов
</pre><h3 id="обновление-токенов-refresh" tabindex="-1">Обновление токенов (Refresh) <a class="header-anchor" href="#обновление-токенов-refresh" aria-label="Permalink to &quot;Обновление токенов (Refresh)&quot;">​</a></h3><pre class="mermaid">sequenceDiagram
    participant Client
    participant Server
    participant DB

    Client-&gt;&gt;Server: POST /api/auth/refresh&lt;br/&gt;{ refresh_token }
    Server-&gt;&gt;Server: Хеширование refresh_token
    Server-&gt;&gt;DB: SELECT * FROM refresh_tokens&lt;br/&gt;WHERE token_hash = ?&lt;br/&gt;FOR UPDATE
    DB--&gt;&gt;Server: токен найден
    Server-&gt;&gt;Server: Проверка срока действия
    Server-&gt;&gt;DB: DELETE FROM refresh_tokens&lt;br/&gt;WHERE id = ? (инвалидация старого)
    Server-&gt;&gt;Server: Генерация нового refresh_token
    Server-&gt;&gt;DB: INSERT INTO refresh_tokens&lt;br/&gt;(user_id, token_hash, family)
    Server-&gt;&gt;Server: Генерация нового access_token
    Server--&gt;&gt;Client: { access_token, refresh_token }
</pre><p><strong>Семейная ротация:</strong> при каждом обновлении старый refresh-токен инвалидируется, а новый сохраняется в ту же «семью» (family). Если злоумышленник использует старый (уже инвалидированный) токен, вся семья аннулируется — это предотвращает replay-атаки.</p><p><code>SELECT ... FOR UPDATE</code> гарантирует, что два конкурентных запроса на обновление (с разных экземпляров сервера) не создадут дублирующих токенов.</p><h2 id="spi-архитектура-расширении" tabindex="-1">SPI: архитектура расширений <a class="header-anchor" href="#spi-архитектура-расширении" aria-label="Permalink to &quot;SPI: архитектура расширений&quot;">​</a></h2><p>Интерфейсы из <code>mozhno-spi</code> позволяют заменять компоненты системы без изменения ядра:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mozhno-spi/</span></span>
<span class="line"><span>├── AuthenticationProviderSpi.java   — аутентификация пользователей</span></span>
<span class="line"><span>├── AuthenticationFlowSpi.java       — дополнительные шаги аутентификации</span></span>
<span class="line"><span>├── QuotaSpi.java                    — квоты и лимиты</span></span>
<span class="line"><span>├── BillingSpi.java                  — биллинг и платёжная информация</span></span>
<span class="line"><span>├── FeatureGateSpi.java              — управление Enterprise-функциями</span></span>
<span class="line"><span>└── PluginSlot.java                  — слоты для UI-плагинов</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>Подробнее — на странице <a href="/advanced/open-core.html">Open Core</a>.</p><h2 id="диаграмма-развертывания" tabindex="-1">Диаграмма развёртывания <a class="header-anchor" href="#диаграмма-развертывания" aria-label="Permalink to &quot;Диаграмма развёртывания&quot;">​</a></h2><pre class="mermaid">graph TB
    subgraph &quot;Браузер&quot;
        SPA[React 19 SPA&lt;br/&gt;Tailwind CSS 4&lt;br/&gt;Radix UI]
    end

    subgraph &quot;Kubernetes Cluster&quot;
        INGRESS[Ingress&lt;br/&gt;TLS termination]
        subgraph &quot;Pods (2–8)&quot;
            P1[mozhno-1&lt;br/&gt;Spring Boot 4.0&lt;br/&gt;JdbcTemplate&lt;br/&gt;Caffeine Cache]
            P2[mozhno-2&lt;br/&gt;Spring Boot 4.0&lt;br/&gt;JdbcTemplate&lt;br/&gt;Caffeine Cache]
        end
        SVC[Service&lt;br/&gt;ClusterIP :8080]
    end

    PG[(PostgreSQL 15+&lt;br/&gt;PersistentVolume&lt;br/&gt;WAL-архивация)]

    SDK[Java/Python/Node.js SDK]
    SDK2[Внешнее приложение]

    SPA --&gt; INGRESS
    INGRESS --&gt; SVC
    SVC --&gt; P1
    SVC --&gt; P2
    P1 --&gt; PG
    P2 --&gt; PG
    SDK2 --&gt; INGRESS
</pre><h2 id="что-дальше" tabindex="-1">Что дальше? <a class="header-anchor" href="#что-дальше" aria-label="Permalink to &quot;Что дальше?&quot;">​</a></h2><ul><li><a href="/advanced/open-core.html">Open Core</a> — Community vs Enterprise, SPI-интерфейсы, плагины</li><li><a href="/advanced/migration.html">Миграция</a> — переход с LaunchDarkly, Unleash, Flagsmith</li><li><a href="/self-hosting/docker.html">Docker</a> — продакшен-деплой</li><li><a href="/self-hosting/kubernetes.html">Kubernetes</a> — оркестрация и масштабирование</li></ul>`,47)])])}const b=a(r,[["render",i]]);export{g as __pageData,b as default};
