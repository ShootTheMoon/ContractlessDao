FROM node:lts-alpine3.19 as dep

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

FROM node:lts-alpine3.19 as stage

WORKDIR /app

COPY . .
COPY --from=dep  /app/node_modules ./node_modules
COPY --from=dep ./app/package.json ./package.json

FROM node:lts-alpine3.19 as build

WORKDIR /app

COPY --from=stage /app ./

RUN npm run build

FROM node:lts-alpine3.19 as prod

WORKDIR /app

USER node 

COPY --from=buid --chown=user:group /app ./

CMD ["npm", "run", "start"]

FROM node:lts-alpine3.19 as dev

WORKDIR /app

USER node

COPY --from=stage  /app/node_modules ./node_modules
COPY --from=stage ./app/package.json ./package.json
COPY --from=stage ./app/.env ./.env
COPY --from=stage ./app/tsconfig.json ./tsconfig.json 

CMD ["npm", "run", "dev"]


