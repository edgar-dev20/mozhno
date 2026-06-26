# Лучшие практики

Свод рекомендаций по работе с фиче-флагами в **можно**<span class=brand-dot>.</span>: от именования до стратегии очистки и управления флаговым долгом.

## Именование флагов

Хорошее имя флага — самодокументированное и однозначное. Плохое — требует телепатии.

### Конвенция именования

```
<функциональность>-<действие/статус>
```

| Шаблон | Пример | Хорошо/Плохо |
|--------|--------|--------------|
| `новый-компонент` | `new-checkout` | Хорошо |
| `фича-enabled` | `ai-search-enabled` | Хорошо |
| `kill-компонент` | `kill-payment-gw` | Хорошо |
| `эксперимент-описание` | `exp-cta-color` | Хорошо |
| `flag1` | — | Плохо |
| `test` | — | Плохо |
| `feature_flag_new` | — | Плохо (неинформативно) |

### Рекомендации

| Правило | Пример |
|---------|--------|
| **kebab-case** | `new-checkout`, `dark-mode-rollout` |
| **Только латиница, цифры и дефисы** | `api-v2`, `search-v3` |
| **Не используйте `flag` или `feature` в ключе** | ❌ `feature-new-checkout-flag` → ✅ `new-checkout` |
| **Kill switch — префикс `kill-`** | `kill-payment-gateway`, `kill-third-party-api` |
| **Эксперименты — префикс `exp-`** | `exp-pricing-layout`, `exp-cta-placement` |
| **Временные фичи — префикс `tmp-`** | `tmp-holiday-banner-2026` |
| **Перманентные конфигурации — префикс `cfg-`** | `cfg-rate-limit`, `cfg-max-upload-size` |

### Именование флаговых ключей

| Правило | Хорошо | Плохо |
|---------|--------|-------|
| Короткие осмысленные идентификаторы | `A`, `B`, `control`, `treatment` | `variant1`, `variant2` |
| Контрольная группа — `control` или `A` | `control` | `old`, `current` |
| В описании флага — расшифровка вариантов | A = старый дизайн, B = новый | — |

## Когда архивировать, а когда удалять

| Критерий | Архив | Удаление |
|----------|-------|----------|
| Флаг отработал, старый код удалён | ✅ Да | ❌ Нет |
| Нужна история изменений для аудита | ✅ Да | ❌ Нет |
| Экспериментальный флаг, не пошёл в прод | ❌ Нет | ✅ Да |
| Флаг создан по ошибке (опечатка в ключе) | ❌ Нет | ✅ Да |
| Тестовый флаг для локальной разработки | ❌ Нет | ✅ Да |
| Флаг-дубликат | ❌ Нет | ✅ Да |

> **Совет:** Правило по умолчанию — архивируйте. Удаление необратимо. Если сомневаетесь, отправьте в архив и удалите через месяц, если флаг точно не понадобится.

## Модель разрешений (Permission Model)

**можно**<span class=brand-dot>.</span> использует ролевую модель доступа с иерархией `ADMIN` → `DEVELOPER` → `VIEWER` (каждая роль включает права нижестоящих):

| Действие | Admin | Developer | Viewer |
|----------|-------|-----------|--------|
| Просмотр флагов и сегментов | ✅ | ✅ | ✅ |
| Просмотр и экспорт аудит-лога | ✅ | ✅ | ✅ |
| Создание флагов | ✅ | ✅ | ❌ |
| Изменение стратегий и таргетинга | ✅ | ✅ | ❌ |
| Архивация флагов | ✅ | ✅ | ❌ |
| Управление сегментами | ✅ | ✅ | ❌ |
| Удаление флагов | ✅ | ✅ | ❌ |
| Управление окружениями | ✅ | ❌ | ❌ |
| Управление API-ключами | ✅ | ❌ | ❌ |
| Управление пользователями | ✅ | ❌ | ❌ |
| Управление интеграциями (вебхуками) | ✅ | ❌ | ❌ |

### Рекомендации по ролям

| Принцип | Описание |
|---------|----------|
| **Принцип наименьших привилегий** | Developer не имеет доступа к управлению ключами, пользователями и окружениями |
| **Управление инфраструктурой — только Admin** | API-ключи, пользователи, окружения и интеграции доступны только роли Admin |
| **Viewer для сторонних** | Аудиторы, менеджеры продукта — только просмотр |
| **Регулярный аудит** | Раз в квартал проверяйте список пользователей и их роли |

## Стратегия очистки флагов

Флаги, оставленные в коде после полного роллаута, создают **флаговый долг** (flag debt) — технический долг, характерный для систем с фиче-флагами.

### Признаки флагового долга

- Условные конструкции `if (flag)` с мёртвой веткой старого кода
- Флаги, включённые на 100% больше месяца
- Сложные цепочки зависимостей между флагами
- Код, который невозможно понять без знания состояния флагов

### Процесс очистки

```mermaid
graph TD
    A[Флаг на 100%] --> B{Прошло > 2 недель?}
    B -->|Нет| C[Ждём]
    B -->|Да| D[Удаляем старый код]
    D --> E[Мержим PR]
    E --> F[Архивируем флаг]
    F --> G{Прошёл месяц?}
    G -->|Да| H[Удаляем флаг]
    G -->|Нет| F
```

