FROM node:lts-iron as dep

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

FROM node:lts-alpine3.19 as stage

WORKDIR /app

COPY . .
COPY --from=dep  /app/node_modules ./node_modules
COPY --from=dep  /app/package.json ./package.json

FROM node:lts-alpine3.19 as build

WORKDIR /app

COPY --from=stage /app ./

RUN npm run build

FROM node:lts-iron as prod

# OpenSSL 1.1.1 fix
RUN mkdir -p .ci-cache && if [ ! -f .ci-cache/libssl1.1_1.1.1f-1ubuntu2_amd64.deb ]; then wget -P .ci-cache http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb; fi && dpkg -i .ci-cache/libssl1.1_1.1.1f-1ubuntu2_amd64.deb

WORKDIR /app

USER node 

RUN chown -R node:node /app

COPY --from=build --chown=node:node /app ./

CMD ["npm", "run", "start"]

FROM node:lts-iron as dev

WORKDIR /app

USER node

COPY --from=stage --chown=node:node /app/node_modules ./node_modules
COPY --from=stage --chown=node:node ./app/package.json ./package.json
COPY --from=stage --chown=node:node ./app/.env ./.env
COPY --from=stage --chown=node:node ./app/tsconfig.json ./tsconfig.json 

CMD ["npm", "run", "dev"]


