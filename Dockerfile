FROM node:23 AS builder

WORKDIR /app

RUN apt update -y && apt upgrade -y

RUN apt install ca-certificates curl \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
 && chmod a+r /etc/apt/keyrings/docker.asc \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list \
 && apt update \
 && apt install -y docker-ce-cli

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

RUN chmod +x docker/entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["docker/entrypoint.sh"]

CMD ["node", "arte", "serve"]