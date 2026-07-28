# ---- Build stage ----
# Playwright's own image ships Node + Chromium + all system deps needed to
# prerender routes during `npm run build` (see scripts/prerender.mjs) — avoids
# hand-rolling Alpine's missing shared libs for headless Chromium.
FROM mcr.microsoft.com/playwright:v1.61.0-noble AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Public anon key + URL only (never the service_role key) — needed at build
# time so scripts/prerender.mjs can list published tour slugs. Set these as
# Build-Time Variables in Coolify; the same values are already injected at
# container runtime via docker-entrypoint-env.sh, this just also exposes them
# to `npm run build`.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
# nginx config (SPA fallback + security headers + caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Runtime env injection for VITE_ vars (Coolify sets them as container env)
COPY docker-entrypoint-env.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh
# Built SPA
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
