# Schnupper-Hub – Self-Hosting-Image für Coolify/Docker
# Next.js Standalone-Build. Daten liegen in DATA_DIR (Volume mounten!).

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Daten-Verzeichnis – hier ein Coolify-Volume einhängen, sonst gehen Daten beim Neustart verloren
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
