#==================================================
# Build Layer
FROM node:14-slim as build

WORKDIR /api

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

#==================================================
# Package install Layer
FROM node:14-slim as node_modules

WORKDIR /api

COPY package.json package-lock.json ./

RUN npm ci --only=production

#==================================================
# Run Layer
FROM gcr.io/distroless/nodejs:14

WORKDIR /api

ENV NODE_ENV=production

COPY --from=build /api/dist /api/dist
COPY --from=node_modules /api/node_modules /api/node_modules

CMD ["dist/main"]
