# Java SDK

Java SDK для **можно.** — клиентская библиотека для JVM-приложений. Поддерживает Java 21+, Spring Boot 3.x/4.x, работает в любых окружениях JVM.

## Установка

### Gradle

```kotlin
// build.gradle.kts
dependencies {
    implementation("com.mozhno:client-java:1.0.0")
}
```

```groovy
// build.gradle
dependencies {
    implementation 'com.mozhno:client-java:1.0.0'
}
```

### Maven

```xml
<dependency>
    <groupId>com.mozhno</groupId>
    <artifactId>client-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Системные требования

| Требование | Минимальная версия |
|------------|-------------------|
| Java | 21+ |
| Совместимость | Любой JVM-фреймворк (Spring Boot, Quarkus, Micronaut, Vanilla Java) |

## Конфигурация

### Builder Pattern

Клиент создаётся через Builder:

```java
import com.mozhno.client.MozhnoClient;
import com.mozhno.client.MozhnoClientBuilder;
import com.mozhno.client.EvaluationContext;

MozhnoClient client = MozhnoClient.builder()
    .serverUrl("http://localhost:8080")
    .apiKey("mz_env_abc123def456")
    .pollInterval(30)              // секунды (опционально)
    .connectTimeout(5000)          // миллисекунды (опционально)
    .readTimeout(10000)            // миллисекунды (опционально)
    .maxRetries(3)                 // количество попыток (опционально)
    .build();
```

### Параметры конфигурации

| Метод | Тип | Обязательно | По умолчанию | Описание |
|-------|-----|-------------|-------------|----------|
| `serverUrl(String)` | `String` | Да | — | URL сервера **можно.** |
| `apiKey(String)` | `String` | Да | — | API-ключ окружения. Формат: `mz_env_...` |
| `pollInterval(int)` | `int` | Нет | `30` | Интервал опроса сервера (секунды) |
| `connectTimeout(int)` | `int` | Нет | `5000` | Таймаут TCP-соединения (мс) |
| `readTimeout(int)` | `int` | Нет | `10000` | Таймаут чтения ответа (мс) |
| `maxRetries(int)` | `int` | Нет | `3` | Максимум повторных попыток при ошибке |
| `httpClient(HttpClient)` | `HttpClient` | Нет | Встроенный | Кастомный HTTP-клиент |

### Интеграция со Spring Boot

```java
@Configuration
public class MozhnoConfig {

    @Value("${mozhno.server-url}")
    private String serverUrl;

    @Value("${mozhno.api-key}")
    private String apiKey;

