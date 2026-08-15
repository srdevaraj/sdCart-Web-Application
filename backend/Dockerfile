# ============================================================================
# sdCart backend — production multi-stage Docker build
#
# No secrets are baked into this image. Every credential (JWT_SECRET,
# DATABASE_*, ADMIN_PASSWORD, STRIPE_*, ...) is injected at runtime via
# environment variables. In production use SPRING_PROFILES_ACTIVE=prod, which
# fails startup when the default dev JWT secret is used.
# ============================================================================

# ---- Build stage -----------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies before copying sources. The BuildKit cache mount keeps
# the Maven repository across builds (faster rebuilds locally and in CI); it
# is ignored gracefully when BuildKit is not available.
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests package

# ---- Runtime stage ---------------------------------------------------------
FROM eclipse-temurin:21-jre

# curl is used by container health checks (docker compose, Render).
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /usr/sbin/nologin sdcart

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Run as a non-root user.
USER sdcart
EXPOSE 8080

# Production profile by default — override for local development with
# SPRING_PROFILES_ACTIVE=dev.
# JVM settings sized for containers (heap capped as % of the container limit,
# exit on OOM so the orchestrator can restart the instance).
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

# Port: Render injects $PORT; otherwise SERVER_PORT (default 8080).
# Health: /actuator/health (Spring Boot Actuator, probes enabled).
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
