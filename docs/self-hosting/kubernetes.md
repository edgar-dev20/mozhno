# Kubernetes-деплой

Развёртывание **можно.** в кластере Kubernetes: Deployment, Service, HPA, PDB, пробы и управление секретами.

## Обзор манифестов

Все манифесты расположены в директории `k8s/` репозитория:

```
k8s/
├── deployment.yaml    — Deployment + Service + PDB + HPA
└── config.yaml        — Secrets + ConfigMap
```

Применение:

```bash
kubectl apply -f k8s/
```

## Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mozhno-server
  labels:
    app: mozhno
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: mozhno
  template:
    metadata:
      labels:
        app: mozhno
    spec:
      terminationGracePeriodSeconds: 45
      containers:
        - name: mozhno
          image: ghcr.io/mozhno-dev/mozhno:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
              name: http
          env:
            - name: JAVA_TOOL_OPTIONS
              value: "-XX:+UseZGC -XX:MaxRAMPercentage=75.0"
            - name: SPRING_DATASOURCE_URL
              valueFrom:
                secretKeyRef:
                  name: mozhno-db
                  key: url
            - name: SPRING_DATASOURCE_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mozhno-db
                  key: username
            - name: SPRING_DATASOURCE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mozhno-db
                  key: password
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: mozhno-jwt
                  key: secret
            - name: APP_BASE_URL
              value: "https://flags.example.com"
            - name: HIKARI_MAX_POOL_SIZE
              value: "30"
            - name: HIKARI_MIN_IDLE
              value: "5"
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 15
            timeoutSeconds: 5
            failureThreshold: 5
          startupProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 30
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
```

### Параметры развёртывания

| Параметр | Значение | Обоснование |
|----------|----------|-------------|
| `replicas` | 2 | Минимальная избыточность для высокой доступности |
| `maxUnavailable` | 0 | Ни один под не выключается во время обновления (zero-downtime) |
| `maxSurge` | 1 | Допускается один дополнительный под при rolling update |
| `terminationGracePeriodSeconds` | 45 | Время на корректное завершение перед принудительной остановкой |
| `memory requests` | 512Mi | Минимальный запас памяти для JVM и кешей |
| `memory limits` | 2Gi | Верхняя граница с учётом MaxRAMPercentage=75 (~1.5G для heap) |
| `cpu requests` | 250m | Гарантированная доля CPU для отзывчивости |
| `cpu limits` | 2000m | Потолок CPU для пиковых нагрузок |
| `runAsNonRoot` | true | Запуск от непривилегированного пользователя |
| `runAsUser` | 1000 | UID пользователя `mozhno` внутри контейнера |
| `allowPrivilegeEscalation` | false | Запрет повышения привилегий |
| `capabilities.drop` | ALL | Удаление всех Linux capabilities |

### JVM и ZGC

```bash
-XX:+UseZGC               # Z Garbage Collector — сверхнизкие паузы (< 1 мс)
-XX:MaxRAMPercentage=75.0  # JVM не превышает 75% от лимита памяти контейнера
```

При лимите в 2Gi JVM выделит не более 1.5 GiB под heap. Оставшаяся память — для Metaspace, JIT-компилятора, стека потоков и нативных библиотек.

## Пробы (Probes)

### startupProbe

```yaml
startupProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 30    # до 150 секунд на первый запуск
```

Защищает медленно стартующие поды от убийства liveness-пробой. Даёт приложению до 150 секунд (10 + 5 × 30) на запуск, включая применение Flyway-миграций и прогрев пула соединений.

### readinessProbe

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
```

Определяет, готов ли под принимать трафик. При провале трёх проверок под исключается из Service. Восстанавливается автоматически при возвращении `UP`.

### livenessProbe

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 60
  periodSeconds: 15
  timeoutSeconds: 5
  failureThreshold: 5
```

Обнаруживает зависшие или deadlocked поды. При пяти последовательных провалах (75 секунд) kubelet перезапускает контейнер.

## Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mozhno-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mozhno-server
  minReplicas: 2
  maxReplicas: 8
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Параметры масштабирования

| Параметр | Значение | Обоснование |
|----------|----------|-------------|
| `minReplicas` | 2 | Минимальная избыточность |
| `maxReplicas` | 8 | Ограничение расхода ресурсов кластера |
| CPU target | 70% | Упреждающее масштабирование до насыщения CPU |
| Memory target | 80% | Защита от OOMKill до срабатывания лимитов |

## Pod Disruption Budget (PDB)

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: mozhno-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: mozhno
```

Гарантирует, что минимум 1 под всегда доступен при добровольных нарушениях (drain ноды, обновление кластера).

## Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mozhno-server
  labels:
    app: mozhno
spec:
  type: ClusterIP
  ports:
    - port: 8080
      targetPort: 8080
      name: http
  selector:
    app: mozhno
```

| Параметр | Значение | Описание |
|----------|----------|----------|
| `type` | `ClusterIP` | Доступен только внутри кластера |
| `port` | 8080 | Порт, на котором сервис принимает трафик |
| `targetPort` | 8080 | Порт контейнера, куда направляется трафик |

Для доступа извне кластера используйте Ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mozhno
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - flags.example.com
      secretName: mozhno-tls
  rules:
    - host: flags.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: mozhno-server
                port:
                  number: 8080
```

## Secrets

Секреты разделены на два объекта для раздельного управления:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mozhno-db
  labels:
    app: mozhno
type: Opaque
stringData:
  url: "jdbc:postgresql://postgres-service:5432/feature_flags"
  username: "flags_user"
  password: "change-me"
---
apiVersion: v1
kind: Secret
metadata:
  name: mozhno-jwt
  labels:
    app: mozhno
type: Opaque
stringData:
  secret: ""
```

Для продакшен-окружения используйте Sealed Secrets или External Secrets Operator:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: mozhno-db
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: mozhno-db
  data:
    - secretKey: url
      remoteRef:
        key: secret/mozhno
        property: db_url
    - secretKey: username
      remoteRef:
        key: secret/mozhno
        property: db_username
    - secretKey: password
      remoteRef:
        key: secret/mozhno
        property: db_password
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: mozhno-jwt
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: mozhno-jwt
  data:
    - secretKey: secret
      remoteRef:
        key: secret/mozhno
        property: jwt_secret
```

## ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mozhno-config
  labels:
    app: mozhno
data:
  APP_BASE_URL: "https://flags.example.com"
  CLIENT_MAX_METRICS_PER_KEY: "1000"
  HIKARI_MAX_POOL_SIZE: "30"
  HIKARI_MIN_IDLE: "5"
  LOG_LEVEL_APP: "INFO"
```

Несекретные настройки выносятся в ConfigMap. Для перезапуска подов при изменении:

```bash
kubectl rollout restart deployment/mozhno-server
```

## Проверка развёртывания

```bash
kubectl get pods -l app=mozhno
kubectl get svc mozhno-server
kubectl get hpa mozhno-hpa
kubectl describe pdb mozhno-pdb

kubectl logs -l app=mozhno --tail=50
kubectl port-forward svc/mozhno-server 8080:8080
curl localhost:8080/actuator/health
```

## Что дальше?

- [Docker](/self-hosting/docker) — контейнеризация без оркестрации
- [База данных](/self-hosting/database) — настройка PostgreSQL, Flyway, бэкапы
- [Масштабирование](/self-hosting/scaling) — стратегии горизонтального масштабирования
- [Архитектура](/advanced/architecture) — модульная структура сервера
