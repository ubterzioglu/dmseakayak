# Static site served by nginx — ideal for Coolify Dockerfile deployments.
FROM nginx:1.27-alpine

# Serve our static files
COPY index.html /usr/share/nginx/html/index.html
COPY mvp.html /usr/share/nginx/html/mvp.html
COPY logo.png /usr/share/nginx/html/logo.png
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Coolify health checks and proxies expect the app on port 80
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
