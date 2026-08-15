# ============================================================================
# sdCart frontend — production multi-stage Docker build (Vite + Nginx)
#
# The API base URL is a BUILD ARG (VITE_API_BASE_URL), never hard-coded and
# never baked from a local .env — the .env file is excluded via .dockerignore.
# Provide it explicitly:
#   docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t sdcart-frontend .
# Docker compose and Render both inject it from deployment configuration.
# ============================================================================

# ---- Build stage -----------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first (cached unless package-lock.json changes)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Fail the build loudly when the deployment configuration is missing rather
# than shipping a frontend that silently points at localhost.
ARG VITE_API_BASE_URL
RUN test -n "$VITE_API_BASE_URL" \
    || (echo "ERROR: VITE_API_BASE_URL build arg is required (e.g. https://sdcart-backend.onrender.com)" >&2 && exit 1)
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Runtime stage ---------------------------------------------------------
FROM nginx:1.27-alpine

# SPA routing, compression, caching and security headers (see nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
