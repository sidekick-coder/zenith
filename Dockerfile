FROM node:23 AS builder

WORKDIR /app

RUN apt update -y && apt upgrade -y

RUN apt-get install -y docker-ce-cli

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

RUN chmod +x docker/entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["docker/entrypoint.sh"]

CMD ["node", "arte", "serve"]