# Production image for the website (used by the VPS deploy in the backend repo: deploy/docker-compose.yml).
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# NEXT_PUBLIC_* values are baked into the browser code at build time.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=""
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY=""
ARG NEXT_PUBLIC_PAYMENTS_SIMULATE=false
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=$NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    NEXT_PUBLIC_PAYMENTS_SIMULATE=$NEXT_PUBLIC_PAYMENTS_SIMULATE \
    NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build /app ./
USER node
EXPOSE 3000
CMD ["npm", "start"]
