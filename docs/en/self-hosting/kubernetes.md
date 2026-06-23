# Kubernetes

Deploy **можно**<span class=brand-dot>.</span> on Kubernetes with production-grade configuration: high availability, auto-scaling, rolling updates, and health probes.

## Manifest Overview

All manifests are in the `k8s/` directory:

```
k8s/
├── deployment.yaml    — Deployment + Service + PDB + HPA
└── config.yaml        — Secrets + ConfigMap
```

Apply with:

```bash
kubectl apply -f k8s/
```

## Deployment Manifest

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

## Rolling Update Strategy

| Parameter | Value | Explanation |
|-----------|-------|-------------|
| `maxUnavailable` | `0` | Never drop below the desired replica count during updates |
| `maxSurge` | `1` | Allow one extra pod during rollout for zero-downtime |
| `terminationGracePeriodSeconds` | `45` | Time for graceful shutdown before force kill |

With 2 replicas, a rolling update creates a 3rd pod with the new version, waits for it to become ready, then terminates one old pod.

The JVM is configured with ZGC (`-XX:+UseZGC`) for sub-millisecond pause times and `-XX:MaxRAMPercentage=75.0` for proper container memory management.

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

| Parameter | Value | Reason |
|-----------|-------|--------|
| `minReplicas` | 2 | High availability baseline |
| `maxReplicas` | 8 | Reasonable upper bound for most deployments |
| CPU target | 70% | Trigger scale-out before saturation |
| Memory target | 80% | Leave headroom for GC and spikes |

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

`minAvailable: 1` ensures that at least one pod remains available during voluntary disruptions (node drains, cluster upgrades).

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
  selector:
    app: mozhno
  ports:
    - name: http
      port: 8080
      targetPort: 8080
      protocol: TCP
```

`ClusterIP` is sufficient — expose the service externally via Ingress.

### Ingress Example

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
        - mozhno.example.com
      secretName: mozhno-tls
  rules:
    - host: mozhno.example.com
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

## Health Probes

| Probe | Endpoint | Initial Delay | Period | Failure Threshold | Max Wait |
|-------|----------|---------------|--------|-------------------|----------|
| **startup** | `/actuator/health` | 10s | 5s | 30 | 150s total |
| **liveness** | `/actuator/health` | 60s | 15s | 5 | 75s total |
| **readiness** | `/actuator/health` | 30s | 10s | 3 | 30s total |

- **Startup probe** gives the JVM up to 150 seconds to start (including Flyway migrations) before Kubernetes kills the pod. Liveness probe is disabled until startup succeeds.
- **Liveness probe** detects deadlocked/unresponsive JVM. Five consecutive failures trigger a pod restart.
- **Readiness probe** checks that the pod can serve traffic. A failed readiness probe removes the pod from the Service endpoints without restarting it.

## Secrets Management

Secrets are split into two objects for separate lifecycle management:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mozhno-db
  labels:
    app: mozhno
type: Opaque
stringData:
  url: jdbc:postgresql://postgres-service:5432/feature_flags
  username: flags_user
  password: change-me
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

In production, use External Secrets Operator:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: mozhno-db
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: mozhno-db
  data:
    - secretKey: url
      remoteRef:
        key: mozhno/production/database-url
    - secretKey: username
      remoteRef:
        key: mozhno/production/database-username
    - secretKey: password
      remoteRef:
        key: mozhno/production/database-password
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: mozhno-jwt
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: mozhno-jwt
  data:
    - secretKey: secret
      remoteRef:
        key: mozhno/production/jwt-secret
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
  CACHE_TTL_MINUTES: "5"
  LOG_LEVEL_APP: "INFO"
```

## Security Context

| Setting | Value | Effect |
|---------|-------|--------|
| `runAsNonRoot` | `true` | Block containers that run as root |
| `runAsUser` | `1000` | Mozhno user inside the image |
| `allowPrivilegeEscalation` | `false` | No `setuid` binaries |
| `capabilities.drop` | `ALL` | No Linux capabilities |

## Resource Tuning

Adjust resource requests and limits based on observed usage:

```bash
kubectl top pods -l app=mozhno
```

General guidance:

| Workload Size | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---------------|-------------|-----------|----------------|--------------|
| Small (<100 flags) | 100m | 500m | 256Mi | 1Gi |
| Medium (100-1000 flags) | 250m | 2000m | 512Mi | 2Gi |
| Large (1000+ flags) | 500m | 4000m | 1Gi | 4Gi |

The `MaxRAMPercentage=75.0` JVM flag means the heap will use 75% of the memory limit. For a 2Gi limit, that's 1.5Gi heap, leaving ~500Mi for off-heap memory, Metaspace, thread stacks, and OS overhead.

## Verification

After deploying, verify everything is healthy:

```bash
kubectl get pods -l app=mozhno
kubectl get hpa mozhno-hpa
kubectl get pdb mozhno-pdb
kubectl get svc mozhno-server
kubectl logs -l app=mozhno --tail=20
```

## Related Pages

- [Docker](/en/self-hosting/docker) — Single-node deployment
- [Database](/en/self-hosting/database) — PostgreSQL setup and backups
- [Scaling](/en/self-hosting/scaling) — Horizontal scaling architecture
