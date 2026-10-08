# syntax=docker/dockerfile:1.7
# Imaginea site-ului mobo.md pentru VPS (Coolify). Pe Vercel fișierul e ignorat.
#
# Build cu toate dependențele (next build are nevoie de typescript etc.), apoi
# o imagine de rulare doar cu dependențele de producție. Optimizarea imaginilor
# (next/image → sharp) rulează în container; cache-ul ei stă în .next/cache.

FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM base AS run
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app ./
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
