# syntax=docker/dockerfile:1

# Base para instalar deps de build (better-sqlite3)
FROM node:20-bullseye-slim AS deps
WORKDIR /app

# Instalar ferramentas de build necessárias para native addons
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential python3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copiar manifests para cache eficiente
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

# Instalar dependências
RUN npm ci && \
    cd server && npm ci && \
    cd ../client && npm ci

# Build client e server
FROM deps AS build
WORKDIR /app
COPY server ./server
COPY client ./client
RUN npm run build:client && npm run build:server

# Runtime mínimo com apenas deps de produção do server
FROM node:20-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Instalar ferramentas mínimas para eventuais rebuilds de native addons
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copiar node_modules do server já compilados (inclui native addons como better-sqlite3)
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY server/package.json ./server/package.json

# Copiar artefatos compilados e frontend
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist

# Expor porta e definir comando
EXPOSE 3001
CMD ["node", "server/dist/index.js"]