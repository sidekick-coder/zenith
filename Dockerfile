FROM node:22-alpine AS system

WORKDIR /app

RUN apk add --no-cache \
  ca-certificates \
  curl \
  docker-cli \
  git \
  openssh-client \
  python3 \
  make \
  g++

RUN git config --global user.name "zenith-docker" && git config --global user.email "zenith-docker@sample.com"

FROM system AS deps

COPY package.json package-lock.json* ./

RUN npm install


FROM deps AS build

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV RUNTIME_CONFIG_PATH=/tmp/runtime-config.txt

EXPOSE 3000

ENTRYPOINT ["node", "zenith", "serve"]