### Чек-лист очистки флага

1. **Флаг на 100%** минимум 2 недели
2. **Метрики стабильны** — нет регрессий
3. **Старый код не нужен** — никто не планирует откат
4. **Удалить `if (flag)`**: оставить только новый код, удалить старый
5. **Удалить импорт/зависимость SDK**, если флаг был последним
6. **Заархивировать флаг** в веб-панели
7. **Документировать удаление** в описании флага: дата, причина

## Архитектурные паттерны

### Паттерны организации флагов в коде

| Паттерн | Код | Когда применять |
|---------|-----|-----------------|
| **Инлайн** | `if (client.isEnabled("flag", ctx)) { ... }` | Единичные флаги, быстрый старт |
| **Feature Wrapper** | `featureService.ifEnabled("flag", ctx, () -> newCode())` | Много флагов в одном сервисе — убирает повторяющийся `if` |
| **Фабрика контекста** | `MozhnoContexFactory.forUser(user)` | Один и тот же набор атрибутов передаётся в десятках мест |
| **Middleware** | Перехватчик HTTP/gRPC, добавляющий атрибуты в контекст | Атрибуты из заголовков запроса (userId, tenantId, country) |
| **ContextProvider** | `client` сам получает контекст через `MozhnoContextProvider` | Spring-приложения — не передавать контекст в каждый `isEnabled()` |

### Пример: Feature Wrapper на Java

```java
@Service
public class FeatureService {
    private final MozhnoClient client;

    public <T> T ifEnabled(String flag, MozhnoContext ctx,
                           Supplier<T> newCode, Supplier<T> oldCode) {
        return client.isEnabled(flag, ctx) ? newCode.get() : oldCode.get();
    }
}

// Использование:
var result = featureService.ifEnabled("new-checkout", ctx,
    () -> processNew(order),   // новый код
    () -> processOld(order)    // старый код
);
```

### Пример: Фабрика контекста на Java

```java
public class MozhnoContextFactory {
    public static MozhnoContext forRequest(HttpServletRequest req) {
        return MozhnoContext.builder()
            .userId(req.getHeader("X-User-Id"))
            .addProperty("tenantId", req.getHeader("X-Tenant-Id"))
            .addProperty("country", req.getHeader("X-Country"))
            .addProperty("device", req.getHeader("X-Device"))
            .build();
    }
}
```

### Пример: MozhnoContextProvider

```java
@Configuration
public class MozhnoConfig {

    @Bean
    public MozhnoContextProvider contextProvider() {
        return () -> {
            var request = ((ServletRequestAttributes)
                RequestContextHolder.currentRequestAttributes()).getRequest();
            return MozhnoContext.builder()
                .userId(request.getHeader("X-User-Id"))
                .addProperty("tenantId", request.getHeader("X-Tenant-Id"))
                .addProperty("country", request.getHeader("X-Country"))
                .build();
        };
    }
}

// Использование — контекст подставляется автоматически:
boolean enabled = client.isEnabled("new-checkout");
```

## Тестирование с фиче-флагами

### Модульное тестирование

Тестируйте **обе** ветки кода — с флагом и без флага:

```java
@Test
void testNewCheckoutFlow() {
    var ctx = MozhnoContext.builder().userId("test-user").build();
    when(client.isEnabled("new-checkout", ctx)).thenReturn(true);

    var result = checkoutService.process(order, ctx);

    assertThat(result.getFlow()).isEqualTo("new");
}

@Test
void testOldCheckoutFlow() {
    var ctx = MozhnoContext.builder().userId("test-user").build();
    when(client.isEnabled("new-checkout", ctx)).thenReturn(false);

    var result = checkoutService.process(order, ctx);

    assertThat(result.getFlow()).isEqualTo("old");
}
```


> **Совет:** Мокайте SDK-клиент в тестах, а не сервер **можно**<span class=brand-dot>.</span>. Тесты должны быть быстрыми и не зависеть от сети.

## Антипаттерны

| Антипаттерн | Почему плохо | Как исправить |
|-------------|-------------|---------------|
| **Флаг на флаге** | `if (flagA && flagB)` — невозможно отлаживать | Объединить в сегмент или один флаг |
| **Флаги в циклах** | Проверка флага на каждой итерации — накладные расходы | Проверить флаг до цикла |
| **Флаг как конфиг** | `if (flag) timeout = 30 else timeout = 60` | Использовать настоящий конфиг, не фиче-флаг |
| **Вечные флаги** | Флаг существует 6+ месяцев | Запланировать удаление или пометить как перманентный |
| **Флаги без владельца** | Никто не отвечает за очистку | Назначить ответственного в описании флага |
| **Копипаста контекста** | Дублирование `MozhnoContext.builder()...` | Вынести в фабричный метод или middleware |

## Что дальше?

- [Работа с флагами](/guide/flags-workflow) — жизненный цикл и командный процесс
- [Таргетинг](/guide/targeting) — правила и сегменты
- [Аудит](/guide/audit) — отслеживание изменений
- [SDK: Обзор](/sdk/overview) — архитектура SDK и интеграция в код