# ---- Build stage ----
# Plain Alpine + Node: npm ci (incl. native deps like sharp) and the Vite
# build. Kept separate from the Playwright stage below so a heavy ~1GB
# browser image never touches npm ci — that combination was enough to crash
# the build container (exit 255, no error output) on constrained deploy
# hosts.
FROM node:22-alpine AS build
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
RUN npx vite build

# ---- Prerender stage ----
# Playwright's own image ships Chromium + every system lib it needs — only
# this stage pays that cost, and only to run one script against the already
#-built dist/.
FROM mcr.microsoft.com/playwright:v1.61.0-noble AS prerender
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY scripts/prerender.mjs ./scripts/prerender.mjs
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
RUN node scripts/prerender.mjs

# ---- Runtime stage ----
FROM nginx:1.27-alpine
# nginx config (SPA fallback + security headers + caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Runtime env injection for VITE_ vars (Coolify sets them as container env)
COPY docker-entrypoint-env.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh
# Built + prerendered SPA
COPY --from=prerender /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
