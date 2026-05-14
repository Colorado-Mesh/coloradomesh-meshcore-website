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

FROM --platform=$BUILDPLATFORM golang:1.22-alpine AS corescope-builder
ARG TARGETOS
ARG TARGETARCH
ARG CORESCOPE_VERSION=unknown
ARG CORESCOPE_COMMIT=unknown
ARG BUILD_TIME=unknown
WORKDIR /build/corescope
COPY vendor/CoreScope/ ./

WORKDIR /build/corescope/cmd/server
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64} \
  go build -ldflags "-X main.Version=${CORESCOPE_VERSION} -X main.Commit=${CORESCOPE_COMMIT} -X main.BuildTime=${BUILD_TIME}" -o /corescope-server .

WORKDIR /build/corescope/cmd/ingestor
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64} \
  go build -o /corescope-ingestor .

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=127.0.0.1 \
    PORT=3001 \
    CORESCOPE_HOST=127.0.0.1 \
    CORESCOPE_PORT=3002 \
    CORESCOPE_CONFIG_DIR=/app/corescope \
    CORESCOPE_DB_PATH=/app/corescope/data/meshcore.db \
    CORESCOPE_PUBLIC_DIR=/app/corescope/public \
    CORESCOPE_MQTT_SERVER=meshcore_mqtt.coloradomesh.org \
    CORESCOPE_MQTT_PORT=8883 \
    CORESCOPE_MQTT_TRANSPORT=websockets \
    CORESCOPE_MQTT_TLS_ENABLED=true \
    CORESCOPE_MQTT_SOURCE_NAME=coloradomesh \
    CORESCOPE_MQTT_USERNAME=website \
    CORESCOPE_MQTT_PASSWORD_FILE=/run/secrets/corescope_mqtt_password \
    CORESCOPE_ENABLE_INGESTOR=auto \
    CORESCOPE_INGESTOR_STATS=/app/corescope/data/ingestor-stats.json \
    MESHCORE_MAP_SAMPLE_DATA=false \
    MESHCORE_MAP_DEMO_MODE=false \
    MESHCORE_LIVE_MAP_API_URL=http://127.0.0.1:3002/api/nodes \
    MESHCORE_LIVE_MAP_API_REFRESH_SECONDS=30

RUN apk add --no-cache nginx supervisor sqlite ca-certificates tzdata \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /run/nginx /var/log/nginx /app/corescope/data /app/corescope/public

COPY --from=next-builder --chown=nextjs:nodejs /app/public ./public
COPY --from=next-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=next-builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=corescope-builder /corescope-server /usr/local/bin/corescope-server
COPY --from=corescope-builder /corescope-ingestor /usr/local/bin/corescope-ingestor
COPY --from=next-builder /app/vendor/CoreScope/public /app/corescope/public
COPY --from=next-builder /app/vendor/CoreScope/config.example.json /app/corescope/config.example.json
COPY --from=next-builder /app/vendor/CoreScope/channel-rainbow.json /app/corescope/channel-rainbow.json

COPY corescope-overlay /app/corescope-overlay
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/start.sh /usr/local/bin/start.sh
COPY scripts/render-corescope-config.mjs /usr/local/bin/render-corescope-config.mjs
COPY scripts/apply-corescope-overlay.mjs /usr/local/bin/apply-corescope-overlay.mjs
RUN chmod +x /usr/local/bin/start.sh /usr/local/bin/render-corescope-config.mjs /usr/local/bin/apply-corescope-overlay.mjs \
  && /usr/local/bin/apply-corescope-overlay.mjs /app/corescope/public /app/corescope-overlay \
  && chown -R nextjs:nodejs /app/corescope /app/corescope-overlay /app/public /app/.next

VOLUME ["/app/corescope/data"]
EXPOSE 3000

CMD ["/usr/local/bin/start.sh"]
