#FROM node:current-alpine3.14
FROM node:lts-alpine3.14

WORKDIR /usr/app

COPY . .

# RUN yarn install --frozen-lockfile --production
RUN yarn install

RUN yarn build:heap

CMD ["yarn", "start"]
