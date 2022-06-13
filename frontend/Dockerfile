FROM node:16

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

CMD ["npm", "start"]
