FROM node:16

WORKDIR /api

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

CMD ["npm", "run", "start:dev"]
