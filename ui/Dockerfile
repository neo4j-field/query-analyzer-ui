FROM node:20
WORKDIR /app

COPY public ./public
COPY src ./src
COPY .env.template ./.env.devlocal.local
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

RUN npm install
EXPOSE 5173
CMD ["npm", "run", "serve"]