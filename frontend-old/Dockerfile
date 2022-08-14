FROM node:16

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache

CMD ["npm", "start"]
