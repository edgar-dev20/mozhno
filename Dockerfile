# Mozhno Feature Flags Server
#
# Multi-stage Docker build:
#   1. web-builder   — Node.js, builds the React UI static assets
#   2. java-builder  — JDK + Gradle, compiles the Spring Boot fat JAR
#   3. runtime       — minimal JRE image to run the application

# ── Web UI builder ──────────────────────────────────────────────
FROM node:25-alpine AS web-builder
WORKDIR /src/web

COPY web/package.json web/package-lock.json ./
RUN npm ci --ignore-scripts

COPY web/ ./
RUN npx vite build --outDir /static --emptyOutDir --config vite.config.js

# ── Java / Gradle builder ───────────────────────────────────────
FROM eclipse-temurin:25-jdk-alpine AS java-builder
WORKDIR /src

COPY server/gradlew server/gradlew.bat server/settings.gradle server/build.gradle ./server/
COPY server/gradle/ ./server/gradle/
COPY server/mozhno-spi/ ./server/mozhno-spi/
COPY server/mozhno-core/ ./server/mozhno-core/
COPY server/mozhno-web-api/ ./server/mozhno-web-api/
COPY server/mozhno-app/ ./server/mozhno-app/

COPY --from=web-builder /static ./server/mozhno-app/src/main/resources/static

WORKDIR /src/server
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew --no-daemon :mozhno-app:bootJar -x javadoc

# ── Runtime ────────────────────────────────────────────────────
FROM eclipse-temurin:25-jre-noble AS runtime

LABEL org.opencontainers.image.title="Mozhno Feature Flags Server" \
      org.opencontainers.image.description="Self-hosted feature flag management platform with native SDKs" \
      org.opencontainers.image.url="https://github.com/mozhno-dev/mozhno" \
      org.opencontainers.image.source="https://github.com/mozhno-dev/mozhno" \
      org.opencontainers.image.licenses="BUSL-1.1" \
      org.opencontainers.image.vendor="Mozhno"

RUN apt-get update && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r mozhno && useradd -r -g mozhno mozhno

COPY --from=java-builder /src/server/mozhno-app/build/libs/mozhno.jar /app/mozhno.jar

USER mozhno
EXPOSE 8080

EXPOSE 9090

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget -q -O - http://localhost:9090/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseZGC", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "/app/mozhno.jar"]
