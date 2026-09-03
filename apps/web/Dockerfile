# Production storefront image — React Router 7 SSR served by react-router-serve.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN npm ci
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN npm run build --workspace apps/web

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN npm ci --omit=dev
COPY --from=build /app/packages/shared/src packages/shared/src
COPY --from=build /app/apps/web/build apps/web/build
COPY --from=build /app/apps/web/server.js apps/web/server.js
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "apps/web"]
