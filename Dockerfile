# FROM node:lts-alpine3.15
FROM node:20-alpine

WORKDIR /usr/app

COPY . .

# RUN yarn install --frozen-lockfile --production
RUN yarn install --frozen-lockfile
# RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked yarn --frozen-lockfile --ignore-opcional --ignore-engines

RUN yarn build:heap

CMD ["yarn", "start"]
