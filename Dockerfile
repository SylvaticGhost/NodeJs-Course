FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
