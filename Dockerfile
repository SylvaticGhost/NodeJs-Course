FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node app.js"]
