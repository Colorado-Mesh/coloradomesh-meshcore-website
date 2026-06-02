# syntax=docker/dockerfile:1

ARG BUILDPLATFORM=linux/amd64
ARG TARGETOS
ARG TARGETARCH

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS next-builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=127.0.0.1 \
    PORT=3001

RUN apk add --no-cache nginx supervisor sqlite ca-certificates tzdata \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /run/nginx /var/log/nginx /app/corescope/data /app/corescope/public

COPY --from=next-builder --chown=nextjs:nodejs /app/public ./public
COPY --from=next-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=next-builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh \
  && chown -R nextjs:nodejs /app/public /app/.next

EXPOSE 3000

CMD ["/usr/local/bin/start.sh"]
