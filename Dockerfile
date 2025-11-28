# Multi-stage build para otimizar o tamanho da imagem

# Stage 1: Build do Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build do Backend
FROM node:18-alpine AS backend-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Produção
FROM node:18-alpine
WORKDIR /app

# Copiar dependências e builds
COPY --from=backend-build /app/server/dist ./server/dist
COPY --from=backend-build /app/server/package*.json ./server/
COPY --from=frontend-build /app/client/dist ./client/dist

# Instalar apenas dependências de produção
WORKDIR /app/server
RUN npm ci --only=production

# Criar diretório para banco de dados
RUN mkdir -p /app/server/data

# Expor porta
EXPOSE 3002

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3002
ENV DB_FILE=/app/server/data/db.sqlite

# Comando de inicialização
CMD ["node", "dist/index.js"]
