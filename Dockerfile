ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS base

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./


FROM base AS deps

RUN npm ci

COPY . .


FROM deps AS test

CMD ["npm", "test"]


FROM base AS production

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]