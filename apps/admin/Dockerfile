# Production admin image — build the SPA, serve static files with Nginx (SPA fallback under /admin/).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/admin/package.json apps/admin/
RUN npm ci
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/admin apps/admin
RUN npm run build --workspace apps/admin

FROM nginx:alpine AS runtime
# React Router SPA (ssr:false) emits a client build under build/client.
COPY --from=build /app/apps/admin/build/client /usr/share/nginx/html/admin
COPY apps/admin/nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
