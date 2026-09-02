# Production API image — multi-stage. Builds shared + api, runs prisma migrate deploy at start.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN npm ci
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npx --workspace apps/api prisma generate \
  && npm run build --workspace apps/api

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN npm ci --omit=dev
COPY --from=build /app/packages/shared/src packages/shared/src
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
EXPOSE 3001
# Apply migrations then start.
CMD ["sh", "-c", "npx --workspace apps/api prisma migrate deploy && node apps/api/dist/server.js"]