    @Bean
    public MozhnoClient mozhnoClient() {
        return MozhnoClient.builder()
            .serverUrl(serverUrl)
            .apiKey(apiKey)
            .pollInterval(15)  // быстрее для dev
            .build();
    }
}
```

```properties
# application.properties
mozhno.server-url=http://localhost:8080
mozhno.api-key=mz_env_abc123def456
```

```yaml
# application.yml — по окружениям
mozhno:
  server-url: ${MOZHNO_URL:http://localhost:8080}
  api-key: ${MOZHNO_API_KEY}

---
spring.config.activate.on-profile: production
mozhno:
  server-url: https://flags.example.com
  poll-interval: 60  # реже на проде
```

### Интеграция с Quarkus

```java
@ApplicationScoped
public class MozhnoClientProducer {

    @ConfigProperty(name = "mozhno.server-url")
    String serverUrl;

    @ConfigProperty(name = "mozhno.api-key")
    String apiKey;

    @Produces
    @Singleton
    public MozhnoClient produce() {
        return MozhnoClient.builder()
            .serverUrl(serverUrl)
            .apiKey(apiKey)
            .build();
    }

    public void dispose(@Disposes MozhnoClient client) {
        client.close();
    }
}
```

## API Reference

### isFlagEnabled

Проверяет, включён ли булев флаг для заданного контекста.

```java
boolean isFlagEnabled(String flagKey, EvaluationContext ctx)
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `flagKey` | `String` | Ключ флага |
| `ctx` | `EvaluationContext` | Контекст оценки с атрибутами |

**Возвращает:** `true` если флаг включён, `false` если выключен или флаг не найден.

```java
var ctx = new EvaluationContext().set("userId", "user-123");

if (client.isFlagEnabled("new-checkout", ctx)) {
    renderNewCheckout();
} else {
    renderOldCheckout();
}
```

### getFlagValue

Возвращает значение мультивариативного флага.

```java
String getFlagValue(String flagKey, EvaluationContext ctx, String defaultValue)
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `flagKey` | `String` | Ключ флага |
| `ctx` | `EvaluationContext` | Контекст оценки |
| `defaultValue` | `String` | Значение если флаг не найден или ошибка |

```java
String variant = client.getFlagValue("checkout-design", ctx, "A");

switch (variant) {
    case "A" -> renderClassic();
    case "B" -> renderModern();
    case "C" -> renderMinimal();
    default -> renderClassic();
}
```

> **Совет:** Используйте Java 21 `switch`-expression с pattern matching для чистого кода обработки вариантов.

### getFlags

Возвращает все флаги и их значения для заданного контекста.

```java
Map<String, Boolean> getFlags(EvaluationContext ctx)
```

```java
Map<String, Boolean> allFlags = client.getFlags(ctx);

// Пакетная проверка
boolean checkout = allFlags.getOrDefault("new-checkout", false);
boolean search = allFlags.getOrDefault("ai-search", false);
boolean darkMode = allFlags.getOrDefault("dark-mode", false);
```

Полезно для логирования или отправки всех состояний флагов в аналитику при старте сессии.

### getFlagEvaluation

Возвращает результат оценки с метаданными.

```java
FlagEvaluation getFlagEvaluation(String flagKey, EvaluationContext ctx)
```

```java
FlagEvaluation eval = client.getFlagEvaluation("new-feature", ctx);

System.out.println("Результат: " + eval.isEnabled());
System.out.println("Вариант: " + eval.getValue());
System.out.println("Правило: " + eval.getMatchedRule());
System.out.println("Причина: " + eval.getReason());
System.out.println("Версия: " + eval.getFlagVersion());
```

### Класс FlagEvaluation

| Метод | Тип возврата | Описание |
|-------|-------------|----------|
| `isEnabled()` | `boolean` | Результат оценки |
| `getValue()` | `String` | Значение варианта (для multi-variate) |
| `getMatchedRule()` | `String` или `null` | Имя сработавшего правила |
| `getReason()` | `String` | Причина: `TARGETING_MATCH`, `DEFAULT`, `ERROR`, `FLAG_NOT_FOUND` |
| `getFlagKey()` | `String` | Ключ флага |
| `getFlagVersion()` | `int` | Версия набора правил |

### Значения reason

| Значение | Описание |
|----------|----------|
| `TARGETING_MATCH` | Правило таргетинга сработало, флаг оценён |
| `DEFAULT` | Ни одно правило не подошло, возвращено значение по умолчанию |
| `ERROR` | Ошибка оценки, возвращено значение по умолчанию |
| `FLAG_NOT_FOUND` | Флаг с таким ключом не существует |
| `DISABLED` | Все стратегии флага отключены |

## EvaluationContext

### Создание и наполнение

```java
EvaluationContext ctx = new EvaluationContext()
    .set("userId", "user-123")
    .set("email", "user@example.com")
    .set("country", "RU")
    .set("plan", "premium")
    .set("device", "ios")
    .set("appVersion", "2.4.1")
    .set("tenantId", "tenant-42")
    .set("loginCount", 42)
    .withHashProperty("email");  // хеширование по email вместо userId
```

### Методы EvaluationContext

| Метод | Тип возврата | Описание |
|-------|-------------|----------|
| `set(String key, Object value)` | `EvaluationContext` | Добавить атрибут |
| `get(String key)` | `Object` | Получить значение атрибута |
| `has(String key)` | `boolean` | Проверить наличие атрибута |
| `withHashProperty(String key)` | `EvaluationContext` | Задать свойство для хеширования при роллауте |
| `getHashProperty()` | `String` | Получить текущее свойство хеширования |
| `toMap()` | `Map<String, Object>` | Экспорт всех атрибутов |

### Паттерн: Фабрика контекста

```java
public class ContextFactory {

    public static EvaluationContext forUser(User user) {
        return new EvaluationContext()
            .set("userId", user.getId())
            .set("email", user.getEmail())
            .set("country", user.getCountry())
            .set("plan", user.getPlan())
            .set("device", user.getDeviceType());
    }

    public static EvaluationContext forRequest(HttpServletRequest request) {
        return new EvaluationContext()
            .set("userId", request.getHeader("X-User-Id"))
            .set("tenantId", request.getHeader("X-Tenant-Id"))
            .set("userAgent", request.getHeader("User-Agent"))
            .set("ip", request.getRemoteAddr());
    }
}

// Использование
var ctx = ContextFactory.forUser(currentUser);
boolean enabled = client.isFlagEnabled("new-feature", ctx);
```

## Обработка ошибок

### MozhnoClientException

Базовое исключение для всех ошибок SDK.

```java
try {
    boolean enabled = client.isFlagEnabled("new-feature", ctx);
    // работаем с результатом
} catch (MozhnoClientException e) {
    log.error("Mozhno SDK error: {}", e.getMessage(), e);
    boolean enabled = false;  // безопасный fallback
}
```

### Виды исключений

| Исключение | Когда | Что делать |
|------------|-------|------------|
| `MozhnoClientException` | Базовое: сервер недоступен, ошибка парсинга | Использовать значение по умолчанию |
| `MozhnoInitializationException` | Клиент не смог инициализироваться | Проверить URL и API-ключ |
| `MozhnoTimeoutException` | Таймаут соединения или чтения | Увеличить таймауты или проверить сеть |
| `MozhnoSerializationException` | Ошибка десериализации правил | Несовместимая версия SDK/сервера |

### Ретрай-логика

SDK автоматически повторяет запросы при сетевых ошибках:

```
Попытка 1: мгновенно
Попытка 2: через 1 секунду
Попытка 3: через 2 секунды
Попытка 4: через 4 секунды
...
Максимум: maxRetries попыток (по умолчанию 3)
```

## Жизненный цикл

### Создание и инициализация

Клиент **синхронно** загружает правила при вызове `.build()`:

```java
// Блокирующий вызов — выполнится загрузка правил
MozhnoClient client = MozhnoClient.builder()
    .serverUrl("http://localhost:8080")
    .apiKey("mz_env_abc123")
    .build();

// После build() клиент сразу готов к использованию
boolean enabled = client.isFlagEnabled("test-flag", ctx);
```

### Try-with-resources

Клиент реализует `AutoCloseable`:

```java
try (var client = MozhnoClient.builder()
        .serverUrl("http://localhost:8080")
        .apiKey("mz_env_abc123")
        .build()) {

    for (var user : users) {
        var ctx = ContextFactory.forUser(user);
        if (client.isFlagEnabled("new-feature", ctx)) {
            processWithNewFeature(user);
        } else {
            processWithOldFeature(user);
        }
    }
}  // close() вызывается автоматически
```

### Завершение

```java
client.close();  // останавливает фоновый поллинг, освобождает ресурсы
```

### Хук на завершение JVM

```java
Runtime.getRuntime().addShutdownHook(new Thread(client::close));
```

### Интеграция с Spring

```java
@Bean(destroyMethod = "close")
public MozhnoClient mozhnoClient() {
    return MozhnoClient.builder()
        .serverUrl(serverUrl)
        .apiKey(apiKey)
        .build();
}
```

Spring вызовет `close()` при остановке контекста.

## Полный пример

```java
import com.mozhno.client.MozhnoClient;
import com.mozhno.client.EvaluationContext;

public class CheckoutService {

    private final MozhnoClient mozhno;

    public CheckoutService(MozhnoClient mozhno) {
        this.mozhno = mozhno;
    }

    public CheckoutResult process(Order order, User user) {
        var ctx = new EvaluationContext()
            .set("userId", user.getId())
            .set("email", user.getEmail())
            .set("country", user.getCountry())
            .set("plan", user.getPlan())
            .set("device", user.getDeviceType())
            .set("appVersion", user.getAppVersion());

        // Булев флаг
        if (mozhno.isFlagEnabled("new-checkout", ctx)) {
            return executeNewCheckout(order, user);
        }

        // Мультивариативный флаг
        String design = mozhno.getFlagValue("checkout-design", ctx, "A");
        return executeOldCheckout(order, user, design);
    }

    private CheckoutResult executeNewCheckout(Order order, User user) {
        // Новая логика
        return new CheckoutResult("new", order.getId());
    }

    private CheckoutResult executeOldCheckout(Order order, User user, String design) {
        // Старая логика с учётом варианта дизайна
        return new CheckoutResult("old-" + design, order.getId());
    }
}
```

## Что дальше?

- [JavaScript / TypeScript SDK](/sdk/javascript) — установка и интеграция с React
- [Обзор SDK](/sdk/overview) — архитектура и общие концепции
- [Таргетинг](/guide/targeting) — настройка правил и сегментов
- [Быстрый старт](/guide/quick-start) — создание первого флага
